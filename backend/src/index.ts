import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import express from "express";
import YAML from "yamljs";
import { pool } from "./db/index.js";
import projectsRouter from "./routes/projects.js";
import chaptersRouter from "./routes/chapters.js";
import charactersRouter from "./routes/characters.js";
import worldItemsRouter from "./routes/worldItems.js";
import plotsRouter from "./routes/plots.js";
import notesRouter from "./routes/notes.js";
import glossaryRouter from "./routes/glossary.js";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json());

// Swagger UI (CDN-based, compatible with Express 5)
const swaggerPath = path.resolve(__dirname, "swagger.yaml");
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = YAML.load(swaggerPath);
  const docsRouter = express.Router();

  docsRouter.get("/swagger.json", (_req, res) => {
    res.json(swaggerDocument);
  });

  docsRouter.get("/", (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Plotra API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: '/api-docs/swagger.json', dom_id: '#swagger-ui' });
  </script>
</body>
</html>`);
  });

  app.use("/api-docs", docsRouter);
}

// Health check
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

// Auth (public)
app.use("/api/auth", authRouter);

// Protected routes (require login)
app.use("/api/projects", requireAuth, projectsRouter);
app.use("/api/projects/:projectId/chapters", requireAuth, chaptersRouter);
app.use("/api/projects/:projectId/characters", requireAuth, charactersRouter);
app.use("/api/projects/:projectId/world-items", requireAuth, worldItemsRouter);
app.use("/api/projects/:projectId/plots", requireAuth, plotsRouter);
app.use("/api/projects/:projectId/notes", requireAuth, notesRouter);
app.use("/api/projects/:projectId/glossary", requireAuth, glossaryRouter);

app.get("/", (_request, response) => {
  response.send("Plotra backend is running.");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});
