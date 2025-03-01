import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Feed } from '@/types/rssFeed/feed';
import { useTranslation } from 'react-i18next';

interface ArticleListHeaderProps {
    feed: Feed;
    articlesCount: number;
}

export default function ArticleListHeader({ feed, articlesCount }: ArticleListHeaderProps) {
    const { t } = useTranslation('feed');

    return (
        <View className="p-4 border-b border-accent-light dark:border-accent-dark">
            <ThemedText type="title" className="text-2xl mb-2">{feed.title}</ThemedText>
            <ThemedText className="text-textSecondary-light dark:text-textSecondary-dark">
                {t('feed.articlesCount', { count: articlesCount }, 'Articles: {{count}}')}
            </ThemedText>
            <ThemedText className="text-sm text-textSecondary-light dark:text-textSecondary-dark mt-1">
                {t('feed.source', 'Source')}: {feed.url}
            </ThemedText>
        </View>
    );
}
