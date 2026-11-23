require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');

const apiRoutes = require('./routes/apiRoutes');
const { seedDefaultAdmin } = require('./controllers/authController');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true
}));

// Terminal Process Logger for API endpoints
app.use((req, res, next) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    if (originalUrl.startsWith('/api')) {
      if (status >= 400) {
        logger.error('HTTP REQUEST', `${method} ${originalUrl} -> Status ${status} (${duration}ms)`);
      } else {
        logger.info('HTTP REQUEST', `${method} ${originalUrl} -> Status ${status} (${duration}ms)`);
      }
    }
  });
  next();
});

app.use(morgan('dev'));

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LumosEvent Backend', timestamp: new Date() });
});

const PORT = process.env.PORT || 6002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/LumosEvent';

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(async () => {
    logger.success('DATABASE', `Connected to MongoDB at ${MONGO_URI}`);
    await seedDefaultAdmin();
    try {
      const passwordHelper = require('./utils/passwordHelper');
      await passwordHelper.backfillUserPasswords();
    } catch (_) {}
    try {
      const GuestActivity = require('./models/GuestActivity');
      await GuestActivity.deleteMany({
        title: { $in: ['Guest visited the showroom', 'Guest visited the event'] }
      });
    } catch (_) {}
    app.listen(PORT, () => {
      logger.success('SERVER', `Lumos Backend Server running on port ${PORT}`);
      console.log(`📡 Ready to receive guest forms and management requests at http://localhost:${PORT}/api\n`);
    });
  })
  .catch((err) => {
    logger.error('DATABASE', `MongoDB connection error: ${err.message}`, err);
  });
