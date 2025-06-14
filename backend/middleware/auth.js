// auth.js: middleware file in backend
// PURPOSE: Reusable middleware that checks for a valid token before allowing access to a protected route.

// Violet Yousif, 5/31/2025, This middleware checks if the user is authenticated by verifying the JWT token.

import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.cookies.token;
  //const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied: No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId, // User's MongoDB _id value
      email: decoded.email
    };
    next(); // This forces the request to continue to the next middleware or route handler
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

export default auth;
