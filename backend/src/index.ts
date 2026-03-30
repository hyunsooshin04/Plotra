import express from "express";
import { pool } from "./db/index.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.get("/api/health", async (_request, response) => {
  let dbStatus = "disconnected";
  try {
    await pool.query("SELECT 1");
    dbStatus = "connected";
  } catch {
    dbStatus = "error";
  }
  response.json({
    service: "backend",
    status: "ok",
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

app.get("/", (_request, response) => {
  response.send("Plotra backend is running.");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
});
