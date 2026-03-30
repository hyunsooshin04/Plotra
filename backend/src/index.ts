import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const databaseUrl = process.env.DATABASE_URL ?? null;

app.get("/api/health", (_request, response) => {
  response.json({
    service: "backend",
    status: "ok",
    timestamp: new Date().toISOString(),
    databaseConfigured: Boolean(databaseUrl),
  });
});

app.get("/", (_request, response) => {
  response.send("Plotra backend is running.");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
});
