// server.js
const express = require("express");
require("dotenv").config();
const path = require("path");
const pool = require("./src/db/index");
const authRoutes = require("./src/routes/authRoutes");
const app = express();
app.use(express.json());
const cors = require("cors");

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
      status              VARCHAR(50) DEFAULT 'Pending',
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

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use(cors());

// API routes
app.use("/api/cvs", require("./src/routes/cvRoutes"));
app.use("/api/auth", require("./src/routes/authRoutes"));

// Frontend routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'Login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'Register.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'forget-password.html'));
});

app.get('/otp-verification', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'Otp.html'));
});

// Serve the UI for any other route
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

app.use("/api/uploads", express.static("uploads"));

const cvRoutes = require("./src/routes/cvRoutes");

// ==========================================
// CV Routes
// ==========================================

app.use("/api/cv", cvRoutes);

module.exports = app;
