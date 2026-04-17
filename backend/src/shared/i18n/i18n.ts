import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import * as middleware from 'i18next-http-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    backend: {
      // Chemin vers les fichiers de traduction
      loadPath: path.join(__dirname, '../../locales/{{lng}}/{{ns}}.json'),
    },
    detection: {
      // Lire la langue depuis le header Accept-Language
      order: ['header'],
      lookupHeader: 'accept-language',
      caches: false,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;