const jwt = require('jsonwebtoken');

<<<<<<< HEAD
=======

>>>>>>> b388b6836a13451ddebf9f5d34ac7f0602f50d25
function protect(req, res, next) {
  const authHeader = req.headers.authorization; 

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
<<<<<<< HEAD
    req.user = decoded; 
=======
    req.user = decoded;
>>>>>>> b388b6836a13451ddebf9f5d34ac7f0602f50d25
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

module.exports = protect;
