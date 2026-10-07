const { Log } = require('./models');

// write one line in the activity log (the admin page shows these)
// a logging problem must never break the real request, so errors are ignored
module.exports = (req, action, role, who, detail = '') =>
  Log.create({ action, role, who, detail, ip: req.ip }).catch(() => {});
