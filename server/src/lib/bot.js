import { prisma } from "./prisma.js";

const BOT_EMAIL = "bot@nexus.internal";

let cachedBotId = null;

// The official Nexus bot: seeded once, reused as the author of rich-widget
// messages (currently: polls). Its avatar color is the brand amber on
// purpose — the one place that color is allowed to show up outside a CTA.
export async function ensureBotUser() {
  if (cachedBotId) return cachedBotId;

  const bot = await prisma.user.upsert({
    where: { email: BOT_EMAIL },
    update: {},
    create: {
      username: "Nexus Anket Botu",
      discriminator: "0000",
      email: BOT_EMAIL,
      password: "!bot-account-no-login!",
      avatarColor: "#E8A23D",
      status: "ONLINE",
      isBot: true,
    },
  });

  cachedBotId = bot.id;
  return bot.id;
}
