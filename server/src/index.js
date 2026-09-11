import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import crypto from "crypto";

import authRoutes from "./routes/auth.js";
import serverRoutes from "./routes/servers.js";
import channelMessageRoutes from "./routes/messages.js";
import dmRoutes from "./routes/dms.js";
import userRoutes from "./routes/users.js";
import pollRoutes from "./routes/polls.js";
import { initSocket } from "./socket.js";
import { requireAuth } from "./middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || (process.env.NODE_ENV === "production" ? true : "http://localhost:5173");

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

const uploadDir = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadDir));

// Only images are ever legitimately uploaded here (avatars/banners). The
// stored filename's extension is derived from the validated mimetype, never
// from the client-supplied original name — otherwise an attacker could
// upload e.g. "x.html" and have it served same-origin as text/html, letting
// script on it read localStorage (including the auth token).
const MIME_EXT = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${MIME_EXT[file.mimetype]}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, Boolean(MIME_EXT[file.mimetype])),
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Sadece PNG, JPEG, GIF veya WEBP resim dosyalari yuklenebilir" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.use("/api/auth", authRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/messages", channelMessageRoutes);
app.use("/api/dms", dmRoutes);
app.use("/api/users", userRoutes);
app.use("/api/polls", pollRoutes);

// Serve the built frontend (client/dist) when present, so a single service
// can host both the API and the SPA in production deployments.
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api|\/uploads|\/socket\.io).*/, (_req, res, next) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => (err ? next() : undefined));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Sunucu hatasi" });
});

const io = initSocket(httpServer, CLIENT_ORIGIN);
app.set("io", io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`DSS server running on http://localhost:${PORT}`);
});
