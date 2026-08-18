const jwt = require('jsonwebtoken');

// The middleware verifies the JWT token on protected routes
const authMiddleware = (req, res, next) => {
    try {
        // Get the authorization header: "Bearer <token>"
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Extract the token (remove the "Bearer "" prefix)
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({error: 'Invalid token format' });
        }

        // Verify the token using the same secret as signup/login
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded userId to req.user so route handlers can access it
        req.user = { userId: decoded.userId};

        // Continue to the next middleware/route handler
        next()
    } catch (err) {
        // Token is invalid or expired
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;