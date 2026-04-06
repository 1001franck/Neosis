export interface DirectUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
}

export interface DirectConversation {
  id: string;
  user: DirectUser | null;
  updatedAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
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
