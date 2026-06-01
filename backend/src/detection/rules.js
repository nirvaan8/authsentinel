const Alert = require('../models/Alert');

const fireAlert = async (
  type,
  severity,
  user,
  ip,
  details = {},
  wss
) => {
  const alert = await Alert.create({
    type,
    severity,
    user,
    ip,
    details
  });

  console.log(
    `🚨 Alert fired: [${severity}] ${type} — ${user}`
  );

  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(
          JSON.stringify({
            type,
            severity,
            user,
            ip,
            details,
            timestamp: new Date()
          })
        );
      }
    });
  }

  return alert;
};

const checkBruteForce = async (user, ip, wss) => {
  if (user.failedLoginAttempts >= 5) {
    await fireAlert(
      'BRUTE_FORCE',
      'Critical',
      user.email,
      ip,
      {
        attempts: user.failedLoginAttempts
      },
      wss
    );
  }
};

const checkOffHours = async (userEmail, ip, wss) => {
  const hour = new Date().getUTCHours() + 5.5;
  const istHour = Math.floor(hour) % 24;

  if (istHour < 8 || istHour >= 20) {
    await fireAlert(
      'OFF_HOURS_ACCESS',
      'Medium',
      userEmail,
      ip,
      {
        loginTime: new Date().toISOString()
      },
      wss
    );
  }
};

const checkMfaFail = async (userEmail, ip, wss) => {
  await fireAlert(
    'MFA_FAIL',
    'High',
    userEmail,
    ip,
    {},
    wss
  );
};

module.exports = {
  checkBruteForce,
  checkOffHours,
  checkMfaFail,
  fireAlert
};