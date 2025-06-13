// Name: Viktor Gjorgjevski
// Date: 6/11/2025
// Description: Middleware for verifying JWT tokens in protected API routes

import jwt from 'jsonwebtoken';

// Middleware function to authenticate requests using JWT
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err){
        return res.status(403).json({Message: "Token is expired or invalid"});
    }
};
export default authMiddleware;