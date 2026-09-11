"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET_KEY = void 0;
exports.authenticate = authenticate;
exports.requireAdmin = requireAdmin;
exports.requireStudent = requireStudent;
require("dotenv/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set in environment variables. Please add it to server/.env');
    process.exit(1);
}
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}
function requireAdmin(req, res, next) {
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
}
function requireStudent(req, res, next) {
    if (!req.user || req.user.role !== 'student') {
        return res.status(403).json({ error: 'Access denied. Students only.' });
    }
    next();
}
exports.JWT_SECRET_KEY = JWT_SECRET;
