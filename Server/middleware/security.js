import "dotenv/config";
import rateLimit from "express-rate-limit";
import { isDatabaseConnected } from "../config/db.js";

const rateLimitResponse = {
  success: false,
  message: "Too many requests. Please try again later.",
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: rateLimitResponse,
});

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.OTP_RATE_LIMIT_MAX || 5),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse,
});

export const compilerLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.COMPILER_RATE_LIMIT_MAX || 20),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse,
});

const hasUnsafeKey = (value) => {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasUnsafeKey);

  return Object.entries(value).some(
    ([key, nested]) => key.startsWith("$") || key.includes(".") || hasUnsafeKey(nested)
  );
};

export const rejectUnsafeInput = (req, res, next) => {
  if (hasUnsafeKey(req.body) || hasUnsafeKey(req.query) || hasUnsafeKey(req.params)) {
    return res.status(400).json({
      success: false,
      message: "Request contains unsupported fields.",
    });
  }
  next();
};

export const requireDatabaseConnection = (req, res, next) => {
  if (isDatabaseConnected()) return next();

  const message = !process.env.MONGOURL && process.env.NODE_ENV !== "production"
    ? "Database is not configured. Add MONGOURL to Server/.env and restart the API."
    : "Database is unavailable. Please try again shortly.";

  return res.status(503).json({
    success: false,
    message,
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || (error.type === "entity.too.large" ? 413 : 500);
  if (process.env.NODE_ENV !== "test") {
    console.error(`[${req.id || "no-request-id"}]`, error);
  }
  return res.status(status).json({
    success: false,
    message: status === 500 ? "An unexpected error occurred." : error.message,
  });
};
