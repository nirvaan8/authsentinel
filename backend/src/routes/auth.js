const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const { logEvent } = require('../utils/auditLogger');
const {
  checkBruteForce,
  checkOffHours,
  checkMfaFail
} = require('../detection/rules');
const { getWss } = require('../utils/websocket');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: 'Too many requests, slow down.'
  }
});

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Viewer'
    });

    await logEvent(
      'REGISTER',
      email,
      req.ip,
      {
        name,
        role: user.role
      }
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// LOGIN
// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;

    console.log('STEP 0: Login request received');

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    console.log('STEP 1: User found');

    if (user.isSuspended) {
      return res.status(403).json({
        error: 'Account suspended'
      });
    }

    if (user.isLocked()) {
      return res.status(423).json({
        error: 'Account temporarily locked. Try again later.'
      });
    }

    const isMatch = await user.comparePassword(password);

    console.log('STEP 2: Password checked');

    if (!isMatch) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(
          Date.now() + 2 * 60 * 1000
        );

        await user.save();

        await checkBruteForce(
          user,
          ip,
          getWss()
        );

        await logEvent(
          'LOCKOUT',
          email,
          ip,
          {
            attempts: user.failedLoginAttempts
          }
        );

        return res.status(423).json({
          error: 'Too many failed attempts. Account locked for 2 minutes.'
        });
      }

      await user.save();

      await logEvent(
        'LOGIN_FAILED',
        email,
        ip,
        {
          attempts: user.failedLoginAttempts
        }
      );

      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();

    await user.save();

    console.log('STEP 3: User saved');

    await checkOffHours(
      email,
      ip,
      getWss()
    );

    console.log('STEP 4: Off-hours check complete');

    if (user.mfaEnabled) {
      return res.json({
        mfaRequired: true,
        userId: user._id
      });
    }

    const token = generateToken(user);

    console.log('STEP 5: Token generated');

    await logEvent(
      'LOGIN',
      email,
      ip,
      {
        role: user.role
      }
    );

    console.log('STEP 6: Audit logged');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('========== LOGIN ERROR ==========');
    console.error(err);
    console.error(err.stack);
    console.error('=================================');

    res.status(500).json({
      error: err.message
    });
  }
});
// VERIFY TOTP
router.post('/verify-totp', async (req, res) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      await checkMfaFail(
        user.email,
        req.ip,
        getWss()
      );

      await logEvent(
        'MFA_FAIL',
        user.email,
        req.ip
      );

      return res.status(401).json({
        error: 'Invalid TOTP code'
      });
    }

    await logEvent(
      'MFA_SUCCESS',
      user.email,
      req.ip
    );

    const jwtToken = generateToken(user);

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// SETUP MFA
router.post('/setup-mfa', async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const secret = speakeasy.generateSecret({
      name: `AuthSentinel (${user.email})`
    });

    user.mfaSecret = secret.base32;
    user.mfaEnabled = true;

    await user.save();

    const qrCode = await qrcode.toDataURL(
      secret.otpauth_url
    );

    res.json({
      qrCode,
      secret: secret.base32
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// LOGOUT
router.post('/logout', async (req, res) => {
  try {
    const { email } = req.body;

    await logEvent(
      'LOGOUT',
      email || 'unknown',
      req.ip
    );

    res.json({
      message: 'Logged out successfully'
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;