import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Serve React build
app.use(express.static(path.join(__dirname, "dist")));

// API routes
import fileRouter from "./routes/fileRoutes.route.js";
import userRouter from "./routes/user.routes.js";

app.use("/api/files", fileRouter);
app.use("/api/users", userRouter);

// ✅ IMPORTANT: React SPA fallback (MUST BE LAST)
app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

export { app };