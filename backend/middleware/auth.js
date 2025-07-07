// auth.js: middleware file in backend
// PURPOSE: Reusable middleware that checks for a valid token before allowing access to a protected route.
// Violet Yousif, 5/31/2025, This middleware checks if the user is authenticated by verifying the JWT token.
// Violet Yousif, 6/14/2025, Added fixes to token call in a cookie with JWT_SECRET. Uses the cookie dependency to get the token directly from the cookie.
// Viktor Gjorgjevski, 6/18/2025, Added console log for token verification success and failure.
// Violet Yousif, 7/5/2025, Added role-based access control by allowing an optional role parameter to the middleware.

/**
 * Middleware to authenticate users and optionally enforce role-based access.
 * @param {string|null} requiredRole - Optional role required (e.g., 'admin')
 */


import jwt from 'jsonwebtoken';

const auth = (requiredRole = null) => (req, res, next) => {
  const token = req.cookies.token;
  //console.log("Token from cookie:", token);    // This should only be for debugging and deleted or commented out otherwise
  //const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized: No authentication token provided',
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId, // User's MongoDB _id value
      email: decoded.email,
      role: decoded.role || 'user'  // Default to 'user' if no role is provided
    };

    if (requiredRole && req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Access Denied: Insufficient privileges' });
    }

    next(); // This forces the request to continue to the next middleware or route handler
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(400).json({ message: 'Invalid token' });
  }
};



export default auth;
