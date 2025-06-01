// auth.js: middleware file in backend
// this middleware checks if the user is authenticated by verifying the JWT token.
import jwt from 'jsonwebtoken';


// Name: Violet Yousif, 5/31/2025
// Date: 5/31/2025
// Description: This middleware checks if the user is authenticated by verifying the JWT token.
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied: No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

export default auth;
