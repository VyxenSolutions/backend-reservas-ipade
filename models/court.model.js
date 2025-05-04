const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  available: { type: Boolean, default: true },
  openingTime: { type: String, required: true },
  closingTime: { type: String, required: true },
  blockedDays: [{ type: String }],
  reservationDuration: {
    type: Number,
    enum: [30, 60, 90, 120],
    default: 90
  },
  location: { type: String, default: 'IPADE CDMX' },
  surfaceType: {
    type: String,
    enum: ['sintética', 'cemento', 'otra'],
    default: 'sintética'
  },
  notes: { type: String }
}, {
  timestamps: true
});


module.exports = mongoose.model('Court', courtSchema);
