# 💾 Infrastructure - Database

## Responsabilité
- Implémentations des Repositories
- Prisma Client initialization
- Database migrations configuration

## Structure
```
repositories/     ← Repository implementations (1 fichier par Repository)
prisma.ts        ← Prisma Client singleton
```

## Fichiers
- `repositories/PrismaUserRepository.ts`
- `repositories/PrismaServerRepository.ts`
- `repositories/PrismaChannelRepository.ts`
- `repositories/PrismaMessageRepository.ts`
- `repositories/PrismaMemberRepository.ts`
- `prisma.ts` ← Client singleton
