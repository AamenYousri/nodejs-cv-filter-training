
const bcrypt = require('bcrypt');
const pool = require('../db');
const authQueries = require('../db/authQueries');
const jwt = require('jsonwebtoken');

// دالة صغيرة بتتأكد إن الإيميل من الدومين المسموح بيه بس
function isCompanyEmail(email) {
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
  return email.toLowerCase().endsWith(`@${allowedDomain.toLowerCase()}`);
}

// بتولّد رقم عشوائي من 6 أرقام (زي 048392)
function generateOTP() {
  const otp = Math.floor(Math.random() * 1000000);
  return otp.toString().padStart(6, '0');
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // 1. Validation بسيطة الأول
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'name, email, and password are required',
      });
    }

    // 2. نتأكد إن الإيميل من دومين الشركة بس
    if (!isCompanyEmail(email)) {
      return res.status(400).json({
        success: false,
        error: `Only ${process.env.ALLOWED_EMAIL_DOMAIN} email addresses are allowed`,
      });
    }

    // 3. نتأكد إن الإيميل مش مستخدم قبل كده
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

    // 4. نعمل hash للباسورد قبل ما نخزنه
    const password_hash = await bcrypt.hash(password, 10);

    // 5. جديد: نجهّز الـ OTP وميعاد انتهاءه قبل الـ INSERT
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 دقايق

    // 6. جديد: نخزن اليوزر والـ OTP مع بعض في نفس الـ query
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, OTP_CODE, OTP_EXPIRY)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, created_at, is_verified`,
      [name, email, password_hash, otpCode, otpExpiresAt]
    );

    const newUser = result.rows[0];

    // Email to be sent to the user with the OTP code (this part is just a placeholder, you need to implement actual email sending)
    

    // 7. نرجّع الرد
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

// جديد: function منفصلة للتحقق من الـ OTP
async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    // 1. Validation بسيطة
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'email and otp are required',
      });
    }

    // 2. نجيب اليوزر بالإيميل ده
    const userResult = await pool.query(
      'SELECT id, otp_code, otp_expires_at, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = userResult.rows[0];

    // 3. لو اليوزر متفعّل بالفعل من قبل
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        error: 'User is already verified',
      });
    }

    // 4. نتأكد إن الكود صح
    if (user.otp_code !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP',
      });
    }

    // 5. نتأكد إن الكود لسه صالح (مانتهاش)
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired',
      });
    }

    // 6. كل حاجة تمام - نفعّل اليوزر ونمسح الكود (عشان مايتستخدمش تاني)
    await pool.query(
      `UPDATE users
       SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL
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



const createAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '10d' });
}

const login = async (req, res) => {
  const { email, password } = req.body;
    const user = await authQueries.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    } else {
        if (await bcrypt.compare(password, user.password_hash)) {
            const token = createAccessToken(user);
            res.json({ message: 'Login successful', accessToken: token });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    }
}

module.exports = { register, verifyOTP, login };
