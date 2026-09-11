"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const init_1 = require("./db/init");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const safety_routes_1 = __importDefault(require("./routes/safety.routes"));
const complaints_routes_1 = __importDefault(require("./routes/complaints.routes"));
const mess_routes_1 = __importDefault(require("./routes/mess.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const safety_upload_routes_1 = __importDefault(require("./routes/safety-upload.routes"));
const announcements_routes_1 = __importDefault(require("./routes/announcements.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = CLIENT_URL.split(',').map(u => u.trim());
// Initialize DB connection
(0, init_1.initDB)().then(() => {
    // Middleware
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin) ||
                allowedOrigins.includes('*') ||
                origin.endsWith('.vercel.app') ||
                origin.endsWith('.netlify.app') ||
                origin.includes('localhost')) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Routes
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/complaints', complaints_routes_1.default);
    app.use('/api/mess', mess_routes_1.default);
    app.use('/api/notifications', notifications_routes_1.default);
    app.use('/api/announcements', announcements_routes_1.default);
    app.use('/api/admin', admin_routes_1.default);
    app.use('/api/upload', upload_routes_1.default);
    app.use('/api/safety', safety_routes_1.default);
    app.use('/api/safety', safety_upload_routes_1.default);
    // Health check
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', message: 'HostelHub API is running 🚀', version: '2.0.0' });
    });
    app.listen(PORT, () => {
        console.log(`\n🏨 HostelHub Server running on http://localhost:${PORT}`);
        console.log(`📋 Health: http://localhost:${PORT}/api/health\n`);
    });
});
exports.default = app;
