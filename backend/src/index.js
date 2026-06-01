require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/db');

const authRoutes    = require('./routes/auth');
const shipmentRoutes = require('./routes/shipments');
const partnerRoutes  = require('./routes/partners');
const adminRoutes    = require('./routes/admin');
const courierRoutes  = require('./routes/couriers');
const inquiriesRoutes = require('./routes/inquiries');
const visitorRoutes   = require('./routes/visitor');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'ParcelBridge API', timestamp: new Date().toISOString() })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth',      authRoutes);
app.use('/shipments', shipmentRoutes);
app.use('/partners',  partnerRoutes);
app.use('/admin',     adminRoutes);
app.use('/couriers',  courierRoutes);
app.use('/inquiries', inquiriesRoutes);
app.use('/visitor',   visitorRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ParcelBridge API → http://localhost:${PORT}`);
  });
});

module.exports = app;
