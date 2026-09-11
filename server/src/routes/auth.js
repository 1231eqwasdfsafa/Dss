import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const AVATAR_COLORS = ["#5865F2", "#EB459E", "#57F287", "#FEE75C", "#ED4245", "#00C2FF", "#9B59B6"];

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    discriminator: user.discriminator,
    email: user.email,
    avatarColor: user.avatarColor,
    avatarUrl: user.avatarUrl,
    bannerUrl: user.bannerUrl,
    bannerColor: user.bannerColor,
    bio: user.bio,
    pronouns: user.pronouns,
    youtubeUrl: user.youtubeUrl,
    spotifyUrl: user.spotifyUrl,
    status: user.status,
    customStatus: user.customStatus,
    isBot: user.isBot,
    createdAt: user.createdAt,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Kullanici adi, email ve sifre gerekli" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Sifre en az 6 karakter olmali" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res.status(409).json({ error: "Bu kullanici adi veya email zaten kullaniliyor" });
    }

    const hash = await bcrypt.hash(password, 10);
    const discriminator = String(Math.floor(1000 + Math.random() * 9000));
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await prisma.user.create({
      data: { username, email, password: hash, discriminator, avatarColor },
    });

    const token = signToken({ userId: user.id });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kayit sirasinda hata olustu" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email ve sifre gerekli" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Gecersiz email veya sifre" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Gecersiz email veya sifre" });
    }

    await prisma.user.update({ where: { id: user.id }, data: { status: "ONLINE" } });

    const token = signToken({ userId: user.id });
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Giris sirasinda hata olustu" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "Kullanici bulunamadi" });
  res.json({ user: publicUser(user) });
});

const URL_FIELD_MAX = 300;

function cleanUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > URL_FIELD_MAX) return trimmed.slice(0, URL_FIELD_MAX);
  return trimmed;
}

router.patch("/me", requireAuth, async (req, res) => {
  const { customStatus, status, avatarColor, avatarUrl, bannerUrl, bannerColor, bio, pronouns, youtubeUrl, spotifyUrl } = req.body;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(customStatus !== undefined ? { customStatus: customStatus?.trim().slice(0, 80) || null } : {}),
      ...(status ? { status } : {}),
      ...(avatarColor ? { avatarColor } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl: cleanUrl(avatarUrl || "") } : {}),
      ...(bannerUrl !== undefined ? { bannerUrl: cleanUrl(bannerUrl || "") } : {}),
      ...(bannerColor ? { bannerColor } : {}),
      ...(bio !== undefined ? { bio: bio?.trim().slice(0, 190) || null } : {}),
      ...(pronouns !== undefined ? { pronouns: pronouns?.trim().slice(0, 40) || null } : {}),
      ...(youtubeUrl !== undefined ? { youtubeUrl: cleanUrl(youtubeUrl || "") } : {}),
      ...(spotifyUrl !== undefined ? { spotifyUrl: cleanUrl(spotifyUrl || "") } : {}),
    },
  });
  res.json({ user: publicUser(user) });
});

export { publicUser };
export default router;
