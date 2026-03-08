# 🔧 Dependency Injection

## Responsabilité
- Container setup & configuration
- Service registrations
- Singleton & transient lifecycle management

## Fichiers
- `Container.ts` ← Main DI Container (migré from config/)
- `modules/AuthModule.ts`
- `modules/ServerModule.ts`
- `modules/ChannelModule.ts`
- `modules/MessageModule.ts`
- `modules/MemberModule.ts`

## Usage
```typescript
const container = new Container();
const authService = container.get(AuthService);
```
