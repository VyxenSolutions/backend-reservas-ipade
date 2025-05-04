const Court = require('../models/court.model');
const Reservation = require('../models/reservation.model');
const { parse, addMinutes, format, isBefore, parseISO } = require('date-fns');


exports.createCourt = async (req, res, next) => {
    try {
      const {
        name,
        code,
        openingTime,
        closingTime,
        blockedDays,
        location,
        surfaceType,
        notes
      } = req.body;
  
      const court = await Court.create({
        name,
        code,
        openingTime,
        closingTime,
        blockedDays,
        location,
        surfaceType,
        notes
      });
  
      res.status(201).json({ message: 'Cancha registrada', court });
    } catch (err) {
      next(err);
    }
  };
  

exports.getCourts = async (req, res, next) => {
  try {
    const courts = await Court.find();
    res.status(200).json(courts);
  } catch (err) {
    next(err);
  }
};

exports.toggleAvailability = async (req, res, next) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ message: 'Cancha no encontrada' });

    court.available = !court.available;
    await court.save();

    res.status(200).json({ message: `Cancha ahora está ${court.available ? 'disponible' : 'en mantenimiento'}`, court });
  } catch (err) {
    next(err);
  }
};

exports.getCourtAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'La fecha es obligatoria (YYYY-MM-DD)' });

    const court = await Court.findById(id);
    if (!court) return res.status(404).json({ message: 'Cancha no encontrada' });

    const dayOfWeek = format(parseISO(date), 'EEEE').toLowerCase();
    if (!court.available || court.blockedDays.includes(dayOfWeek)) {
      return res.status(400).json({ message: 'La cancha no está disponible ese día' });
    }

    const duration = court.reservationDuration;
    const slots = [];

    let current = parse(`${date}T${court.openingTime}`, 'yyyy-MM-dd\'T\'HH:mm', new Date());
    const closing = parse(`${date}T${court.closingTime}`, 'yyyy-MM-dd\'T\'HH:mm', new Date());

    while (isBefore(addMinutes(current, duration), addMinutes(closing, 1))) {
      const start = format(current, 'HH:mm');
      const end = format(addMinutes(current, duration), 'HH:mm');
      slots.push({ start, end });
      current = addMinutes(current, duration);
    }

    const reservations = await Reservation.find({ court: id, date });
    const reservedTimes = reservations.map(r => ({ start: r.startTime, end: r.endTime }));

    const availableSlots = slots.filter(slot => {
      return !reservedTimes.some(res =>
        slot.start < res.end && slot.end > res.start // conflicto
      );
    });

    res.status(200).json({
      courtId: id,
      date,
      availableSlots: availableSlots.map(s => `${s.start} - ${s.end}`)
    });

  } catch (err) {
    next(err);
  }
};
