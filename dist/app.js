"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_status_codes_1 = require("http-status-codes");
const morgan_1 = require("./shared/morgan");
const routes_1 = __importDefault(require("./app/routes")); // ✅ changed from '../src/app/routes'
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./config/passport")); // path already correct
// Subscription route
const handleStripeWebhook_1 = __importDefault(require("./helpers/handleStripeWebhook"));
const app = (0, express_1.default)();
// ⚡️ Stripe webhook route must be before json parser
app.post("/api/v1/subscription/webhook", express_1.default.raw({ type: "application/json" }), // raw body
handleStripeWebhook_1.default);
// morgan
app.use(morgan_1.Morgan.successHandler);
app.use(morgan_1.Morgan.errorHandler);
// body parser
app.use((0, cors_1.default)({
    origin: '*',
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true, // যদি cookies/session ব্যবহার করো
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// file retrieve
app.use(express_1.default.static("uploads"));
// Session middleware
app.use((0, express_session_1.default)({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // production: true
}));
// Passport initialize
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Worker PID logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        console.log(`[Worker ${process.pid}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
});
// router
app.use("/api/v1", routes_1.default);
app.get("/", (req, res) => {
    res.send("Hey Backend, How can I assist you please tell ");
});
// global error handler
app.use(globalErrorHandler_1.default);
// handle not found
app.use((req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Not Found",
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API DOESN'T EXIST",
            },
        ],
    });
});
exports.default = app;
