const express = require('express');
const path = require('path');
const cvRoutes = require('./routes/cvRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/cvs', cvRoutes);

app.use('/api/auth', require('./routes/authRoutes'));

// Serve the UI for any other route
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
