# 🏗️ Shared

Dossier pour les ressources partagées entre tous les modules.

## Sous-dossiers

- `config/` - Configuration d'application et variables d'environnement
- `constants/` - Constantes applicatives (rôles, permissions, statuts)
- `decorators/` - Décorateurs TypeScript réutilisables
- `errors/` - Classes d'erreur personnalisées
- `types/` - Types TypeScript globaux
- `utils/` - Fonctions utilitaires

## Convention d'import
```typescript
//  CORRECT
import { AppError } from '@shared/errors';
import { Roles } from '@shared/constants';
import { validateEmail } from '@shared/utils';

// ❌ ÉVITER
import { AppError } from '../../../../shared/errors';
```
