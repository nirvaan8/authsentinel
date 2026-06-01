const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logEvent } = require('../utils/auditLogger');

// GET all users — Admin only
router.get(
  '/',
  verifyToken,
  requireRole('Admin'),
  async (req, res) => {
    try {
      const users = await User.find().select(
        '-password -mfaSecret'
      );

      res.json(users);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

// PATCH change role — Admin only
router.patch(
  '/:id/role',
  verifyToken,
  requireRole('Admin'),
  async (req, res) => {
    try {
      const { role } = req.body;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      );

      await logEvent(
        'ROLE_CHANGE',
        user.email,
        req.ip,
        {
          newRole: role,
          changedBy: req.user.email
        }
      );

      res.json({
        message: 'Role updated',
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