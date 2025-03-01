// utils/dateUtils.ts
import { useTranslation } from 'react-i18next';

export const getTimeAgo = (date: Date | undefined): string => {
    const { t } = useTranslation();

    if (!date) return t('date.unknown');

    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime())/60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 60) {
        return diffInMinutes === 1
            ? t('date.minuteAgo')
            : t('date.minutesAgo', { count: diffInMinutes });
    } else if (diffInHours < 24) {
        return diffInHours === 1
            ? t('date.hourAgo')
            : t('date.hoursAgo', { count: diffInHours });
    } else if (diffInDays < 7) {
        return diffInDays === 1
            ? t('date.dayAgo')
            : t('date.daysAgo', { count: diffInDays });
    } else if (diffInWeeks < 4) {
        return diffInWeeks === 1
            ? t('date.weekAgo')
            : t('date.weeksAgo', { count: diffInWeeks });
    } else if (diffInMonths < 12) {
        return diffInMonths === 1
            ? t('date.monthAgo')
            : t('date.monthsAgo', { count: diffInMonths });
    } else {
        return diffInYears === 1
            ? t('date.yearAgo')
            : t('date.yearsAgo', { count: diffInYears });
    }
};
