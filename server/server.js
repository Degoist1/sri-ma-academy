require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

// refuse to start without the secrets, safer than running with weak defaults
const missing = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_USER', 'ADMIN_PASS_HASH'].filter((k) => !process.env[k]);
if (missing.length || process.env.JWT_SECRET.length < 32) {
  console.log('Fix your .env first. Missing:', missing.join(', ') || 'none', '(JWT_SECRET needs 32+ characters)');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1);                  // Render is a proxy, this gives the real visitor IP
app.use(helmet());                          // safe security headers
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '10kb' }));   // reject huge request bodies

app.get('/', (req, res) => res.send('Sri Ma Academy API is running'));

app.use('/api/players', require('./routes/players'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/coaches', require('./routes/coaches'));
app.use('/api/admin', require('./routes/admin'));

// unknown route
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// any error thrown inside a route lands here
app.use((err, req, res, next) => {
  const status = err.name === 'CastError' ? 400 : 500;
  res.status(status).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log('Server running on port ' + PORT));
  })
  .catch((err) => console.log('MongoDB connection failed:', err.message));
