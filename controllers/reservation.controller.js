const Reservation = require("../models/reservation.model");
const Court = require("../models/court.model");
const User = require("../models/user.model");
const { isBefore, parse, addMinutes, format } = require("date-fns");

exports.createReservation = async (req, res, next) => {
  try {
    const { courtId, date, startTime, modality, playerEmails = [] } = req.body;
    const userId = req.user.id;

    const court = await Court.findById(courtId);
    if (!court)
      return res.status(404).json({ message: "Cancha no encontrada" });

    /* if (!court.available || court.blockedDays.includes(format(new Date(date), 'EEEE').toLowerCase())) {
      return res.status(400).json({ message: 'La cancha no está disponible ese día' });
    } */

    const reservationDuration = court.reservationDuration;
    console.log("Hora inicio:", startTime);
    console.log(court);
    const endTime = format(
      addMinutes(parse(startTime, "HH:mm", new Date()), reservationDuration),
      "HH:mm"
    );

    console.log("Duración:", court.reservationDuration);

    // Validar que el slot esté dentro del horario
    const parsedStart = parse(startTime, "HH:mm", new Date());
    const parsedOpen = parse(court.openingTime, "HH:mm", new Date());
    const parsedClose = parse(court.closingTime, "HH:mm", new Date());

    console.log("parsed start:", parsedStart);

    if (
      isBefore(parsedStart, parsedOpen) ||
      !isBefore(addMinutes(parsedStart, reservationDuration), parsedClose)
    ) {
      return res
        .status(400)
        .json({ message: "Horario fuera del rango permitido" });
    }

    // Validar que el usuario no tenga otra reserva en < 24h
    const existingReservations = await Reservation.find({
      createdBy: userId,
      date,
    });

    for (const r of existingReservations) {
      const now = new Date();
      const rDateTime = new Date(`${r.date}T${r.startTime}`);
      if (Math.abs(rDateTime - now) < 24 * 60 * 60 * 1000) {
        return res
          .status(400)
          .json({
            message: "Ya tienes una reserva activa dentro de las próximas 24h",
          });
      }
    }

    // Validar modalidad y jugadores
    if (modality === "singles" && playerEmails.length < 1) {
      return res
        .status(400)
        .json({
          message: "Debes incluir 1 jugador adicional para modalidad singles",
        });
    }

    if (
      modality === "dobles" &&
      (playerEmails.length < 2 || playerEmails.length > 3)
    ) {
      return res
        .status(400)
        .json({
          message: "En dobles puedes invitar de 1 a 3 jugadores adicionales",
        });
    }

    const players = await Promise.all(
      playerEmails.map(async (email) => {
        const player = await User.findOne({ email });
        if (!player)
          throw new Error(`No se encontró jugador con correo ${email}`);
        return player._id;
      })
    );

    // Verificar que el horario no esté ocupado
    const conflict = await Reservation.findOne({
      court: courtId,
      date,
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (conflict)
      return res.status(400).json({ message: "El horario ya está reservado" });

    const reservation = await Reservation.create({
      court: courtId,
      createdBy: userId,
      players,
      date,
      startTime,
      endTime,
      modality,
    });

    res.status(201).json({ message: "Reserva creada", reservation });
  } catch (err) {
    next(err);
  }
};

exports.confirmReservation = async (req, res, next) => {
  try {
    const { courtId, userId, date, time } = req.query;

    const reservation = await Reservation.findOne({
      court: courtId,
      date,
      $or: [{ createdBy: userId }, { players: userId }],
      startTime: time,
    });

    if (!reservation) {
      return res
        .status(404)
        .json({
          message:
            "No se encontró reserva activa para ese usuario en ese horario y cancha",
        });
    }

    // Puedes agregar un campo de confirmación en el modelo:
    // confirmedBy: [userId]
    if (!reservation.confirmedBy) reservation.confirmedBy = [];
    if (!reservation.confirmedBy.includes(userId)) {
      reservation.confirmedBy.push(userId);
      await reservation.save();
    }

    return res.status(200).json({
      message: "Reserva confirmada con éxito",
      reservationId: reservation._id,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyReservations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const reservations = await Reservation.find({
      $or: [{ createdBy: userId }, { players: userId }],
    })
      .populate("court", "name code location")
      .populate("players", "name email")
      .sort({ date: -1, startTime: 1 });

    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
};
 