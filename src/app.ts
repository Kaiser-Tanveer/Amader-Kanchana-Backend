import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "@/config/env";
import apiRoutes from "@/routes/index";
import { notFoundHandler, errorHandler } from "@/middleware/errorHandler";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// Static file serving for the local storage driver.
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "আমাদের কাঞ্চনা API is running." });
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
