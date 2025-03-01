import React from 'react';
import {Animated, Text, View} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Feed } from '@/types/rssFeed/feed';
import { useTranslation } from 'react-i18next';

interface ArticleListHeaderProps {
    feed: Feed;
    unreadArticlesCount: number;
    headerHeight: Animated.AnimatedInterpolation<number>;
    unreadOpacity: Animated.AnimatedInterpolation<number>;
}

export default function ArticleListHeader({ feed, unreadArticlesCount, headerHeight, unreadOpacity}: ArticleListHeaderProps) {
    const { t } = useTranslation('feed');

    return (
        <Animated.Text
            className="p-4 border-b border-accent-light dark:border-accent-dark"
            style={{ height: headerHeight, zIndex: 1000, elevation: 4 }}
        >
            <Text type="title" className="text-2xl mb-2">{feed.title}</Text>
            <Animated.Text
                className="text-textSecondary-light dark:text-textSecondary-dark"
                style={{ opacity: unreadOpacity }}
            >
                {t('feed.articlesCount', { count: unreadArticlesCount }, 'Articles: {{count}}')}
            </Animated.Text>
        </Animated.Text>
    );
}
