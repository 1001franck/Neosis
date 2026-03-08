/**
 * MOCK DATA - À SUPPRIMER EN PRODUCTION
 * 
 * Ce fichier contient des données de test pour le développement.
 * Il sera supprimé lors du passage aux vraies données du backend.
 * 
 * Pour désactiver les mocks: Supprimer ce dossier __mocks__
 */

import { ChannelType } from '@domain/channels/types';
import { MemberRole, MemberStatus } from '@domain/members/types';

// ============================================
// MOCK USERS
// ============================================
export const MOCK_USERS = [
  {
    id: '1',
    username: 'juxtopposed',
    avatar: 'https://i.pravatar.cc/150?img=1',
    discriminator: '1234',
    isOnline: true,
  },
  {
    id: '2',
    username: 'grass enjoyer',
    avatar: 'https://i.pravatar.cc/150?img=2',
    discriminator: '5678',
    isOnline: true,
  },
  {
    id: '3',
    username: 'silly',
    avatar: 'https://i.pravatar.cc/150?img=3',
    discriminator: '9012',
    isOnline: true,
  },
];

// ============================================
// MOCK MESSAGES
// ============================================
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const MOCK_MESSAGES = [
  {
    id: '1',
    userId: '1',
    username: 'juxtopposed',
    avatar: 'https://i.pravatar.cc/150?img=1',
    content: 'yooooo',
    timestamp: '10:30 am',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 30 * 60 * 1000), // 10:30
    isCurrentUser: true,
  },
  {
    id: '2',
    userId: '2',
    username: 'grass enjoyer',
    avatar: 'https://i.pravatar.cc/150?img=2',
    content: 'yooooooooo',
    timestamp: '10:30 am',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 31 * 60 * 1000), // 10:31
    isCurrentUser: false,
  },
  {
    id: '3',
    userId: '1',
    username: 'juxtopposed',
    avatar: 'https://i.pravatar.cc/150?img=1',
    content: "what's up with **you**? Check this `code` out!",
    timestamp: '10:30 am',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 32 * 60 * 1000), // 10:32
    isCurrentUser: true,
  },
  {
    id: '4',
    userId: '2',
    username: 'grass enjoyer',
    avatar: 'https://i.pravatar.cc/150?img=2',
    content: "enjoying the day! *how's your weekend going?*",
    timestamp: '10:30 am',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 33 * 60 * 1000), // 10:33
    isCurrentUser: false,
  },
  {
    id: '5',
    userId: '1',
    username: 'juxtopposed',
    avatar: 'https://i.pravatar.cc/150?img=1',
    content: 'pretty good',
    timestamp: '10:30 am',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 35 * 60 * 1000), // 10:35
    isCurrentUser: true,
  },
  {
    id: '6',
    userId: '2',
    username: 'grass enjoyer',
    avatar: 'https://i.pravatar.cc/150?img=2',
    content: 'awesome. goodbye.',
    timestamp: '10:30 am',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 40 * 60 * 1000), // 10:40 - Plus de 5 min, nouveau groupe
    isCurrentUser: false,
  },
  {
    id: '7',
    userId: '1',
    username: 'juxtopposed',
    avatar: 'https://i.pravatar.cc/150?img=1',
    content: 'amazement',
    timestamp: '10:30 am',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 45 * 60 * 1000), // 10:45
    isCurrentUser: true,
  },
];

// ============================================
// MOCK DIRECT MESSAGES LIST
// ============================================
export const MOCK_DIRECT_MESSAGES = [
  {
    id: '1',
    userId: '3',
    username: 'silly',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Hey! How are you?',
    timestamp: '2h ago',
    unread: 0,
    isOnline: true,
  },
];

// ============================================
// MOCK SERVERS
// ============================================
export const MOCK_SERVERS = [
  {
    id: '1',
    name: 'MY',
    icon: undefined,
    ownerId: '1',
    memberCount: 42,
    online: 12,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
  {
    id: '2',
    name: 'GA',
    icon: undefined,
    ownerId: '1',
    memberCount: 128,
    online: 45,
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
  {
    id: '3',
    name: 'DE',
    icon: undefined,
    ownerId: '1',
    memberCount: 15,
    online: 8,
    createdAt: new Date('2024-03-10').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
];

// ============================================
// MOCK SERVER FULL DATA (TouchGrass HQ)
// ============================================
export const MOCK_TOUCHGRASS_SERVER = {
  id: 'touchgrass-hq',
  name: 'TouchGrass HQ',
  icon: undefined,
  ownerId: '1',
  memberCount: 156,
  online: 89,
  createdAt: new Date('2024-01-15').toISOString(),
  updatedAt: new Date('2024-09-26').toISOString(),
};

// ============================================
// MOCK CHANNEL CATEGORIES
// ============================================
export const MOCK_CATEGORIES = [
  {
    id: 'text-channels',
    serverId: 'touchgrass-hq',
    name: 'TEXT CHANNELS',
    position: 0,
    isCollapsed: false,
  },
  {
    id: 'voice-channels',
    serverId: 'touchgrass-hq',
    name: 'VOICE CHANNELS',
    position: 1,
    isCollapsed: false,
  },
];

// ============================================
// MOCK CHANNELS
// ============================================
export const MOCK_CHANNELS = [
  // Text Channels
  {
    id: 'general-chat',
    serverId: 'touchgrass-hq',
    name: 'general-chat',
    type: ChannelType.TEXT,
    topic: 'General discussion about grass',
    position: 0,
    isPrivate: false,
    categoryId: 'text-channels',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
  {
    id: 'grass-update',
    serverId: 'touchgrass-hq',
    name: 'grass update',
    type: ChannelType.TEXT,
    position: 1,
    isPrivate: false,
    categoryId: 'text-channels',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
  {
    id: 'grass-discussions',
    serverId: 'touchgrass-hq',
    name: 'grass discussions',
    type: ChannelType.TEXT,
    position: 2,
    isPrivate: false,
    categoryId: 'text-channels',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
  {
    id: 'grass-pictures',
    serverId: 'touchgrass-hq',
    name: 'grass pictures',
    type: ChannelType.TEXT,
    position: 3,
    isPrivate: false,
    categoryId: 'text-channels',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
  {
    id: 'grass-faq',
    serverId: 'touchgrass-hq',
    name: 'grass faq',
    type: ChannelType.TEXT,
    position: 4,
    isPrivate: false,
    categoryId: 'text-channels',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
  {
    id: 'forum',
    serverId: 'touchgrass-hq',
    name: 'forum',
    type: ChannelType.TEXT,
    position: 5,
    isPrivate: false,
    categoryId: 'text-channels',
    createdAt: new Date('2024-03-20').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
  // Voice Channels
  {
    id: 'just-chilling',
    serverId: 'touchgrass-hq',
    name: 'just chilling',
    type: ChannelType.VOICE,
    position: 0,
    isPrivate: false,
    categoryId: 'voice-channels',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
  {
    id: 'grass-only',
    serverId: 'touchgrass-hq',
    name: 'grass-only',
    type: ChannelType.VOICE,
    position: 1,
    isPrivate: false,
    categoryId: 'voice-channels',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
  {
    id: 'grass-talk',
    serverId: 'touchgrass-hq',
    name: 'grass talk',
    type: ChannelType.VOICE,
    position: 2,
    isPrivate: false,
    categoryId: 'voice-channels',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
  {
    id: 'relaxing-music-stage',
    serverId: 'touchgrass-hq',
    name: 'relaxing music stage',
    type: ChannelType.VOICE,
    position: 3,
    isPrivate: false,
    categoryId: 'voice-channels',
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-09-26').toISOString(),
  },
];

// ============================================
// MOCK ROLES
// ============================================
export const MOCK_ROLES = [
  {
    id: 'admin',
    serverId: 'touchgrass-hq',
    name: 'Admins',
    color: '#f47fff',
    position: 100,
    permissions: ['ADMINISTRATOR'],
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'moderator',
    serverId: 'touchgrass-hq',
    name: 'Moderators',
    color: '#5865f2',
    position: 50,
    permissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS'],
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'grass-expert',
    serverId: 'touchgrass-hq',
    name: 'Grass Experts',
    color: '#3ba55d',
    position: 30,
    permissions: [],
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'member',
    serverId: 'touchgrass-hq',
    name: 'Members',
    color: undefined,
    position: 0,
    permissions: [],
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// ============================================
// MOCK MEMBERS
// ============================================
export const MOCK_MEMBERS = [
  {
    id: 'member-1',
    serverId: 'touchgrass-hq',
    userId: 'user-2',
    role: MemberRole.ADMIN,
    status: MemberStatus.ACTIVE,
    joinedAt: '2024-01-01T00:00:00.000Z',
    presenceStatus: 'online' as const,
    user: {
      id: 'user-2',
      username: 'grass enjoyer',
      email: 'grass@example.com',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
  },
  {
    id: 'member-2',
    serverId: 'touchgrass-hq',
    userId: 'user-4',
    role: MemberRole.MEMBER,
    status: MemberStatus.ACTIVE,
    joinedAt: '2024-01-02T00:00:00.000Z',
    presenceStatus: 'dnd' as const,
    user: {
      id: 'user-4',
      username: 'NOT a grass enjoyer',
      email: 'notgrass@example.com',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
  },
  {
    id: 'member-3',
    serverId: 'touchgrass-hq',
    userId: 'user-5',
    role: MemberRole.MEMBER,
    status: MemberStatus.ACTIVE,
    joinedAt: '2024-01-03T00:00:00.000Z',
    presenceStatus: 'online' as const,
    user: {
      id: 'user-5',
      username: 'sun enthusiast',
      email: 'sun@example.com',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
  },
  {
    id: 'member-4',
    serverId: 'touchgrass-hq',
    userId: 'user-1',
    role: MemberRole.OWNER,
    status: MemberStatus.ACTIVE,
    joinedAt: '2024-01-01T00:00:00.000Z',
    presenceStatus: 'online' as const,
    user: {
      id: 'user-1',
      username: 'juxtopposed',
      email: 'juxto@example.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
  },
  {
    id: 'member-5',
    serverId: 'touchgrass-hq',
    userId: 'user-6',
    role: MemberRole.MEMBER,
    status: MemberStatus.ACTIVE,
    joinedAt: '2024-01-05T00:00:00.000Z',
    presenceStatus: 'idle' as const,
    user: {
      id: 'user-6',
      username: 'nature lover',
      email: 'nature@example.com',
      avatar: 'https://i.pravatar.cc/150?img=6',
    },
  },
  {
    id: 'member-6',
    serverId: 'touchgrass-hq',
    userId: 'user-7',
    role: MemberRole.MEMBER,
    status: MemberStatus.ACTIVE,
    joinedAt: '2024-01-06T00:00:00.000Z',
    presenceStatus: 'offline' as const,
    user: {
      id: 'user-7',
      username: 'outdoor warrior',
      email: 'outdoor@example.com',
      avatar: 'https://i.pravatar.cc/150?img=7',
    },
  },
  {
    id: 'member-7',
    serverId: 'touchgrass-hq',
    userId: 'user-8',
    role: MemberRole.MEMBER,
    status: MemberStatus.ACTIVE,
    joinedAt: '2024-01-07T00:00:00.000Z',
    presenceStatus: 'online' as const,
    user: {
      id: 'user-8',
      username: 'sunshine seeker',
      email: 'sunshine@example.com',
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
  },
  {
    id: 'member-8',
    serverId: 'touchgrass-hq',
    userId: 'user-9',
    role: MemberRole.MEMBER,
    status: MemberStatus.ACTIVE,
    joinedAt: '2024-01-08T00:00:00.000Z',
    presenceStatus: 'online' as const,
    user: {
      id: 'user-9',
      username: 'plant whisperer',
      email: 'plant@example.com',
      avatar: 'https://i.pravatar.cc/150?img=9',
    },
  },
];

// ============================================
// MOCK CHANNEL MEDIA (grass pictures)
// ============================================
export const MOCK_CHANNEL_MEDIA = [
  {
    id: 'media-1',
    channelId: 'general',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=200',
    name: 'grass-field-1.jpg',
    size: 245678,
    uploadedBy: 'member-1',
    uploadedAt: '2024-09-20T10:30:00.000Z',
    createdAt: '2024-09-20T10:30:00.000Z',
  },
  {
    id: 'media-2',
    channelId: 'general',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=200',
    name: 'morning-dew.jpg',
    size: 189432,
    uploadedBy: 'member-5',
    uploadedAt: '2024-09-21T08:15:00.000Z',
    createdAt: '2024-09-21T08:15:00.000Z',
  },
  {
    id: 'media-3',
    channelId: 'general',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200',
    name: 'green-pasture.jpg',
    size: 312789,
    uploadedBy: 'member-3',
    uploadedAt: '2024-09-22T14:20:00.000Z',
    createdAt: '2024-09-22T14:20:00.000Z',
  },
  {
    id: 'media-4',
    channelId: 'general',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200',
    name: 'meadow.jpg',
    size: 278543,
    uploadedBy: 'member-1',
    uploadedAt: '2024-09-23T11:45:00.000Z',
    createdAt: '2024-09-23T11:45:00.000Z',
  },
  {
    id: 'media-5',
    channelId: 'general',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200',
    name: 'grass-macro.jpg',
    size: 423156,
    uploadedBy: 'member-8',
    uploadedAt: '2024-09-24T16:30:00.000Z',
    createdAt: '2024-09-24T16:30:00.000Z',
  },
  {
    id: 'media-6',
    channelId: 'general',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200',
    name: 'sunset-grass.jpg',
    size: 356891,
    uploadedBy: 'member-7',
    uploadedAt: '2024-09-25T19:00:00.000Z',
    createdAt: '2024-09-25T19:00:00.000Z',
  },
  {
    id: 'media-7',
    channelId: 'general',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1469131071241-51271e8f6c62?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1469131071241-51271e8f6c62?w=200',
    name: 'rolling-hills.jpg',
    size: 298765,
    uploadedBy: 'member-6',
    uploadedAt: '2024-09-25T09:30:00.000Z',
    createdAt: '2024-09-25T09:30:00.000Z',
  },
  {
    id: 'media-8',
    channelId: 'general',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=200',
    name: 'forest-ground.jpg',
    size: 401234,
    uploadedBy: 'member-5',
    uploadedAt: '2024-09-26T12:15:00.000Z',
    createdAt: '2024-09-26T12:15:00.000Z',
  },
  {
    id: 'media-9',
    channelId: 'general',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1490718687940-0ecadf414600?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1490718687940-0ecadf414600?w=200',
    name: 'wild-grass.jpg',
    size: 267890,
    uploadedBy: 'member-1',
    uploadedAt: '2024-09-26T15:45:00.000Z',
    createdAt: '2024-09-26T15:45:00.000Z',
  },
];

// ============================================
// CURRENT CHAT (Active conversation)
// ============================================
export const MOCK_CURRENT_CHAT = {
  recipientName: 'silly',
  recipientAvatar: 'https://i.pravatar.cc/150?img=3',
  recipientStatus: 'online' as const,
  messages: MOCK_MESSAGES,
};

// ============================================

