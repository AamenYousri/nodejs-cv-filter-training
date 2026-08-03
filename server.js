// server.js
const express = require("express");
require("dotenv").config();
const path = require("path");
const jwt = require("jsonwebtoken");
const pool = require("./src/db/index");
const authRoutes = require("./src/routes/authRoutes");
const app = express();
app.use(express.json());
const cors = require("cors");

app.use((req, res, next) => {
  req.cookies = {};
  const rawCookies = req.headers.cookie;

  if (!rawCookies) {
    return next();
  }

  rawCookies.split(';').forEach((cookie) => {
    const [key, ...rest] = cookie.trim().split('=');
    if (!key) return;
    req.cookies[key] = decodeURIComponent(rest.join('='));
  });

  next();
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload. Check escaped backslashes in file paths.",
    });
  }
  return next(err);
});

const initDB = async () => {
  await pool.query(`
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  OTP_CODE      VARCHAR(255),
  OTP_EXPIRY    TIMESTAMPTZ,
  reset_code    VARCHAR(255),
  reset_expiry  TIMESTAMPTZ
);

    CREATE TABLE IF NOT EXISTS candidates (
      id                  SERIAL PRIMARY KEY,
      name                VARCHAR(150),
      email               VARCHAR(150),
      city                VARCHAR(100),
      job_title           VARCHAR(150),
      years_of_experience INTEGER,
      skills              TEXT[],
      status              VARCHAR(50) DEFAULT 'Review',
      created_by          INTEGER NOT NULL REFERENCES users(id),
      created_at          TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cv_files (
      id           SERIAL PRIMARY KEY,
      candidate_id INTEGER NOT NULL UNIQUE REFERENCES candidates(id) ON DELETE CASCADE,
      file_path    VARCHAR(500),
      file_name    VARCHAR(255),
      uploaded_by  INTEGER NOT NULL REFERENCES users(id),
      uploaded_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("Database tables ready.");
};

const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database initialization failed:", err);
    process.exit(1);
  });

function getAccessToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  return req.cookies?.accessToken || null;
}

function getTokenPayload(req) {
  const token = getAccessToken(req);

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use(cors());

// API routes
app.use("/api/cvs", require("./src/routes/cvRoutes"));
app.use("/api/auth", require("./src/routes/authRoutes"));

// Frontend routes
app.get('/login', (req, res) => {
  const tokenPayload = getTokenPayload(req);

  if (tokenPayload) {
    if (tokenPayload.is_verified === false) {
      return res.redirect('/otp-verification');
    }

    return res.redirect('/dashboard');
  }

  res.sendFile(path.join(__dirname, 'src', 'public', 'html', 'Login.html'));
});

app.get('/register', (req, res) => {
  const tokenPayload = getTokenPayload(req);

  if (tokenPayload) {
    if (tokenPayload.is_verified === false) {
      return res.redirect('/otp-verification');
    }

    return res.redirect('/dashboard');
  }

  res.sendFile(path.join(__dirname, 'src', 'public', 'html', 'Register.html'));
});

app.get('/forgot-password', (req, res) => {
  const tokenPayload = getTokenPayload(req);

  if (tokenPayload) {
    if (tokenPayload.is_verified === false) {
      return res.redirect('/otp-verification');
    }

    return res.redirect('/dashboard');
  }

app.use("/api/candidates", require("./src/routes/candidateRoutes"));

// Frontend routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'html', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'html','register.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'html', 'forget-password.html'));
});

app.get('/otp-verification', (req, res) => {
  const tokenPayload = getTokenPayload(req);

  if (!tokenPayload) {
    return res.redirect('/login');
  }

  if (tokenPayload.is_verified === true) {
    return res.redirect('/dashboard');
  }

  res.sendFile(path.join(__dirname, 'src', 'public', 'html', 'otp.html'));
});

app.get('/dashboard', (req, res) => {
  const tokenPayload = getTokenPayload(req);

  if (!tokenPayload) {
    return res.redirect('/login');
  }

  if (tokenPayload.is_verified === false) {
    return res.redirect('/otp-verification');
  }

  res.sendFile(path.join(__dirname, 'src', 'public', 'dashboard.html'));
});

// Serve the UI for any other route
app.get('/{*path}', (req, res) => {
  const tokenPayload = getTokenPayload(req);

  if (!tokenPayload) {
    return res.redirect('/login');
  }

  if (tokenPayload.is_verified === false) {
    return res.redirect('/otp-verification');
  }

  res.sendFile(path.join(__dirname, 'src', 'public', 'dashboard.html'));
});

app.use("/api/uploads", express.static("uploads"));

const cvRoutes = require("./src/routes/cvRoutes");

// ==========================================
// CV Routes
// ==========================================

app.use("/api/cv", cvRoutes);

module.exports = app;
