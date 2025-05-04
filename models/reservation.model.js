const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // otros jugadores
  date: { type: String, required: true }, // "2025-05-12"
  startTime: { type: String, required: true }, // "18:00"
  endTime: { type: String, required: true }, // "19:30"
  modality: { type: String, enum: ['singles', 'dobles'], required: true },
  confirmedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);
