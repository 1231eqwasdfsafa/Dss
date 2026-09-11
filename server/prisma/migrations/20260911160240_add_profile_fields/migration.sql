-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "discriminator" TEXT NOT NULL DEFAULT '0001',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatarColor" TEXT NOT NULL DEFAULT '#5865F2',
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "bannerColor" TEXT NOT NULL DEFAULT '#4C3B2C',
    "bio" TEXT,
    "pronouns" TEXT,
    "youtubeUrl" TEXT,
    "spotifyUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "customStatus" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("avatarColor", "createdAt", "customStatus", "discriminator", "email", "id", "isBot", "password", "status", "username") SELECT "avatarColor", "createdAt", "customStatus", "discriminator", "email", "id", "isBot", "password", "status", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_username_idx" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
