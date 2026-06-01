const express = require('express');
const VisitorLog = require('../models/VisitorLog');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper to enforce admin only
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ─── POST /visitor/log (Public) ───────────────────────────────────────────────
router.post('/log', async (req, res) => {
  try {
    const { page } = req.body;
    if (!page) {
      return res.status(400).json({ error: 'Page parameter is required' });
    }
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const log = await VisitorLog.create({
      page,
      ip,
      userAgent,
    });
    return res.status(201).json({ status: 'logged', id: log.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /visitor/logs (Admin Only) ────────────────────────────────────────────
router.get('/logs', authenticate, adminOnly, async (req, res) => {
  try {
    const logs = await VisitorLog.findAll({
      order: [['timestamp', 'DESC']],
      limit: 100, // Limit to recent 100 logs for efficiency
    });
    return res.json({ logs, count: logs.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
