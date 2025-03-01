// services/i18n/config.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import home from './en/home.json';
import feed from './en/feed.json';
import date from './en/date.json'; // Import as 'date'

export const defaultNS = 'home';

// Initialize i18next instance
const i18n = i18next.use(initReactI18next);

// Initialize once
if (!i18n.isInitialized) {
    i18n.init({
        lng: 'en',
        fallbackLng: 'en',
        debug: true,
        resources: {
            en: {
                home,
                feed,
                date,
            },
        },
        defaultNS,
        interpolation: {
            escapeValue: false, // React already escapes values
        }
    });
}

export default i18n;
