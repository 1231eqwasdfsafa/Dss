// Fields safe to expose about ANY user (profile cards, member lists, message
// authors) — excludes email/password, unlike the self-only view in auth.js.
export function publicProfile(user) {
  return {
    id: user.id,
    username: user.username,
    discriminator: user.discriminator,
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
