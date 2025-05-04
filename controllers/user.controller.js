const User = require('../models/user.model');
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


