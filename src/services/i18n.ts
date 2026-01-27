import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`../../public/locales/${language}/${namespace}.json`);
    })
  )
  .init({
    lng: typeof window !== 'undefined' ? localStorage.getItem('language') || 'vi' : 'vi',
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
