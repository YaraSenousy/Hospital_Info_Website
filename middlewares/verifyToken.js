const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Get token from cookie
  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    // Ensure the decoded token has the required fields
    if (!decoded.userId || !decoded.role) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    req.user = decoded; // Attach user ID and role to the request object
    next();
  } catch (error) {
    console.log('Token Verification Error:', error);

    // Handle specific errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;