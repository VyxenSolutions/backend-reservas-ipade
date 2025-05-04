const Reservation = require('../models/reservation.model');
const User = require('../models/user.model');
const Court = require('../models/court.model');
const { parseISO, isAfter, isBefore } = require('date-fns');

exports.getAdminMetrics = async (req, res, next) => {
  try {
    const from = req.query.from ? parseISO(req.query.from) : null;
    const to = req.query.to ? parseISO(req.query.to) : null;

    const dateFilter = from && to
      ? { date: { $gte: req.query.from, $lte: req.query.to } }
      : {};

    const reservations = await Reservation.find(dateFilter);
    const courts = await Court.find();
    const users = await User.find();

    // Total de reservas
    const totalReservations = reservations.length;

    // Horarios más utilizados
    const timeMap = {};
    reservations.forEach(r => {
      timeMap[r.startTime] = (timeMap[r.startTime] || 0) + 1;
    });

    const sortedTimes = Object.entries(timeMap).sort((a, b) => b[1] - a[1]);
    const peakHours = sortedTimes.slice(0, 3);
    const lowHours = sortedTimes.slice(-3);

    // Tasa de ocupación (simplificada)
    const totalSlots = courts.length * 10 * (from && to ? (to - from) / (1000 * 60 * 60 * 24) : 30);
    const occupancyRate = ((totalReservations / totalSlots) * 100).toFixed(2);

    // Frecuencia de reservas por usuario
    const reservationCountByUser = {};
    reservations.forEach(r => {
      reservationCountByUser[r.createdBy] = (reservationCountByUser[r.createdBy] || 0) + 1;
    });
    const avgReservationsPerUser = (Object.values(reservationCountByUser).reduce((a, b) => a + b, 0) / users.length).toFixed(2);

    // Inasistencias (reservas no confirmadas)
    const inasistencias = reservations.filter(r => !r.confirmedBy || r.confirmedBy.length === 0).length;
    const inasistenciaRate = ((inasistencias / totalReservations) * 100).toFixed(2);

    // Usuarios suspendidos
    const suspendedUsers = users.filter(u => u.status === 'suspended').length;

    res.status(200).json({
      totalReservations,
      occupancyRate: `${occupancyRate}%`,
      peakHours,
      lowHours,
      avgReservationsPerUser,
      inasistenciaRate: `${inasistenciaRate}%`,
      suspendedUsers
    });

  } catch (err) {
    next(err);
  }
};
