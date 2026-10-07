const router = require('express').Router();
const { Report, Player } = require('../models');
const coachOnly = require('../middleware/coachOnly');
const log = require('../log');

// coach: add a season report
router.post('/', coachOnly, async (req, res) => {
  try {
    const report = await Report.create(req.body);
    const p = await Player.findById(report.player);
    log(req, 'report_added', 'coach', req.user.name, `${p ? p.name : report.player}, ${report.season}`);
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// player: own reports, newest first
router.get('/player/:id', async (req, res) => {
  res.json(await Report.find({ player: req.params.id }).sort('-createdAt'));
});

// coach: delete a report
router.delete('/:id', coachOnly, async (req, res) => {
  const report = await Report.findByIdAndDelete(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  log(req, 'report_deleted', 'coach', req.user.name, report.season);
  res.json({ message: 'Report deleted' });
});

module.exports = router;
