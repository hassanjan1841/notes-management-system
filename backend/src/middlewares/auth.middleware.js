import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
        } catch (error) {
            // Malformed header, an invalid token format will lead to rejection.
            console.error('Error parsing Authorization header:', error);
            // No token will be set, leading to the !token check below failing.
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided or token is malformed' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token
        req.user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true } // Select only necessary fields
        });

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        // No need to clear httpOnly cookie as we are not relying on it anymore for this flow.
        return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
}; 