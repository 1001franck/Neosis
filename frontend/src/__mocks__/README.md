# MOCK DATA

Ce dossier contient des données de test pour le développement.

## ⚠️ À SUPPRIMER EN PRODUCTION

Ce dossier est **temporaire** et doit être supprimé lors du passage aux vraies données du backend.

## Structure

```
__mocks__/
├── config.ts      # Configuration des mocks (USE_MOCKS flag)
├── data.ts        # Données de test
└── index.ts       # Point d'entrée unique
```

## Usage

```typescript
import { MOCK_MESSAGES, shouldUseMocks } from '@/__mocks__';

function MyComponent() {
  // Utiliser conditionnellement
  const messages = shouldUseMocks() ? MOCK_MESSAGES : realMessages;
}
```

## Transition vers production

**Étape 1:** Désactiver les mocks
```typescript
// __mocks__/config.ts
export const USE_MOCKS = false;
```

**Étape 2:** Remplacer par vraies données partout

**Étape 3:** Supprimer le dossier
```bash
rm -rf frontend/src/__mocks__
```

## Contenu

- **MOCK_USERS**: Utilisateurs de test
- **MOCK_MESSAGES**: Messages de conversation
- **MOCK_DIRECT_MESSAGES**: Liste des conversations directes
- **MOCK_SERVERS**: Liste des serveurs
- **MOCK_CURRENT_CHAT**: Conversation active avec destinataire
