# État du projet — 2026-03-29

## ✅ Fait (session en cours)

- Réactions emoji : backend complet (Prisma, use cases, socket) + frontend (emitters, listeners, UI)
- CI/CD : `.github/workflows/ci.yml` et `cd.yml` créés
- Casing Linux : `PrismaMessageRepository.ts` renommé (minuscule → majuscule)
- ESLint : hooks avant early return dans `ServerChannelsSidebar.tsx`
- ESLint : ordre déclarations dans `Toast.tsx` et `ToastProvider.tsx`
- ESLint : `react-hooks/set-state-in-effect` et `react-compiler/react-compiler` désactivés dans `eslint.config.mjs`
- ESLint : `VoiceMiniPanel.tsx` — `useMemo` déplacé avant early return
- ESLint : `voice/types.ts` — `{}` → `Record<string, never>`

---

## ❌ Erreurs ESLint restantes (8 errors — bloquent CI)

### 1. `VoiceClient.ts` ligne 256
- Règle : `@typescript-eslint/no-explicit-any`
- Contexte : paramètre `signal: any` dans le listener WebRTC
- Fix : ajouter `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- signal WebRTC opaque, format imposé par la spec WebRTC`

### 2. `ProtectedRoute.tsx` ligne 68
- Règle : `react/no-unescaped-entities`
- Texte : `Redirection vers l'authentification...`
- Fix : `l&apos;authentification`

### 3. `MessageList.tsx` lignes 280 et 379
- Règle : `react-hooks/purity` (NB : ce n'est PAS `react-compiler/react-compiler` — c'est une règle distincte)
- Message : `Error: Cannot call impure function during render`
- Contexte : appels à `Date.now()` et `new Date()` dans le JSX (inline dans les props)
- Fix option A : ajouter `'react-hooks/purity': 'off'` dans `eslint.config.mjs`
- Fix option B : extraire le calcul dans une variable avant le return

### 4. `ChannelSettingsModal.tsx` ligne 102
- Règle : `react/no-unescaped-entities`
- Texte : `Personnalisez l'apparence et le contenu de #...`
- Fix : `l&apos;apparence`

### 5. `ChannelSettingsModal.tsx` ligne 202
- Règle : `react/no-unescaped-entities` (deux fois — guillemets `"`)
- Fix : remplacer les `"` par `&quot;` ou utiliser `{'\"'}` ou reformuler

### 6. `ServerSettingsModal.tsx` ligne 196
- Règle : `react/no-unescaped-entities`
- Texte : `Supprimer l'image`
- Fix : `l&apos;image`

---

## ❌ Tests backend échouants (9 failures — bloquent CI)

### Groupe 1 — `message.test.ts` : sanitize HTML (4 tests)
- Tests : `should strip HTML tags`, `should strip nested tags`, `should handle self-closing tags`, `should strip tags with attributes`
- Problème : `Message.sanitize()` ne supprime pas les balises HTML — elle retourne le contenu tel quel
- Cause probable : la méthode `sanitize` n'est pas implémentée ou est différente de ce que les tests attendent
- À vérifier : `backend/src/domain/messages/entities/message.ts` → méthode `sanitize`

### Groupe 2 — `message.test.ts` : toJSON (1 test)
- Test : `should fallback authorId to memberId when author not set`
- Problème : retourne `null` au lieu de `memberId`
- Cause : `toJSON()` retourne `author?.id ?? null` mais le test attend que `memberId` serve de fallback
- Fix : dans `toJSON()`, changer en `authorId: this.author?.id ?? this.memberId ?? null`

### Groupe 3 — `messageUseCases.test.ts` (3 tests)
- Test : `should create a message when user is a member`
- Erreur : `Cannot read properties of undefined (reading 'findActiveByUserAndServer')`
- Cause : le mock du repository de membres est incomplet — la méthode `findActiveByUserAndServer` n'est pas mockée
- À vérifier : `test/application/messages/messageUseCases.test.ts` → setup des mocks

### Groupe 4 — `testRunner.test.ts` (1 test)
- Test : `On peut importer le middleware JWT correctement`
- Erreur : `Variable d'environnement manquante : SUPABASE_URL`
- Cause : le test importe un module qui appelle `getEnvOrThrow('SUPABASE_URL')` au chargement
- Fix : ajouter un `.env.test` avec les variables factices, ou mocker `getEnvOrThrow` dans ce test

---

## ⏳ Reste à faire (Phase 2)

- [ ] GIF API (Tenor ou Giphy) — bouton dans ChatInput, picker, envoi comme message
- [ ] i18n FR/EN — intlayer ou next-intl

## ⏳ GitHub Secrets à configurer

Dans GitHub → Settings → Secrets → Actions :
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`
