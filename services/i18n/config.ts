import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import home from './en/home.json';
import feed from './en/feed.json';
import dateUtils from './en/dateUtils.json';

export const defaultNS = 'home';

// Initialize i18next instance
const i18n = i18next.use(initReactI18next);

// Initialize once
if (!i18n.isInitialized) {
    i18n.init({
        lng: 'en',
        fallbackLng: 'en',
        debug: false,
        resources: {
            en: {
                home,
                feed,
                dateUtils,
            },
        },
        defaultNS,
        interpolation: {
            escapeValue: false, // React already escapes values
        }
    });
}

export default i18n;
