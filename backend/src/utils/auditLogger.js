const AuditLog = require('../models/AuditLog');

const logEvent = async (event, user, ip, details = {}) => {
  try {
    await AuditLog.create({
      event,
      user,
      ip,
      details
    });

    console.log(`📋 Audit: [${event}] ${user} from ${ip}`);
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

module.exports = { logEvent };