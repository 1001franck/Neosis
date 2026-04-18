-- Ajout des champs video et partage d'ecran sur VoiceConnection
ALTER TABLE "VoiceConnection" ADD COLUMN "isVideoEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VoiceConnection" ADD COLUMN "isScreenSharing" BOOLEAN NOT NULL DEFAULT false;
