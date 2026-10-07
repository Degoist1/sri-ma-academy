const router = require('express').Router();
const { Fee, Player } = require('../models');
const coachOnly = require('../middleware/coachOnly');
const log = require('../log');

// coach: all fee records of one month  (?month=2026-10)
router.get('/', coachOnly, async (req, res) => {
  res.json(await Fee.find({ month: req.query.month }));
});

// player: own fee records
router.get('/player/:id', async (req, res) => {
  res.json(await Fee.find({ player: req.params.id }).sort('-month'));
});

// coach: mark a month paid / unpaid
// body: { player, month, amount, paid, mode }
router.put('/', coachOnly, async (req, res) => {
  const { player, month, amount, paid, mode } = req.body;
  if (!player || !month) return res.status(400).json({ error: 'player and month are required' });

  const fee = await Fee.findOneAndUpdate(
    { player, month },
    { amount, paid, mode, paidOn: paid ? new Date() : null },
    { new: true, upsert: true }
  );
  const p = await Player.findById(player);
  log(req, 'fee_updated', 'coach', req.user.name, `${p ? p.name : player}, ${month}, ${paid ? 'paid' : 'unpaid'}`);
  res.json(fee);
});

module.exports = router;
