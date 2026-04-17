import { z } from 'zod';

export const RequestFriendDTO = z.object({
  username: z.string().min(1, 'Le nom d’utilisateur est requis')
});

export type RequestFriendInput = z.infer<typeof RequestFriendDTO>;

export const AcceptFriendDTO = z.object({
  friendshipId: z.string().uuid('friendshipId invalide')
});

export type AcceptFriendInput = z.infer<typeof AcceptFriendDTO>;

export const DeclineFriendDTO = z.object({
  friendshipId: z.string().uuid('friendshipId invalide')
});

export type DeclineFriendInput = z.infer<typeof DeclineFriendDTO>;

export const CancelFriendRequestDTO = z.object({
  friendshipId: z.string().uuid('friendshipId invalide')
});

export type CancelFriendRequestInput = z.infer<typeof CancelFriendRequestDTO>;

export const CreateDirectConversationDTO = z.object({
  otherUserId: z.string().uuid('otherUserId invalide')
});

export type CreateDirectConversationInput = z.infer<typeof CreateDirectConversationDTO>;

export const SendDirectMessageDTO = z.object({
  content: z
    .string({ message: 'Le contenu du message est requis' })
    .min(1, 'Le message ne peut pas être vide')
    .max(4000, 'Le message ne peut pas dépasser 4000 caractères')
});

export type SendDirectMessageInput = z.infer<typeof SendDirectMessageDTO>;
