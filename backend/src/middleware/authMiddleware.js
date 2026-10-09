const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check karega user logged-in (valid token ke saath) hai ya nahi
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User no longer exists' });
            }

            if (req.user.status === 'blocked') {
                return res.status(403).json({ success: false, message: 'Your account is blocked. Contact admin.' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
};

// Check karega user 'admin' hai ya nahi
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role (${req.user.role}) is not allowed to access this resource`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
