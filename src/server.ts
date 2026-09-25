import "dotenv/config";
import app from "@/app";
import { connectDatabase } from "@/config/db";
import { env } from "@/config/env";

const start = async () => {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`[server] আমাদের কাঞ্চনা API listening on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    console.error("[server] Failed to start:", err);
    process.exit(1);
  }
};

start();
