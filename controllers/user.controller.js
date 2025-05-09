const User = require('../models/user.model');
const Reservation = require('../models/reservation.model');
const Court = require('../models/court.model');
const bcrypt = require('bcrypt');

exports.completeOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.id; // lo extraemos del token con el middleware `protect`
    const { interestedSports, otherActivities, communicationPreferences } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        onboarding: {
          interestedSports,
          otherActivities,
          communicationPreferences
        },
        onboardingCompleted: true
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Onboarding completado correctamente',
      onboardingCompleted: updatedUser.onboardingCompleted
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};


exports.updateUser = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.status(200).json({ message: 'Usuario actualizado', user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { email, password, ...rest } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'El email ya está en uso' });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hash,
      ...rest
    });

    res.status(201).json({ message: 'Usuario creado', user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    next(err);
  }
};

exports.searchUsersByEmail = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Falta parámetro de búsqueda' });

    const users = await User.find({
      email: { $regex: q, $options: 'i' }
    }).select('name email');

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Contar reservas y confirmar asistencia
    const allReservations = await Reservation.find({
      $or: [{ createdBy: userId }, { players: userId }]
    });

    const upcomingReservations = allReservations.filter(r => new Date(`${r.date}T${r.startTime}`) > new Date());

    const confirmed = allReservations.filter(r => r.confirmedBy?.includes(userId));
    const lastConfirmed = confirmed.sort((a, b) => new Date(`${b.date}T${b.startTime}`) - new Date(`${a.date}T${a.startTime}`))[0];

    res.status(200).json({
      personal: {
        name: user.name,
        lastName: user.lastName,
        maternalLastName: user.maternalLastName,
        email: user.email,
        phone: user.phone?.internationalNumber || '',
        birthDate: user.birthDate,
        role: user.role,
        status: user.status,
      },
      sportsProfile: {
        gender: user.gender,
        experienceLevel: user.experienceLevel,
        playFrequency: user.playFrequency,
        preferredTime: user.preferredTime,
        preferredRacketSports: user.preferredRacketSports,
        connectWithOthers: user.connectWithOthers,
        interestedInEvents: user.interestedInEvents,
      },
      onboarding: user.onboarding,
      activity: {
        totalReservations: allReservations.length,
        upcomingReservations: upcomingReservations.length,
        lastConfirmedReservation: lastConfirmed
          ? {
              date: lastConfirmed.date,
              time: lastConfirmed.startTime,
              court: await Court.findById(lastConfirmed.court).then(c => c?.name || 'N/A')
            }
          : null,
        noShowCount: user.noShowCount || 0,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};



