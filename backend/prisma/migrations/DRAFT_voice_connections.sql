-- Migration: Ajouter la table VoiceConnection
-- Description: Tracker les utilisateurs connectés dans les voice channels

CREATE TABLE "VoiceConnection" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "channelId" TEXT NOT NULL,
  "isMuted" BOOLEAN NOT NULL DEFAULT false,
  "isDeafened" BOOLEAN NOT NULL DEFAULT false,
  "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "VoiceConnection_pkey" PRIMARY KEY ("id")
);

-- Contrainte : Un utilisateur ne peut être connecté qu'à un seul voice channel à la fois
CREATE UNIQUE INDEX "VoiceConnection_userId_key" ON "VoiceConnection"("userId");

-- Index pour les requêtes par channel
CREATE INDEX "VoiceConnection_channelId_idx" ON "VoiceConnection"("channelId");

-- Foreign keys
ALTER TABLE "VoiceConnection" ADD CONSTRAINT "VoiceConnection_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoiceConnection" ADD CONSTRAINT "VoiceConnection_channelId_fkey"
  FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
