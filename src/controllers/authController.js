const authQueries = require('../db/authQueries');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

module.exports = { login };