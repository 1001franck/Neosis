import { describe, it, expect } from 'vitest';
import { Member, MemberRole } from '../../../src/domain/members/entities/Member.js';

describe('Member Entity', () => {
  describe('constructor', () => {
    it('should create a valid member', () => {
      const member = new Member('id', 'userId', 'serverId', MemberRole.MEMBER, new Date());
      expect(member.id).toBe('id');
      expect(member.role).toBe(MemberRole.MEMBER);
    });

    it('should throw on invalid role', () => {
      expect(() =>
        new Member('id', 'userId', 'serverId', 'INVALID' as MemberRole, new Date())
      ).toThrow('Rôle invalide');
    });
  });

  describe('role checks', () => {
    it('isOwner returns true for OWNER', () => {
      const member = new Member('id', 'userId', 'serverId', MemberRole.OWNER, new Date());
      expect(member.isOwner()).toBe(true);
      expect(member.isAdmin()).toBe(false);
    });

    it('isAdmin returns true for ADMIN', () => {
      const member = new Member('id', 'userId', 'serverId', MemberRole.ADMIN, new Date());
      expect(member.isAdmin()).toBe(true);
      expect(member.isOwner()).toBe(false);
    });

    it('isAdminOrOwner returns true for both OWNER and ADMIN', () => {
      const owner = new Member('id1', 'userId', 'serverId', MemberRole.OWNER, new Date());
      const admin = new Member('id2', 'userId', 'serverId', MemberRole.ADMIN, new Date());
      const member = new Member('id3', 'userId', 'serverId', MemberRole.MEMBER, new Date());

      expect(owner.isAdminOrOwner()).toBe(true);
      expect(admin.isAdminOrOwner()).toBe(true);
      expect(member.isAdminOrOwner()).toBe(false);
    });
  });

  describe('permissions', () => {
    it('canManageMessages should be true for OWNER and ADMIN', () => {
      const owner = new Member('id1', 'u', 's', MemberRole.OWNER, new Date());
      const admin = new Member('id2', 'u', 's', MemberRole.ADMIN, new Date());
      const member = new Member('id3', 'u', 's', MemberRole.MEMBER, new Date());

      expect(owner.canManageMessages()).toBe(true);
      expect(admin.canManageMessages()).toBe(true);
      expect(member.canManageMessages()).toBe(false);
    });

    it('canManageChannels should be true for OWNER and ADMIN', () => {
      const owner = new Member('id1', 'u', 's', MemberRole.OWNER, new Date());
      const admin = new Member('id2', 'u', 's', MemberRole.ADMIN, new Date());
      const member = new Member('id3', 'u', 's', MemberRole.MEMBER, new Date());

      expect(owner.canManageChannels()).toBe(true);
      expect(admin.canManageChannels()).toBe(true);
      expect(member.canManageChannels()).toBe(false);
    });

    it('canManageMembers should be true only for OWNER', () => {
      const owner = new Member('id1', 'u', 's', MemberRole.OWNER, new Date());
      const admin = new Member('id2', 'u', 's', MemberRole.ADMIN, new Date());
      const member = new Member('id3', 'u', 's', MemberRole.MEMBER, new Date());

      expect(owner.canManageMembers()).toBe(true);
      expect(admin.canManageMembers()).toBe(false);
      expect(member.canManageMembers()).toBe(false);
    });
  });

  describe('updateRole', () => {
    it('should update role to a valid role', () => {
      const member = new Member('id', 'userId', 'serverId', MemberRole.MEMBER, new Date());
      member.updateRole(MemberRole.ADMIN);
      expect(member.role).toBe(MemberRole.ADMIN);
    });

    it('should throw on invalid role update', () => {
      const member = new Member('id', 'userId', 'serverId', MemberRole.MEMBER, new Date());
      expect(() => member.updateRole('INVALID' as MemberRole)).toThrow();
    });
  });

  describe('toJSON', () => {
    it('should serialize without user when not set', () => {
      const member = new Member('id', 'userId', 'serverId', MemberRole.MEMBER, new Date());
      const json = member.toJSON();
      expect(json.id).toBe('id');
      expect(json.userId).toBe('userId');
      expect(json.role).toBe(MemberRole.MEMBER);
      expect(json).not.toHaveProperty('user');
    });

    it('should include user when set', () => {
      const member = new Member('id', 'userId', 'serverId', MemberRole.MEMBER, new Date());
      member.user = { id: 'userId', username: 'testuser', email: 'test@test.com', avatar: null };
      const json = member.toJSON();
      expect(json.user).toBeDefined();
      expect(json.user!.username).toBe('testuser');
    });
  });
});
