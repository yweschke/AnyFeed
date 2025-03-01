// hooks/useTimeAgo.ts
import { useTranslation } from 'react-i18next';

export const useTimeAgo = () => {
    const { t } = useTranslation('date');

    const getTimeAgo = (date: Date | undefined): string => {
        if (!date) return t('unknown');

        const now = new Date();
        const diffInMilliseconds = now.getTime() - date.getTime();
        const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const diffInWeeks = Math.floor(diffInDays / 7);
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInDays / 365);

        if (diffInSeconds < 60) {
            return t('justNow');
        } else if (diffInMinutes < 60) {
            return diffInMinutes === 1
                ? t('minuteAgo')
                : t('minutesAgo', { count: diffInMinutes });
        } else if (diffInHours < 24) {
            return diffInHours === 1
                ? t('hourAgo')
                : t('hoursAgo', { count: diffInHours });
        } else if (diffInDays < 7) {
            return diffInDays === 1
                ? t('dayAgo')
                : t('daysAgo', { count: diffInDays });
        } else if (diffInWeeks < 4) {
            return diffInWeeks === 1
                ? t('weekAgo')
                : t('weeksAgo', { count: diffInWeeks });
        } else if (diffInMonths < 12) {
            return diffInMonths === 1
                ? t('monthAgo')
                : t('monthsAgo', { count: diffInMonths });
        } else {
            return diffInYears === 1
                ? t('yearAgo')
                : t('yearsAgo', { count: diffInYears });
        }
    };

    return getTimeAgo;
};
