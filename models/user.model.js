const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const phoneSchema = new mongoose.Schema({
  countryCode: String,
  dialCode: String,
  e164Number: String,
  internationalNumber: String,
  nationalNumber: String,
  number: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  maternalLastName: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true, select: false },
  birthDate: Date,
  phone: phoneSchema,

  // Perfil deportivo
  gender: String,
  experienceLevel: String,
  playFrequency: String,
  preferredRacketSports: [String],
  preferredTime: String,
  connectWithOthers: Boolean,
  interestedInEvents: Boolean,

  // Rol
  role: {
    type: String,
    enum: ['admin_global', 'devops', 'support', 'auditor', 'player'],
    default: 'player'
  },

  onboarding: {
    interestedSports: [String],
    otherActivities: [String],
    communicationPreferences: [String]
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Encriptar contraseña
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
