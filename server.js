require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/db');

const PORT = process.env.PORT || 3000;

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cvs (
      id        SERIAL PRIMARY KEY,
      name      VARCHAR(100) NOT NULL,
      email     VARCHAR(150) NOT NULL UNIQUE,
      phone     VARCHAR(30),
      skills    TEXT,
      experience TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Database table ready.');
};

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err.message);
    process.exit(1);
  });
