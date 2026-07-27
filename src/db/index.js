// db/index.js
// بنعمل "pool" واحد بس للاتصال بالـ database، وأي ملف تاني محتاج
// ينفذ query هيستورد الـ pool ده بدل ما يفتح اتصال جديد كل مرة

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;