# 👥 Domain - Members

## Responsabilité
- Types métier pour les membres des serveurs
- Erreurs spécifiques au domaine membres

## Fichiers
- `types.ts` : Member, MemberRole, MemberStatus, UpdateMemberRequest, BanMemberRequest, KickMemberRequest
- `errors.ts` : MemberError, MemberNotFoundError, MemberAlreadyBannedError, InsufficientPermissionsError

## Règles
-  Aucune dépendance externe
-  Enums pour roles et status
-  Support ban et kick
