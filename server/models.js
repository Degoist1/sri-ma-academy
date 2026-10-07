const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// every collection except Player points to a player like this
const playerRef = { type: Schema.Types.ObjectId, ref: 'Player', required: true };

const Player = model('Player', new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  age: Number,
  parentName: String,
  batch: String,
  monthlyFee: { type: Number, default: 1000 },
}, { timestamps: true }));

const attendanceSchema = new Schema({
  player: playerRef,
  date: { type: String, required: true },   // 'YYYY-MM-DD'
  present: { type: Boolean, default: false },
});
attendanceSchema.index({ player: 1, date: 1 }, { unique: true }); // one row per player per day

const feeSchema = new Schema({
  player: playerRef,
  month: { type: String, required: true },  // 'YYYY-MM'
  amount: Number,
  paid: { type: Boolean, default: false },
  paidOn: Date,
  mode: String,                             // cash / upi
});
feeSchema.index({ player: 1, month: 1 }, { unique: true });

const Report = model('Report', new Schema({
  player: playerRef,
  season: { type: String, required: true }, // e.g. '2026-27 Winter'
  matches: Number,
  rating: { type: Number, min: 1, max: 5 },
  remarks: { type: String, required: true },
}, { timestamps: true }));

// coaches register themselves, the admin approves them
const Coach = model('Coach', new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true }));

// activity log: one row for every login and every data entry
const Log = model('Log', new Schema({
  action: String,   // e.g. 'coach_login_failed'
  role: String,     // player / coach / admin
  who: String,      // name or phone of the person
  detail: String,
  ip: String,
}, { timestamps: { createdAt: true, updatedAt: false } }));

module.exports = {
  Player,
  Coach,
  Log,
  Report,
  Attendance: model('Attendance', attendanceSchema),
  Fee: model('Fee', feeSchema),
};
