// server.js
const express = require('express');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(express.json()); // عشان نقدر نقرأ req.body لو الطلب JSON

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});