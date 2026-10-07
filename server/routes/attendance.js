const router = require('express').Router();
const { Attendance } = require('../models');
const coachOnly = require('../middleware/coachOnly');
const log = require('../log');

// coach: save one day's attendance
// body: { date: '2026-10-02', records: [{ player: '<id>', present: true }] }
router.post('/', coachOnly, async (req, res) => {
  const { date, records } = req.body;
  if (!date || !records) return res.status(400).json({ error: 'date and records are required' });

  // upsert = update if the row exists, otherwise create it
  const ops = records.map((r) => ({
    updateOne: {
      filter: { player: r.player, date },
      update: { $set: { present: r.present } },
      upsert: true,
    },
  }));
  await Attendance.bulkWrite(ops);
  log(req, 'attendance_saved', 'coach', req.user.name, `${date}, ${records.length} players`);
  res.status(201).json({ message: 'Attendance saved', count: records.length });
});

// coach: attendance of all players for a date  (?date=2026-10-02)
router.get('/', coachOnly, async (req, res) => {
  res.json(await Attendance.find({ date: req.query.date }));
});

// player: own history, newest first
router.get('/player/:id', async (req, res) => {
  res.json(await Attendance.find({ player: req.params.id }).sort('-date'));
});

module.exports = router;
