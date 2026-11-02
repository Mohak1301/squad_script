import express from "express";
import colors from "colors";
import "dotenv/config";
import connectDB from "./config/db.js";
import authRoute from './routes/authRoute.js';
import meetRoute from './routes/meetRoute.js';

import fileRoute from './routes/fileRoute.js';
import rapidApiRoute from './routes/rapidApiRoute.js'
import cors from 'cors';
import helmet from "helmet";
import JWT from "jsonwebtoken";
import crypto from "crypto";
import { Server } from "socket.io";
import { createServer } from "http";
import './cronjob/cronJobs.js';
import { apiLimiter, errorHandler, notFoundHandler, rejectUnsafeInput, requireDatabaseConnection } from "./middleware/security.js";

const requiredEnvironment = ["MONGOURL", "JWT_SECRET"];
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);
if (process.env.NODE_ENV === "production" && missingEnvironment.length) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(", ")}`);
}

const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, "");
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || process.env.SERVER_URL || "http://localhost:3000")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const isLoopbackOrigin = (origin) => {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const { protocol, hostname } = new URL(origin);
    return ["http:", "https:"].includes(protocol) && ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);
  } catch {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = origin ? normalizeOrigin(origin) : "";
    if (!origin || allowedOrigins.includes(normalizedOrigin) || isLoopbackOrigin(normalizedOrigin)) return callback(null, true);
    return callback(Object.assign(new Error("Origin not allowed by CORS"), { status: 403 }));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  credentials: true,
  maxAge: 86400,
};

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions,
  maxHttpBufferSize: 100_000,
  pingTimeout: 20_000,
});

io.use((socket, next) => {
  try {
    const header = socket.handshake.auth?.token || socket.handshake.headers.authorization;
    const cookieToken = socket.handshake.headers.cookie?.split(";").map((item) => item.trim().split("=")).find(([name]) => name === "ss_session")?.[1];
    const token = (header?.startsWith("Bearer ") ? header.slice(7).trim() : header) || cookieToken;
    if (!token) return next(new Error("Authentication required"));
    socket.user = JWT.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    return next();
  } catch {
    return next(new Error("Invalid or expired authentication token"));
  }
});

io.on('connection',(socket) => {
  socket.on('join room', (room) => {
    if (typeof room !== "string" || !/^[A-Za-z0-9_-]{3,80}$/.test(room)) return;
    socket.join(room);
  });

  socket.on('message', (data) => {
    if (!data || typeof data.room !== "string" || typeof data.text !== "string") return;
    if (!socket.rooms.has(data.room)) return;
    const text = data.text.trim().slice(0, 2000);
    const username = String(data.username || "Member").trim().slice(0, 50);
    if (text) io.to(data.room).emit('message', { username, text });
  });

  socket.on('code', (data) => {
    if (!data || typeof data.room !== "string" || typeof data.text !== "string") return;
    if (!socket.rooms.has(data.room) || data.text.length > 500_000) return;
    socket.in(data.room).emit('code', data.text);
  });
});

app.disable("x-powered-by");
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS || 1));
app.use((req, res, next) => {
  req.id = String(req.headers["x-request-id"] || crypto.randomUUID()).slice(0, 100);
  res.setHeader("X-Request-ID", req.id);
  next();
});
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(rejectUnsafeInput);
app.use("/api", apiLimiter);
app.use("/api/v1/auth", requireDatabaseConnection, authRoute);
app.use("/api/v1/meet", requireDatabaseConnection, meetRoute);
app.use("/api/v1/rapidapi", rapidApiRoute);
app.use("/api/v1/file", requireDatabaseConnection, fileRoute);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "squad-script-api" });
});

app.get("/", (req, res) => res.status(200).send("Squad Script API"));
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port number ${PORT}`.bgGreen.white);
    });
  });
}

export { app, server, io, corsOptions };
