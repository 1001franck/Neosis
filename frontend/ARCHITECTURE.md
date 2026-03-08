# 🎯 Frontend Architecture - Clean Code Standards

## Overview

This frontend follows **Clean Architecture** principles with standards equivalent to **30+ years of professional development experience**.

## Architecture Layers

### 1. **Presentation Layer** (`src/presentation/`)
- React components and pages
- UI logic and styling
- Route protection and navigation
- Error boundaries and fallback UIs

**Key Files:**
- `components/` - Reusable components
- `components/common/` - Base UI components (Button, Card, Loading, etc.)
- `components/auth/` - Route guards (ProtectedRoute, PublicRoute)
- `components/error/` - ErrorBoundary for error handling
- `components/toast/` - Toast notification system

### 2. **Application Layer** (`src/application/`)
- Business logic orchestration
- State management with Zustand
- Custom React hooks
- Service integration

**Pattern per Feature:**
```
feature/
  ├── use[Feature].ts          # Main hook
  ├── [feature]Store.ts        # Zustand store
  ├── [feature]Service.ts      # Business logic
  ├── selectors.ts             # ⚠️ Deprecated
  └── README.md                # Feature docs
```

**Hook Structure:**
```typescript
export function use[Feature]() {
  // === STATE SELECTORS ===
  const state = useStore((s) => s.state);
  
  // === STORE ACTIONS ===
  const setState = useStore((s) => s.setState);
  
  // === EFFECTS ===
  useEffect(() => { ... }, []);
  
  // === CALLBACKS ===
  const action = useCallback(async () => { ... }, []);
  
  // === RETURN ===
  return { state, action };
}
```

### 3. **Domain Layer** (`src/domain/`)
- Business rules (types, errors)
- No external dependencies
- Shared across frontend and backend

**Files per Domain:**
- `types.ts` - TypeScript interfaces
- `errors.ts` - Custom error classes
- `repositories/` - Abstract repository interfaces (if needed)

### 4. **Infrastructure Layer** (`src/infrastructure/`)
- API clients (Axios)
- WebSocket setup
- Local storage management
- External service integrations

**Structure:**
```
infrastructure/
  ├── api/
  │   ├── client.ts           # Axios instance
  │   ├── auth.api.ts
  │   ├── servers.api.ts
  │   └── ...
  ├── websocket/
  │   ├── socket.ts
  │   ├── emitters.ts
  │   └── listeners.ts
  └── storage/
      └── localStorage.ts
```

### 5. **Shared Layer** (`src/shared/`)
- Utilities and helpers
- Constants
- Common types and configurations
- Error definitions

**Structure:**
```
shared/
  ├── config/                 # Environment config
  ├── constants/              # App constants
  ├── decorators/             # Custom decorators
  ├── errors/                 # Base error classes
  ├── types/                  # Global types
  └── utils/                  # Utility functions
```

---

## Key Standards

### 1. Logging
Every async operation includes logging:

```typescript
const listServers = useCallback(async () => {
  logger.info('Fetching servers');
  try {
    const servers = await serverService.getServers();
    logger.info('Servers fetched', { count: servers.length });
    return servers;
  } catch (err) {
    logger.error('Failed to fetch servers', err);
    throw err;
  }
}, []);
```

### 2. Error Handling
Complete error handling with user feedback:

```typescript
const createServer = useCallback(async (request) => {
  try {
    const server = await serverService.createServer(request);
    toast.success('Server created successfully');
    return server;
  } catch (error) {
    const message = (error as Error).message;
    logger.error('Failed to create server', error);
    toast.error(message || 'Failed to create server');
    throw error;
  }
}, []);
```

### 3. State Management
Three-level state hierarchy:

**Level 1: Component State** (useState)
- Local UI state (form inputs, modals)
- Should be kept minimal

**Level 2: Custom Hook State** (Zustand + useCallback)
- Feature-level business state
- Shared between components

**Level 3: Global State** (Providers)
- App-wide concerns (auth, notifications)
- Configured in layout.tsx

### 4. Typing
Strict TypeScript everywhere:

```typescript
//  Good
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', ...props }: ButtonProps): JSX.Element {
  // ...
}

// ❌ Never use
const Button = (props: any) => { ... }
```

### 5. Imports
Use centralized exports for shorter, cleaner imports:

```typescript
//  Good (clean)
import { useAuth, useServers, useChannels } from '@application';
import { Button, Card, Loading } from '@presentation';

// ❌ Bad (cluttered)
import { useAuth } from '@application/auth/useAuth';
import { useServers } from '@application/servers/useServersHook';
import { Button } from '@presentation/components/common/Button';
```

---

## Component Guidelines

### Reusable Components
Located in `src/presentation/components/common/`:

- **Button** - Variants: primary, secondary, danger, ghost
- **Card** - Container with optional header/footer
- **Loading** - Spinner with message
- **ErrorBoundary** - Catches React errors
- **Toast** - Notifications with auto-dismiss

All components must:
-  Be fully typed (TypeScript)
-  Have JSDoc documentation
-  Support common props (className, etc.)
-  Use Tailwind for styling
-  Be accessible (ARIA labels)

### Feature-Specific Components
Located in `src/presentation/components/[feature]/`:

- Specific to that domain
- Can use domain-specific types
- Should use reusable components from `common/`

---

## Route Structure

### Protected Routes
For pages requiring authentication:

```typescript
// app/dashboard/page.tsx
import { ProtectedRoute } from '@presentation';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### Public Routes
For pages like login/register:

```typescript
// app/auth/login/page.tsx
import { PublicRoute } from '@presentation';

export default function LoginPage() {
  return (
    <PublicRoute>
      <LoginForm />
    </PublicRoute>
  );
}
```

---

## Data Flow

```
User Action
    ↓
Component Event
    ↓
Hook Callback (useCallback)
    ↓
Service Method (API call)
    ↓
Infrastructure Layer (Axios/WebSocket)
    ↓
Server API
    ↓
Service returns data
    ↓
Store update (Zustand)
    ↓
Hook re-renders component
    ↓
UI updates
```

---

## Common Tasks

### Adding a New Feature

1. **Create domain types:**
   ```typescript
   // src/domain/[feature]/types.ts
   export interface MyEntity { ... }
   ```

2. **Create store:**
   ```typescript
   // src/application/[feature]/[feature]Store.ts
   export const use[Feature]Store = create<State>((set) => ({ ... }));
   ```

3. **Create service:**
   ```typescript
   // src/application/[feature]/[feature]Service.ts
   export class [Feature]Service { ... }
   ```

4. **Create hook:**
   ```typescript
   // src/application/[feature]/use[Feature].ts
   export function use[Feature]() { ... }
   ```

5. **Create component:**
   ```typescript
   // src/presentation/components/[feature]/[Feature]Component.tsx
   export function [Feature]Component() { ... }
   ```

### Adding a New Component

1. Create in `src/presentation/components/[folder]/`
2. Ensure full TypeScript typing
3. Add JSDoc comments
4. Use Tailwind for styles
5. Export from appropriate index.ts

---

## Best Practices

### DO 
- Use hooks instead of direct store access
- Include logging in async operations
- Handle all error cases
- Type all props and returns
- Write JSDoc comments
- Keep components small and focused
- Reuse components from `common/`
- Use Tailwind classes
- Make components accessible

### DON'T ❌
- Import stores directly in components
- Import services directly in components
- Use `any` type
- Skip error handling
- Create duplicate components
- Hardcode strings (use constants)
- Ignore TypeScript errors
- Create inline styles
- Forget logging for async operations

---

## File Structure Reference

```
frontend/src/
├── app/
│   ├── layout.tsx          ← Wrapped with <Providers>
│   ├── page.tsx
│   ├── auth/
│   ├── dashboard/
│   └── servers/
│
├── application/            ← Business logic & hooks
│   ├── index.ts            ← Central exports
│   ├── auth/
│   │   ├── useAuth.ts      ← Main hook
│   │   ├── authStore.ts    ← Zustand store
│   │   ├── authService.ts  ← Business logic
│   │   └── README.md
│   └── [feature]/
│
├── config/                 ← Configuration
│   ├── providers.tsx       ← Provider stack
│   └── queryClient.ts
│
├── domain/                 ← Business rules
│   ├── [feature]/
│   │   ├── types.ts
│   │   ├── errors.ts
│   │   └── README.md
│   └── ...
│
├── infrastructure/         ← External services
│   ├── api/
│   ├── websocket/
│   └── storage/
│
├── presentation/           ← UI & components
│   ├── index.ts            ← Central exports
│   └── components/
│       ├── common/         ← Reusable components
│       ├── auth/           ← Route guards
│       ├── error/          ← Error boundary
│       ├── toast/          ← Notifications
│       └── [feature]/      ← Feature-specific
│
├── shared/                 ← Shared utilities
│   ├── config/
│   ├── constants/
│   ├── errors/
│   ├── types/
│   └── utils/
│
└── lib/
    └── utils.ts
```

---

## Code Review Checklist

- [ ] All TypeScript errors resolved
- [ ] No unused imports
- [ ] All props properly typed
- [ ] All functions have JSDoc
- [ ] Logging included for async operations
- [ ] Error handling complete
- [ ] No direct store/service imports (except in hooks/services)
- [ ] Components are reusable and focused
- [ ] Tailwind classes used consistently
- [ ] No hardcoded strings (use constants)

---

## Resources

- **[REFACTORING_GUIDE.md](../REFACTORING_GUIDE.md)** - Implementation details
- **[QUICK_START.ts](../QUICK_START.ts)** - Code examples
- **[REFACTORING_SUMMARY.md](../REFACTORING_SUMMARY.md)** - Changes overview

---

**Last Updated:** January 28, 2026  
**Status:** Production Ready   
