export interface DirectUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
}

export interface DirectConversation {
  id: string;
  user: DirectUser | null;
  updatedAt: string;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
}

export interface DirectMessageReplyTo {
  id: string;
  content: string;
  senderId: string;
  sender?: DirectUser | null;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  replyToId?: string | null;
  replyTo?: DirectMessageReplyTo | null;
  createdAt: string;
  updatedAt: string;
  sender: DirectUser | null;
}

export interface Friend {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  user: DirectUser | null;
}

export interface FriendRequests {
  incoming: Friend[];
  outgoing: Friend[];
}
