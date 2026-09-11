import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/search", async (req, res) => {
  const q = req.query.q?.toString().trim();
  if (!q) return res.json({ users: [] });

  const users = await prisma.user.findMany({
    where: { username: { contains: q }, id: { not: req.userId } },
    take: 10,
    select: { id: true, username: true, discriminator: true, avatarColor: true, status: true },
  });
  res.json({ users });
});

export default router;
