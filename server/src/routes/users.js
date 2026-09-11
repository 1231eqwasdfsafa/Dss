import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { publicProfile } from "../lib/serialize.js";
import { getAllActivity } from "../lib/activity.js";

const router = Router();
router.use(requireAuth);

router.get("/search", async (req, res) => {
  const q = req.query.q?.toString().trim();
  if (!q) return res.json({ users: [] });

  const users = await prisma.user.findMany({
    where: { username: { contains: q }, id: { not: req.userId } },
    take: 10,
    select: { id: true, username: true, discriminator: true, avatarColor: true, avatarUrl: true, status: true },
  });
  res.json({ users });
});

// Snapshot of everyone's "currently listening" activity, fetched once on
// load; live changes after that arrive via the activity:update socket event.
router.get("/activity", (_req, res) => {
  res.json({ activity: getAllActivity() });
});

router.get("/:userId", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!user) return res.status(404).json({ error: "Kullanici bulunamadi" });
  res.json({ user: publicProfile(user) });
});

export default router;
