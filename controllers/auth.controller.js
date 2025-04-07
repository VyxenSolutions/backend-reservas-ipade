const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { generateToken } = require('../services/jwt.service');

exports.register = async (req, res, next) => {
  try {
    const { personalInfo, sportsProfile } = req.body;

    const exists = await User.findOne({ email: personalInfo.email });
    if (exists) return res.status(400).json({ message: 'El correo ya está registrado.' });

    const user = new User({
      ...personalInfo,
      ...sportsProfile,
      role: 'player', // por default
      onboardingCompleted: false
    });

    await user.save();

    const token = generateToken({ id: user._id, role: user.role });

    const userData = {
      userId: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    }

    res.status(201).json({ token, userData});
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = generateToken({ id: user._id, role: user.role });

    const userData = {
      userId: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    }

    res.status(200).json({ token, userData});
  } catch (err) {
    next(err);
  }
};
