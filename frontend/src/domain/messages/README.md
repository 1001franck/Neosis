# 💌 Domain - Messages

## Responsabilité
- Types métier pour les messages
- Erreurs spécifiques au domaine messages

## Fichiers
- `types.ts` : Message, Attachment, MessageReaction, MessageStatus, CreateMessageRequest
- `errors.ts` : MessageError, MessageNotFoundError, MessageAccessDeniedError, EmptyMessageError

## Règles
-  Aucune dépendance externe
-  Status enum pour états du message
-  Support attachments et reactions
