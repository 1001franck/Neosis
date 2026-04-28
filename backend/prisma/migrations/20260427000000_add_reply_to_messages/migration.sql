-- Ajout du support de réponse aux messages (reply to)

-- Colonne replyToId sur Message
ALTER TABLE "Message" ADD COLUMN "replyToId" TEXT;
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey"
  FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Colonne replyToId sur DirectMessage
ALTER TABLE "DirectMessage" ADD COLUMN "replyToId" TEXT;
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_replyToId_fkey"
  FOREIGN KEY ("replyToId") REFERENCES "DirectMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
