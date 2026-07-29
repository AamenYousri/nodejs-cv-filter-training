const jwt = require('jsonwebtoken');

// الـ middleware ده بيتحط قبل أي route عايزة تكون محمية (يعني محتاجة login)
function protect(req, res, next) {
  const authHeader = req.headers.authorization; // المتوقع: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // بقى متاح في أي route جاي بعد كده: req.user.id, req.user.email
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

module.exports = protect;