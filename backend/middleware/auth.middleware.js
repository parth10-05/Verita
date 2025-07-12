import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

// Enhanced auth middleware that checks both cookies and Authorization header
const auth = async (req, res, next) => {
    try {
        let token = null;
        
        // Check for token in cookies first
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // If no cookie, check Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({ message: "Access token required" });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user and exclude password
        const user = await User.findById(decoded.id).select("-password_hash");
        
        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }
        
        // Check if user is banned
        if (user.is_banned) {
            return res.status(403).json({ message: "Account is banned" });
        }
        
        // Attach user to request
        req.user = user;
        next();
    } catch (err) {
        console.log("Error in auth middleware", err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        res.status(500).json({ message: err.message });
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
};

// Middleware to check if user is regular user or admin
const requireUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.role === 'guest') {
        return res.status(403).json({ message: "User access required" });
    }
    
    next();
};

export { auth, requireAdmin, requireUser };