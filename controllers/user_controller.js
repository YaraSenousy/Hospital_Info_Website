const User = require("../models/User.model")
const jwt = require('jsonwebtoken');


const userController = {
    
login: async (req, res) => {
  const { email, password } = req.body;

  // Validate user credentials
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived token
  );

  // Send token in HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.status(200).json({ message: 'Login successful' });
}
}

module.exports = userController;