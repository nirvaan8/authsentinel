const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'LOGIN_FAILED',
        'MFA_FAIL',
        'MFA_SUCCESS',
        'ROLE_CHANGE',
        'LOCKOUT',
        'GOOGLE_LOGIN'
      ],
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
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);