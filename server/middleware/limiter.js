const rateLimit = require('express-rate-limit');

// stops password guessing: too many tries from one IP in 15 minutes gets blocked
const make = (limit) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    message: { error: 'Too many attempts, try again after 15 minutes' },
  });

exports.loginLimiter = make(10);   // admin and coach login
exports.playerLimiter = make(30);  // player login and coach registration
