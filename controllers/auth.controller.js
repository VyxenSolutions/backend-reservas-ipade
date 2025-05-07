const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { generateToken } = require('../services/jwt.service');
const crypto = require('crypto');
const { sendEmail } = require('../services/mail.service');
const { getResetPasswordTemplate } = require('../services/mail.templates');

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

    console.log(password)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = generateToken({ id: user._id, role: user.role });

    const userData = {
      userId: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      fullname: `${user.name} ${user.lastName} ${user.maternalLastName}`
    }

    res.status(200).json({ token, userData});
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'Si el correo existe, se envió un enlace.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 min
    await user.save();

    const resetLink = `https://app.heyopen.mx/reset-password?token=${token}`;
    const { subject, text, html } = getResetPasswordTemplate(resetLink);
    await sendEmail({ to: email, subject, text, html });

    res.status(200).json({ message: 'Correo enviado si el usuario existe.' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Token inválido o expirado' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};
