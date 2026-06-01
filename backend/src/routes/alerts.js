const express = require('express');
const router = express.Router();

const Alert = require('../models/Alert');
const User = require('../models/User');

const { verifyToken, requireRole } = require('../middleware/auth');
const { logEvent } = require('../utils/auditLogger');

// GET ALL ALERTS
router.get('/', verifyToken, async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(alerts);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// ACKNOWLEDGE ALERT
router.patch('/:id/acknowledge', verifyToken, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        acknowledged: true,
        acknowledgedBy: req.user.email
      },
      {
        new: true
      }
    );

    res.json({
      message: 'Alert acknowledged',
      alert
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// SUSPEND USER (ADMIN ONLY)
router.patch(
  '/:id/suspend',
  verifyToken,
  requireRole('Admin'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          isSuspended: true
        },
        {
          new: true
        }
      );

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      await logEvent(
        'ROLE_CHANGE',
        user.email,
        req.ip,
        {
          action: 'SUSPENDED',
          by: req.user.email
        }
      );

      res.json({
        message: 'User suspended successfully',
        user
      });
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

module.exports = router;