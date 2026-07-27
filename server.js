// server.js
const express = require('express');
require('dotenv').config();
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');

const app = express();
app.use(express.json()); // عشان نقدر نقرأ req.body لو الطلب JSON

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(100) NOT NULL,
      email         VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      OTP_CODE VARCHAR(6),
      OTP_EXPIRY TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id                  SERIAL PRIMARY KEY,
      name                VARCHAR(150) NOT NULL,
      email               VARCHAR(150) NOT NULL,
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
  console.log('Database tables ready.');
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/cvs', require('./src/routes/cvRoutes'));

app.use('/api/auth', require('./src/routes/authRoutes'));

// Serve the UI for any other route
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


module.exports = app;