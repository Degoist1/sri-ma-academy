const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Coach, Log } = require('../models');
const adminOnly = require('../middleware/adminOnly');
const { loginLimiter } = require('../middleware/limiter');
const log = require('../log');

// the only admin account lives in .env (username + bcrypt hash), there is no sign-up route
router.post('/login', loginLimiter, async (req, res) => {
  const username = String(req.body.username || '');
  const password = String(req.body.password || '');

  // always check the password, so a wrong username takes as long as a wrong password
  const passwordOk = await bcrypt.compare(password, process.env.ADMIN_PASS_HASH);
  if (username !== process.env.ADMIN_USER || !passwordOk) {
    log(req, 'admin_login_failed', 'admin', username.slice(0, 30));
    return res.status(401).json({ error: 'Wrong username or password' });
  }

  log(req, 'admin_login', 'admin', username);
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// all coach registrations, newest first (the password hash is never sent)
router.get('/coaches', adminOnly, async (req, res) => {
  res.json(await Coach.find().select('-passwordHash').sort('-createdAt'));
});

// approve or reject a coach
router.put('/coaches/:id', adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const coach = await Coach.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-passwordHash');
  if (!coach) return res.status(404).json({ error: 'Coach not found' });

  log(req, 'coach_' + status, 'admin', coach.name);
  res.json(coach);
});

// latest 200 log lines, optional filter  ?role=coach
router.get('/logs', adminOnly, async (req, res) => {
  const filter = req.query.role ? { role: String(req.query.role) } : {};
  res.json(await Log.find(filter).sort('-createdAt').limit(200));
});

module.exports = router;
