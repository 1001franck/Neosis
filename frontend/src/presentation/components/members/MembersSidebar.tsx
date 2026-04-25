/**
 * MEMBERS SIDEBAR COMPONENT
 * Sidebar droite affichant les membres du serveur (240px width)
 *
 * Responsabilites:
 * - Lister les membres par role
 * - Afficher les statuts (online/offline) via presence store
 * - Grouper par roles avec compteurs
 * - Gerer les avatars et presences
 * - Kick/Ban members (Owner/Admin)
 */

'use client';

import { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Member, Role } from '@domain/members/types';
import { MemberRole } from '@domain/members/types';

import { TEXT_COLORS } from '@shared/constants/colors';
import { useResponsiveLayout } from '@presentation/contexts/ResponsiveLayoutContext';
import { usePresenceStore } from '@application/members/presenceStore';
import { useLocale } from '@shared/hooks/useLocale';
import { UserProfileCard } from './UserProfileCard';

/**
 * Status de presence
 */
type PresenceStatus = 'online' | 'offline';

interface MembersSidebarProps {
  members: Member[];
  roles?: Role[];
  currentUserRole?: MemberRole;
  bannedUserIds?: Set<string>;
  serverId?: string;
  onMemberClick?: (memberId: string) => void;
  onChangeRole?: (memberId: string, role: MemberRole) => void;
  onTransferOwnership?: (memberId: string) => void;
  onKickMember?: (memberId: string) => void;
  onBanMember?: (memberId: string, durationHours?: number | null, reason?: string) => void;
}

/**
 * Retourne la couleur du statut
 */
function getStatusColor(status: PresenceStatus): string {
  switch (status) {
    case 'online':
      return 'bg-[#3ba55d]';
    case 'offline':
    default:
      return 'bg-[#747f8d]';
  }
}

const ROLE_COLORS: Record<string, string> = {
  [MemberRole.OWNER]: '#e2b714',
  [MemberRole.ADMIN]: '#5865f2',
  [MemberRole.MEMBER]: '',
};

/**
 * Ordre de tri des roles (OWNER en premier)
 */
const ROLE_ORDER: MemberRole[] = [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER];

export function MembersSidebar({
  members,
  roles: _roles = [],
  currentUserRole,
  bannedUserIds,
  serverId,
  onMemberClick,
  onChangeRole,
  onTransferOwnership,
  onKickMember,
  onBanMember,
}: MembersSidebarProps): React.ReactElement | null {
  // Responsive layout
  const { t } = useLocale();
  const { isMembersSidebarOpen: _isMembersSidebarOpen, toggleMembersSidebar: _toggleMembersSidebar, closeAllSidebars, isMobile } = useResponsiveLayout();

  // Presence store - get online users for this server
  const isUserOnline = usePresenceStore((state) => state.isUserOnline);

  // Track which member has the role dropdown open
  const [roleDropdownId, setRoleDropdownId] = useState<string | null>(null);
  // Transfer ownership confirmation modal
  const [transferTarget, setTransferTarget] = useState<Member | null>(null);
  // Kick confirmation
  const [kickTarget, setKickTarget] = useState<Member | null>(null);
  // Ban confirmation
  const [banTarget, setBanTarget] = useState<Member | null>(null);
  const [banDuration, setBanDuration] = useState<'permanent' | '1h' | '24h' | '7d'>('permanent');
  const [banReason, setBanReason] = useState('');
  // Profile card
  const [profileCardMember, setProfileCardMember] = useState<Member | null>(null);

  const isOwner = currentUserRole === MemberRole.OWNER;
  const canManageRoles = isOwner; // Seul OWNER peut gérer les rôles (selon matrice 1.2)

  /**
   * Get presence status for a member
   */
  const getPresenceStatus = (member: Member): PresenceStatus => {
    if (serverId && isUserOnline(serverId, member.userId)) {
      return 'online';
    }
    return 'offline';
  };

  /**
   * Grouper les membres par role (MemberRole enum)
   */
  const membersByRole = members.reduce<Record<string, Member[]>>((acc, member) => {
    const roleKey = member.role || MemberRole.MEMBER;
    if (!acc[roleKey]) {
      acc[roleKey] = [];
    }
    acc[roleKey].push(member);
    return acc;
  }, {});

  /**
   * Construire les groupes dans l'ordre correct
   */
  const ROLE_LABELS: Record<string, string> = {
    [MemberRole.OWNER]: t('members.roles.owner'),
    [MemberRole.ADMIN]: t('members.roles.admin'),
    [MemberRole.MEMBER]: t('members.roles.member'),
  };

  const roleGroups = ROLE_ORDER
    .filter(role => membersByRole[role] && membersByRole[role].length > 0)
    .map(role => ({
      key: role,
      label: ROLE_LABELS[role] || role,
      color: ROLE_COLORS[role] || '',
      members: membersByRole[role],
    }));

  return (
    <>
      {/* Close Button (Mobile only) */}
      {isMobile && (
        <div className="h-12 px-4 flex items-center justify-between border-b border-border">
          <h2 className="text-base font-semibold text-white">{t('members.list')}</h2>
          <button
            onClick={closeAllSidebars}
            className="p-2 text-muted-foreground hover:text-white transition-colors"
            aria-label="Fermer la liste des membres"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Members List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-hide">
        {roleGroups.map(({ key, label, color, members: roleMembers }) => {
          // Count online members in this role group
          const onlineCount = roleMembers.filter(m => getPresenceStatus(m) === 'online').length;

          return (
            <div key={key} className="mb-4">
              {/* Role Header */}
              <div className="flex items-center gap-2 px-2 mb-1">
                <h3
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: color || TEXT_COLORS.MUTED }}
                >
                  {label}
                </h3>
                <span className="text-xs text-muted-foreground">
                  — {onlineCount}/{roleMembers.length}
                </span>
              </div>

              {/* Members - online first, then offline */}
              <div className="space-y-0.5">
                {roleMembers
                  .sort((a, b) => {
                    const aOnline = getPresenceStatus(a) === 'online' ? 0 : 1;
                    const bOnline = getPresenceStatus(b) === 'online' ? 0 : 1;
                    if (aOnline !== bOnline) return aOnline - bOnline;
                    return a.user.username.localeCompare(b.user.username);
                  })
                  .map((member) => {
                    const presence = getPresenceStatus(member);
                    const isOffline = presence === 'offline';

                    return (
                      <div
                        key={member.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => { setProfileCardMember(member); onMemberClick?.(member.id); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setProfileCardMember(member); onMemberClick?.(member.id); } }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted transition-colors group cursor-pointer ${isOffline ? 'opacity-50' : ''}`}
                      >
                        {/* Avatar with Status */}
                        <div className="relative flex-shrink-0">
                            {member.user.avatar ? (
                              <img
                                src={member.user.avatar}
                                alt={member.user.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-xs font-semibold text-white">
                                {member.user.username.substring(0, 1).toUpperCase()}
                              </span>
                            </div>
                          )}

                          {/* Status Indicator */}
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(presence)}`}
                          />
                        </div>

                        {/* Username + ban badge */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="text-sm text-foreground truncate">
                              {member.user.username}
                            </p>
                            {bannedUserIds?.has(member.userId) && (
                              <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-900/60 text-red-400 border border-red-800/50">
                                Banni
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hover Icons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* More / Role Management */}
                          <div className="relative">
                            <button
                              className="p-1 text-muted-foreground hover:text-white transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (canManageRoles && member.role !== MemberRole.OWNER) {
                                  setRoleDropdownId(roleDropdownId === member.id ? null : member.id);
                                }
                              }}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="2"/>
                                <circle cx="12" cy="12" r="2"/>
                                <circle cx="12" cy="19" r="2"/>
                              </svg>
                            </button>

                            {/* Role Dropdown */}
                            {roleDropdownId === member.id && canManageRoles && member.role !== MemberRole.OWNER && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setRoleDropdownId(null)} />
                                <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                                  <p className="px-3 py-1 text-xs text-muted-foreground font-semibold uppercase">{t('members.roles.changeRole')}</p>
                                  {[MemberRole.ADMIN, MemberRole.MEMBER].map((role) => (
                                    <button
                                      key={role}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onChangeRole?.(member.id, role);
                                        setRoleDropdownId(null);
                                      }}
                                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors ${
                                        member.role === role ? 'text-blue-500 font-medium' : 'text-foreground'
                                      }`}
                                      disabled={member.role === role}
                                    >
                                      {role === MemberRole.ADMIN ? t('members.roles.adminLabel') : t('members.roles.memberLabel')}
                                      {member.role === role && ' \u2713'}
                                    </button>
                                  ))}

                                  {/* Transfer Ownership (Owner only) */}
                                  {isOwner && onTransferOwnership && (
                                    <>
                                      <div className="my-1 h-px bg-border" />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTransferTarget(member);
                                          setRoleDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-sm text-amber-500 hover:bg-amber-900/20 transition-colors"
                                      >
                                        {t('members.transfer.action')}
                                      </button>
                                    </>
                                  )}

                                  {/* Kick Member */}
                                  {canManageRoles && onKickMember && (
                                    <>
                                      <div className="my-1 h-px bg-border" />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setKickTarget(member);
                                          setRoleDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-sm text-orange-500 hover:bg-orange-900/20 transition-colors"
                                      >
                                        {t('members.kick.action')}
                                      </button>
                                    </>
                                  )}

                                  {/* Ban Member - OWNER only */}
                                  {isOwner && onBanMember && (
                                    <>
                                      {!onKickMember && <div className="my-1 h-px bg-border" />}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setBanTarget(member);
                                          setRoleDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-900/20 transition-colors"
                                      >
                                        {t('members.ban.action')}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transfer Ownership Confirmation Modal */}
      {transferTarget && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setTransferTarget(null)}>
          <div className="bg-card border border-border rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-2">{t('members.transfer.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('members.transfer.message')} <strong className="text-foreground">{transferTarget.user.username}</strong> {t('members.transfer.messageSuffix')}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTransferTarget(null)}
                className="px-4 py-2 text-sm rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  onTransferOwnership?.(transferTarget.id);
                  setTransferTarget(null);
                }}
                className="px-4 py-2 text-sm rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                {t('members.transfer.confirm')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Kick Confirmation Modal */}
      {kickTarget && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setKickTarget(null)}>
          <div className="bg-card border border-border rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-2">{t('members.kick.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('members.kick.message')} <strong className="text-foreground">{kickTarget.user.username}</strong> {t('members.kick.messageSuffix')}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setKickTarget(null)}
                className="px-4 py-2 text-sm rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  onKickMember?.(kickTarget.id);
                  setKickTarget(null);
                }}
                className="px-4 py-2 text-sm rounded bg-orange-600 text-white hover:bg-orange-700 transition-colors"
              >
                {t('members.kick.confirm')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Ban Confirmation Modal */}
      {banTarget && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setBanTarget(null)}>
          <div className="bg-card border border-border rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-2">{t('members.ban.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('members.ban.message')} <strong className="text-foreground">{banTarget.user.username}</strong> {t('members.ban.messageSuffix')}
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">{t('members.ban.duration')}</label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value as typeof banDuration)}
                  className="w-full px-3 py-2 text-sm rounded-md bg-secondary text-foreground border border-border"
                >
                  <option value="permanent">{t('members.ban.permanent')}</option>
                  <option value="1h">{t('members.ban.hour')}</option>
                  <option value="24h">{t('members.ban.day')}</option>
                  <option value="7d">{t('members.ban.week')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">{t('members.ban.reason')}</label>
                <input
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md bg-secondary text-foreground border border-border"
                  placeholder={t('members.ban.reasonPlaceholder')}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setBanTarget(null)}
                className="px-4 py-2 text-sm rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  const durationHours =
                    banDuration === '1h' ? 1 :
                    banDuration === '24h' ? 24 :
                    banDuration === '7d' ? 24 * 7 :
                    null;
                  onBanMember?.(banTarget.id, durationHours, banReason.trim() || undefined);
                  setBanTarget(null);
                  setBanReason('');
                  setBanDuration('permanent');
                }}
                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {t('members.ban.confirm')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* User Profile Card popup */}
      {profileCardMember && (
        <UserProfileCard
          user={{
            id: profileCardMember.user.id,
            username: profileCardMember.user.username,
            avatar: profileCardMember.user.avatar,
            bio: profileCardMember.user.bio,
            customStatus: profileCardMember.user.customStatus,
            statusEmoji: profileCardMember.user.statusEmoji,
            banner: profileCardMember.user.banner,
          }}
          role={profileCardMember.role}
          isOnline={serverId ? isUserOnline(serverId, profileCardMember.userId) : false}
          onClose={() => setProfileCardMember(null)}
        />
      )}
    </>
  );
}

export const MembersSidebarMemo = memo(MembersSidebar);
MembersSidebarMemo.displayName = 'MembersSidebar';

export default MembersSidebarMemo;
