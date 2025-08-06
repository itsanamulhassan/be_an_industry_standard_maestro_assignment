import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import "./app/configurations/passport";
import environments from "app/configurations/environments";
import invalidRoute from "app/middlewares/route.middleware";
import globalErrorHandler from "app/middlewares/error.middleware";

const app = express();

app.use(
  expressSession({
    secret: environments.express_session_secret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// Parse incoming JSON requests
app.use(express.json());

// Enable CORS
app.use(cors());

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Maestro Ride-Booking Platform Server",
  });
});

// API routes
// app.use("/api/v1", appRouter);

// Invalid route handler (404)
app.use(invalidRoute);

// Global error handler (500, validation errors, etc.)
app.use(globalErrorHandler);

export default app;
