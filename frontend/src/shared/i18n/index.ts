export { fr } from './locales/fr';
export { en } from './locales/en';
export type { Translations } from './locales/fr';

import { fr } from './locales/fr';
import { en } from './locales/en';
import type { Locale } from '@shared/hooks/useLocale';

export const translations: Record<Locale, typeof fr> = { fr, en };