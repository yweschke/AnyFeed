import React from 'react';
import {Animated, Text, View} from 'react-native';
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
        <Animated.View
            className="p-2 border-b border-accent-light dark:border-accent-dark"
            style={{ height: headerHeight, zIndex: 1000, elevation: 4 }}
        >
            <Text type="title" className="text-textPrimary-light dark:text-textPrimary-dark text-3xl font-bold mb-2" numberOfLines={1}>{feed.title}</Text>
            <Animated.Text
                className="text-textSecondary-light dark:text-textSecondary-dark text-2xl"
                style={{ opacity: unreadOpacity }}
            >
                {t('feed.articlesCount', '{{count}} unread articles in this feed!', { count: unreadArticlesCount > 1000 ? "1000+" : unreadArticlesCount })}
            </Animated.Text>
        </Animated.View>
    );
}
