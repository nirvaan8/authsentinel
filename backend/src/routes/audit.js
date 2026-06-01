const express = require('express');
const router = express.Router();

const AuditLog = require('../models/AuditLog');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET AUDIT LOGS
// Admin and Analyst only

router.get(
  '/',
  verifyToken,
  requireRole('Admin', 'Analyst'),
  async (req, res) => {
    try {
      const logs = await AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(200);

      res.json(logs);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

module.exports = router;