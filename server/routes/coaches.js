const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Coach } = require('../models');
const { loginLimiter, playerLimiter } = require('../middleware/limiter');
const log = require('../log');

// used when the phone is unknown, so a wrong phone takes as long as a wrong password
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

// a new coach asks for an account, the admin has to approve it
router.post('/register', playerLimiter, async (req, res) => {
  const name = String(req.body.name || '').trim();
  const phone = String(req.body.phone || '');
  const password = String(req.body.password || '');

  if (name.length < 3 || !/^[6-9]\d{9}$/.test(phone) || password.length < 8) {
    return res.status(400).json({ error: 'Check the name, 10 digit phone and password (min 8 characters)' });
  }
  try {
    await Coach.create({ name, phone, passwordHash: await bcrypt.hash(password, 10) });
    log(req, 'coach_registered', 'coach', name, phone);
    res.status(201).json({ message: 'Request sent. You can log in after the admin approves it.' });
  } catch (err) {
    res.status(400).json({ error: err.code === 11000 ? 'This phone number is already registered' : err.message });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const phone = String(req.body.phone || '');
  const password = String(req.body.password || '');

  const coach = await Coach.findOne({ phone });
  const passwordOk = await bcrypt.compare(password, coach ? coach.passwordHash : DUMMY_HASH);

  if (!coach || !passwordOk) {
    log(req, 'coach_login_failed', 'coach', phone);
    return res.status(401).json({ error: 'Wrong phone number or password' });
  }
  if (coach.status !== 'approved') {
    log(req, 'coach_login_blocked', 'coach', coach.name, coach.status);
    return res.status(403).json({ error: coach.status === 'pending' ? 'Waiting for admin approval' : 'Your request was rejected' });
  }

  log(req, 'coach_login', 'coach', coach.name);
  const token = jwt.sign({ role: 'coach', id: coach._id, name: coach.name }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

module.exports = router;
