import { describe, it, expect } from 'vitest';
import { Message } from '../../../src/domain/messages/entities/message.js';

describe('Message Entity', () => {
  const validParams = {
    id: 'msg-1',
    content: 'Hello world',
    memberId: 'member-1',
    channelId: 'channel-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('constructor', () => {
    it('should create a valid message', () => {
      const message = new Message(
        validParams.id,
        validParams.content,
        validParams.memberId,
        validParams.channelId,
        validParams.createdAt,
        validParams.updatedAt,
      );

      expect(message.id).toBe(validParams.id);
      expect(message.content).toBe(validParams.content);
      expect(message.memberId).toBe(validParams.memberId);
      expect(message.channelId).toBe(validParams.channelId);
      expect(message.deletedAt).toBeNull();
    });

    it('should throw on empty content', () => {
      expect(() => new Message('id', '', 'member', 'channel', new Date(), new Date())).toThrow();
    });

    it('should throw on whitespace-only content', () => {
      expect(() => new Message('id', '   ', 'member', 'channel', new Date(), new Date())).toThrow();
    });

    it('should throw on content exceeding 4000 characters', () => {
      const longContent = 'a'.repeat(4001);
      expect(() => new Message('id', longContent, 'member', 'channel', new Date(), new Date())).toThrow();
    });

    it('should accept content at exactly 4000 characters', () => {
      const content = 'a'.repeat(4000);
      const message = new Message('id', content, 'member', 'channel', new Date(), new Date());
      expect(message.content).toBe(content);
    });
  });

  describe('updateContent', () => {
    it('should update the content and timestamp', () => {
      const message = new Message(
        validParams.id,
        validParams.content,
        validParams.memberId,
        validParams.channelId,
        validParams.createdAt,
        validParams.updatedAt,
      );

      message.updateContent('Updated content');
      expect(message.content).toBe('Updated content');
      expect(message.updatedAt.getTime()).toBeGreaterThan(validParams.updatedAt.getTime());
    });

    it('should throw on empty update content', () => {
      const message = new Message(
        validParams.id,
        validParams.content,
        validParams.memberId,
        validParams.channelId,
        validParams.createdAt,
        validParams.updatedAt,
      );

      expect(() => message.updateContent('')).toThrow();
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt', () => {
      const message = new Message(
        validParams.id,
        validParams.content,
        validParams.memberId,
        validParams.channelId,
        validParams.createdAt,
        validParams.updatedAt,
      );

      expect(message.isDeleted()).toBe(false);
      message.softDelete();
      expect(message.isDeleted()).toBe(true);
      expect(message.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('belongsTo', () => {
    it('should return true for the owner member', () => {
      const message = new Message(
        validParams.id,
        validParams.content,
        validParams.memberId,
        validParams.channelId,
        validParams.createdAt,
        validParams.updatedAt,
      );

      expect(message.belongsTo('member-1')).toBe(true);
    });

    it('should return false for a different member', () => {
      const message = new Message(
        validParams.id,
        validParams.content,
        validParams.memberId,
        validParams.channelId,
        validParams.createdAt,
        validParams.updatedAt,
      );

      expect(message.belongsTo('other-member')).toBe(false);
    });
  });

  describe('isEdited', () => {
    it('should return false when createdAt equals updatedAt', () => {
      const date = new Date('2024-01-01');
      const message = new Message('id', 'content', 'member', 'channel', date, new Date(date));
      expect(message.isEdited()).toBe(false);
    });

    it('should return true when updatedAt is after createdAt', () => {
      const message = new Message(
        'id', 'content', 'member', 'channel',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );
      expect(message.isEdited()).toBe(true);
    });
  });

  describe('sanitize', () => {
    it('should strip HTML tags', () => {
      expect(Message.sanitize('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('should strip nested tags', () => {
      expect(Message.sanitize('<div><p>Hello</p></div>')).toBe('Hello');
    });

    it('should leave plain text unchanged', () => {
      expect(Message.sanitize('Hello world')).toBe('Hello world');
    });

    it('should handle self-closing tags', () => {
      expect(Message.sanitize('Hello<br/>world')).toBe('Helloworld');
    });

    it('should strip tags with attributes', () => {
      expect(Message.sanitize('<img src="x" onerror="alert(1)">')).toBe('');
    });
  });

  describe('toJSON', () => {
    it('should include authorId when author is set', () => {
      const message = new Message(
        validParams.id,
        validParams.content,
        validParams.memberId,
        validParams.channelId,
        validParams.createdAt,
        validParams.updatedAt,
      );
      message.author = { id: 'user-1', username: 'testuser', avatar: null };

      const json = message.toJSON();
      expect(json.authorId).toBe('user-1');
      expect(json.author).toBeDefined();
      expect(json.author!.username).toBe('testuser');
    });

    it('should fallback authorId to memberId when author not set', () => {
      const message = new Message(
        validParams.id,
        validParams.content,
        validParams.memberId,
        validParams.channelId,
        validParams.createdAt,
        validParams.updatedAt,
      );

      const json = message.toJSON();
      expect(json.authorId).toBe(validParams.memberId);
      expect(json.author).toBeUndefined();
    });
  });
});
