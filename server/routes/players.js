const router = require('express').Router();
const { Player, Attendance, Fee, Report } = require('../models');
const coachOnly = require('../middleware/coachOnly');
const { playerLimiter } = require('../middleware/limiter');
const log = require('../log');

// register a new player (public, used by the registration form)
router.post('/', async (req, res) => {
  try {
    const player = await Player.create(req.body);
    log(req, 'player_registered', 'player', player.name, player.batch);
    res.status(201).json(player);
  } catch (err) {
    const msg = err.code === 11000 ? 'This phone number is already registered' : err.message;
    res.status(400).json({ error: msg });
  }
});

// player "login": find by phone number
router.get('/phone/:phone', playerLimiter, async (req, res) => {
  const player = await Player.findOne({ phone: req.params.phone });
  if (!player) {
    log(req, 'player_login_failed', 'player', req.params.phone.slice(0, 15));
    return res.status(404).json({ error: 'Player not found' });
  }
  log(req, 'player_login', 'player', player.name);
  res.json(player);
});

// everything below is for the coach
router.get('/', coachOnly, async (req, res) => {
  res.json(await Player.find());
});

router.put('/:id', coachOnly, async (req, res) => {
  const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!player) return res.status(404).json({ error: 'Player not found' });
  log(req, 'player_updated', 'coach', req.user.name, player.name);
  res.json(player);
});

router.delete('/:id', coachOnly, async (req, res) => {
  const player = await Player.findByIdAndDelete(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  // remove the player's other records too
  const filter = { player: req.params.id };
  await Promise.all([Attendance.deleteMany(filter), Fee.deleteMany(filter), Report.deleteMany(filter)]);
  log(req, 'player_deleted', 'coach', req.user.name, player.name);
  res.json({ message: 'Player deleted' });
});

module.exports = router;
