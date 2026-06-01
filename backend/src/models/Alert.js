const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'BRUTE_FORCE',
        'OFF_HOURS_ACCESS',
        'PRIVILEGE_ESCALATION',
        'LOCKOUT',
        'MFA_FAIL',
        'SUSPICIOUS_ROLE_CHANGE'
      ],
      required: true
    },

    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: true
    },

    user: {
      type: String,
      required: true
    },

    ip: {
      type: String,
      default: 'unknown'
    },

    details: {
      type: Object,
      default: {}
    },

    acknowledged: {
      type: Boolean,
      default: false
    },

    acknowledgedBy: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Alert', alertSchema);