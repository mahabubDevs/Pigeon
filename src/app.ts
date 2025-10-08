import express, { Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import { Morgan } from "./shared/morgan";
import router from "./app/routes"; // ✅ changed from '../src/app/routes'
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import session from "express-session";

import passport from "./config/passport"; // path already correct

// Subscription route
import handleStripeWebhook from "./helpers/handleStripeWebhook";
import { credential } from "firebase-admin";

const app = express();

// ⚡️ Stripe webhook route must be before json parser
app.post(
  "/api/v1/subscription/webhook",
  express.raw({ type: "application/json" }), // raw body
  handleStripeWebhook
);

// morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// body parser
app.use(cors({
  origin:'*',
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true, // যদি cookies/session ব্যবহার করো
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// file retrieve
app.use(express.static("uploads"));

// Session middleware
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // production: true
  })
);

// Passport initialize
app.use(passport.initialize());
app.use(passport.session());

// Worker PID logging
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(
      `[Worker ${process.pid}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`
    );
  });
  next();
});

// router
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hey Backend, How can I assist you please tell me");
});

// global error handler
app.use(globalErrorHandler);

// handle not found
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
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

export default app;
