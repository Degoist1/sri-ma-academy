const jwt = require('jsonwebtoken');
const { Coach } = require('../models');

// usage: router.get('/', auth('coach'), handler)   or   auth('admin')
module.exports = (role) => async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const data = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (data.role !== role) throw new Error('wrong role');

    // a coach rejected after logging in must lose access straight away
    if (role === 'coach') {
      const coach = await Coach.findById(data.id);
      if (!coach || coach.status !== 'approved') throw new Error('coach not approved');
    }
    req.user = data;
    next();
  } catch {
    res.status(401).json({ error: 'Please log in again' });
  }
};
