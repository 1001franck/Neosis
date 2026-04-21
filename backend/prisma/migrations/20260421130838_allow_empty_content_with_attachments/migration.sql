-- Supprime la contrainte content_not_empty pour autoriser un contenu vide
-- quand un message contient uniquement des pièces jointes.
-- La validation reste appliquée au niveau applicatif (CreateMessageUseCase).

ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "content_not_empty";

-- Rendre la colonne nullable pour permettre les messages sans texte
ALTER TABLE "Message" ALTER COLUMN "content" DROP NOT NULL;
