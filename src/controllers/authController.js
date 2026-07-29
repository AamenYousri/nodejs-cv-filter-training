const bcrypt = require('bcrypt');
const pool = require('../db');
const authQueries = require('../db/authQueries');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('./emailController');

function isCompanyEmail(email) {
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
  return email.toLowerCase().endsWith(`@${allowedDomain.toLowerCase()}`);
}

function generateOTP() {
  const otp = Math.floor(Math.random() * 1000000);
  return otp.toString().padStart(6, '0');
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
    }

    if (!isCompanyEmail(email)) {
      return res.status(400).json({
        success: false,
        error: `Only ${process.env.ALLOWED_EMAIL_DOMAIN} email addresses are allowed`,
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, OTP_CODE, OTP_EXPIRY)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, created_at, is_verified, OTP_CODE`,
      [name, email, password_hash, otpCode, otpExpiresAt]
    );

    const newUser = result.rows[0];

    await sendOTPEmail(newUser);
    

    return res.status(201).json({
      success: true,
      message: 'Registered successfully. Please verify your email using the OTP sent.',
      data: newUser,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong while registering',
    });
  }
}

function regenerateOTP(user) {
  const otpCode = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  return pool.query(
    `UPDATE users SET OTP_CODE = $1, OTP_EXPIRY = $2 WHERE id = $3 RETURNING *`,
    [otpCode, otpExpiresAt, user.id]
  );
}

async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'email and otp are required',
      });
    }

    const userResult = await pool.query(
      'SELECT id, otp_code, otp_expiry, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        error: 'User is already verified',
      });
    }

    if (user.otp_code !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP',
      });
    }

    if (new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired',
      });
    }

    await pool.query(
      `UPDATE users
       SET is_verified = TRUE, otp_code = NULL, otp_expiry = NULL
       WHERE id = $1`,
      [user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong while verifying OTP',
    });
  }
}

const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updatedUser = regenerateOTP(user);
  return res.status(200).json({ message: 'OTP resent successfully'});

}


const createAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '10d' });
}

const login = async (req, res) => {

  const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(401).json({ error: 'All fields are required' });
    }
    
    const user = await authQueries.getUserByEmail(email);

    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    else if (!user.is_verified) {
      return res.status(403).json({ error: 'Email not verified. Please verify your email before logging in.' });
    } 

        if (await bcrypt.compare(password, user.password_hash)) {
            const token = createAccessToken(user);
            res.json({ message: 'Login successful', accessToken: token });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    
}

module.exports = { register, verifyOTP, login, resendOTP };