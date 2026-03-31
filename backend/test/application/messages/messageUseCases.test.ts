import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CreateMessageUseCase,
  UpdateMessageUseCase,
  DeleteMessageUseCase,
} from '../../../src/application/messages/usecases/messageUseCase.js';
import { Message } from '../../../src/domain/messages/entities/message.js';
import { Member, MemberRole } from '../../../src/domain/members/entities/Member.js';
import { Channel, ChannelType } from '../../../src/domain/channels/entities/channel.js';
import type { MessageRepository } from '../../../src/domain/messages/repositories/MessageRepository.js';
import type { IMemberRepository } from '../../../src/domain/members/repositories/IMemberRepository.js';
import type { ChannelRepository } from '../../../src/domain/channels/repositories/ChannelRepository.js';
import type { IBanRepository } from '../../../src/domain/bans/repositories/IBanRepository.js';
import { AppError, ErrorCode } from '../../../src/shared/errors/AppError.js';

// ============ MOCK FACTORIES ============

function createMockMessageRepository(): MessageRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByChannelId: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    deleteForUser: vi.fn(),
    hardDelete: vi.fn(),
    countByChannelId: vi.fn(),
    findRecentByChannelId: vi.fn(),
    exists: vi.fn(),
    linkAttachments: vi.fn(),
  };
}

function createMockBanRepository(): IBanRepository {
  return {
    create: vi.fn(),
    findActiveByUserAndServer: vi.fn().mockResolvedValue(null),
    delete: vi.fn(),
    findByServerId: vi.fn(),
  };
}

function createMockMemberRepository(): IMemberRepository {
  return {
    findById: vi.fn(),
    findByUserAndServer: vi.fn(),
    findByServerId: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countByServerId: vi.fn(),
    existsByUserAndServer: vi.fn(),
  };
}

function createMockChannelRepository(): ChannelRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByServerId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    existsInServer: vi.fn(),
    countMessages: vi.fn(),
  };
}

// ============ TEST DATA ============

const CHANNEL = new Channel('channel-1', 'general', ChannelType.TEXT, 'server-1', new Date());
const MEMBER = new Member('member-1', 'user-1', 'server-1', MemberRole.MEMBER, new Date());
const ADMIN_MEMBER = new Member('member-admin', 'user-admin', 'server-1', MemberRole.ADMIN, new Date());
const OWNER_MEMBER = new Member('member-owner', 'user-owner', 'server-1', MemberRole.OWNER, new Date());

// ============ CREATE MESSAGE TESTS ============

describe('CreateMessageUseCase', () => {
  let useCase: CreateMessageUseCase;
  let messageRepo: MessageRepository;
  let memberRepo: IMemberRepository;
  let channelRepo: ChannelRepository;
  let banRepo: IBanRepository;

  beforeEach(() => {
    messageRepo = createMockMessageRepository();
    memberRepo = createMockMemberRepository();
    channelRepo = createMockChannelRepository();
    banRepo = createMockBanRepository();
    useCase = new CreateMessageUseCase(messageRepo, memberRepo, channelRepo, banRepo);
  });

  it('should create a message when user is a member', async () => {
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(CHANNEL);
    (memberRepo.findByUserAndServer as ReturnType<typeof vi.fn>).mockResolvedValue(MEMBER);
    (messageRepo.create as ReturnType<typeof vi.fn>).mockImplementation(async (msg: Message) => msg);

    const result = await useCase.execute({
      content: 'Hello world',
      userId: 'user-1',
      channelId: 'channel-1',
    });

    expect(result).toBeInstanceOf(Message);
    expect(result.content).toBe('Hello world');
    expect(result.channelId).toBe('channel-1');
    expect(messageRepo.create).toHaveBeenCalledOnce();
  });

  it('should sanitize HTML tags from content', async () => {
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(CHANNEL);
    (memberRepo.findByUserAndServer as ReturnType<typeof vi.fn>).mockResolvedValue(MEMBER);
    (messageRepo.create as ReturnType<typeof vi.fn>).mockImplementation(async (msg: Message) => msg);

    const result = await useCase.execute({
      content: '<script>alert("xss")</script>Hello',
      userId: 'user-1',
      channelId: 'channel-1',
    });

    expect(result.content).toBe('alert("xss")Hello');
  });

  it('should throw when channel not found', async () => {
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(
      useCase.execute({ content: 'Hello', userId: 'user-1', channelId: 'unknown' })
    ).rejects.toThrow(AppError);
  });

  it('should throw when user is not a member', async () => {
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(CHANNEL);
    (memberRepo.findByUserAndServer as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(
      useCase.execute({ content: 'Hello', userId: 'non-member', channelId: 'channel-1' })
    ).rejects.toThrow(AppError);
  });

  it('should throw when content is empty', async () => {
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(CHANNEL);
    (memberRepo.findByUserAndServer as ReturnType<typeof vi.fn>).mockResolvedValue(MEMBER);

    await expect(
      useCase.execute({ content: '', userId: 'user-1', channelId: 'channel-1' })
    ).rejects.toThrow();
  });
});

// ============ UPDATE MESSAGE TESTS ============

describe('UpdateMessageUseCase', () => {
  let useCase: UpdateMessageUseCase;
  let messageRepo: MessageRepository;
  let memberRepo: IMemberRepository;
  let channelRepo: ChannelRepository;

  beforeEach(() => {
    messageRepo = createMockMessageRepository();
    memberRepo = createMockMemberRepository();
    channelRepo = createMockChannelRepository();
    useCase = new UpdateMessageUseCase(messageRepo, memberRepo, channelRepo);
  });

  it('should update a message when user is the author', async () => {
    const existingMessage = new Message('msg-1', 'Original', 'member-1', 'channel-1', new Date(), new Date());
    const updatedMessage = new Message('msg-1', 'Updated', 'member-1', 'channel-1', new Date(), new Date());

    (messageRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existingMessage);
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(CHANNEL);
    (memberRepo.findByUserAndServer as ReturnType<typeof vi.fn>).mockResolvedValue(MEMBER);
    (messageRepo.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedMessage);

    const result = await useCase.execute({
      messageId: 'msg-1',
      userId: 'user-1',
      channelId: 'channel-1',
      content: 'Updated',
    });

    expect(result.content).toBe('Updated');
    expect(messageRepo.update).toHaveBeenCalledWith('msg-1', 'Updated');
  });

  it('should throw when message not found', async () => {
    (messageRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(
      useCase.execute({ messageId: 'unknown', userId: 'user-1', channelId: 'channel-1', content: 'Updated' })
    ).rejects.toThrow(AppError);
  });

  it('should throw when message is deleted', async () => {
    const deletedMessage = new Message('msg-1', 'Original', 'member-1', 'channel-1', new Date(), new Date(), new Date());

    (messageRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(deletedMessage);

    await expect(
      useCase.execute({ messageId: 'msg-1', userId: 'user-1', channelId: 'channel-1', content: 'Updated' })
    ).rejects.toThrow(AppError);
  });

  it('should throw when user is not the author', async () => {
    const existingMessage = new Message('msg-1', 'Original', 'member-1', 'channel-1', new Date(), new Date());
    const differentMember = new Member('member-2', 'user-2', 'server-1', MemberRole.MEMBER, new Date());

    (messageRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existingMessage);
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(CHANNEL);
    (memberRepo.findByUserAndServer as ReturnType<typeof vi.fn>).mockResolvedValue(differentMember);

    await expect(
      useCase.execute({ messageId: 'msg-1', userId: 'user-2', channelId: 'channel-1', content: 'Updated' })
    ).rejects.toThrow(AppError);
  });

  it('should sanitize HTML from updated content', async () => {
    const existingMessage = new Message('msg-1', 'Original', 'member-1', 'channel-1', new Date(), new Date());

    (messageRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existingMessage);
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(CHANNEL);
    (memberRepo.findByUserAndServer as ReturnType<typeof vi.fn>).mockResolvedValue(MEMBER);
    (messageRepo.update as ReturnType<typeof vi.fn>).mockImplementation(async (_id: string, content: string) =>
      new Message('msg-1', content, 'member-1', 'channel-1', new Date(), new Date())
    );

    await useCase.execute({
      messageId: 'msg-1',
      userId: 'user-1',
      channelId: 'channel-1',
      content: '<img onerror="alert(1)">Safe text',
    });

    expect(messageRepo.update).toHaveBeenCalledWith('msg-1', 'Safe text');
  });
});

// ============ DELETE MESSAGE TESTS ============

describe('DeleteMessageUseCase', () => {
  let useCase: DeleteMessageUseCase;
  let messageRepo: MessageRepository;
  let memberRepo: IMemberRepository;
  let channelRepo: ChannelRepository;

  beforeEach(() => {
    messageRepo = createMockMessageRepository();
    memberRepo = createMockMemberRepository();
    channelRepo = createMockChannelRepository();
    useCase = new DeleteMessageUseCase(messageRepo, memberRepo, channelRepo);
  });

  it('should delete a message when user is the author', async () => {
    const existingMessage = new Message('msg-1', 'Hello', 'member-1', 'channel-1', new Date(), new Date());

    (messageRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existingMessage);
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(CHANNEL);
    (memberRepo.findByUserAndServer as ReturnType<typeof vi.fn>).mockResolvedValue(MEMBER);

    await useCase.execute({ messageId: 'msg-1', userId: 'user-1', channelId: 'channel-1' });

    expect(messageRepo.softDelete).toHaveBeenCalledWith('msg-1');
  });

  it('should allow admin to delete any message', async () => {
    const existingMessage = new Message('msg-1', 'Hello', 'member-1', 'channel-1', new Date(), new Date());

    (messageRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existingMessage);
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(CHANNEL);
    (memberRepo.findByUserAndServer as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_MEMBER);

    await useCase.execute({ messageId: 'msg-1', userId: 'user-admin', channelId: 'channel-1' });

    expect(messageRepo.softDelete).toHaveBeenCalledWith('msg-1');
  });

  it('should allow owner to delete any message', async () => {
    const existingMessage = new Message('msg-1', 'Hello', 'member-1', 'channel-1', new Date(), new Date());

    (messageRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existingMessage);
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(CHANNEL);
    (memberRepo.findByUserAndServer as ReturnType<typeof vi.fn>).mockResolvedValue(OWNER_MEMBER);

    await useCase.execute({ messageId: 'msg-1', userId: 'user-owner', channelId: 'channel-1' });

    expect(messageRepo.softDelete).toHaveBeenCalledWith('msg-1');
  });

  it('should throw when regular member tries to delete another members message', async () => {
    const existingMessage = new Message('msg-1', 'Hello', 'member-other', 'channel-1', new Date(), new Date());

    (messageRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existingMessage);
    (channelRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(CHANNEL);
    (memberRepo.findByUserAndServer as ReturnType<typeof vi.fn>).mockResolvedValue(MEMBER);

    await expect(
      useCase.execute({ messageId: 'msg-1', userId: 'user-1', channelId: 'channel-1' })
    ).rejects.toThrow(AppError);
  });

  it('should throw when message not found', async () => {
    (messageRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(
      useCase.execute({ messageId: 'unknown', userId: 'user-1', channelId: 'channel-1' })
    ).rejects.toThrow(AppError);
  });

  it('should throw when message is already deleted', async () => {
    const deletedMessage = new Message('msg-1', 'Hello', 'member-1', 'channel-1', new Date(), new Date(), new Date());

    (messageRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(deletedMessage);

    await expect(
      useCase.execute({ messageId: 'msg-1', userId: 'user-1', channelId: 'channel-1' })
    ).rejects.toThrow(AppError);
  });
});
