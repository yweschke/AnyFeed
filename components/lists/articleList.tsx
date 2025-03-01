import React, {useEffect, useRef, useState} from 'react';
import { Animated, View, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Article } from '@/types/rssFeed/article';
import { Feed } from '@/types/rssFeed/feed';
import { getFeeds } from '@/services/database/rssFeeds';
import { getArticles } from '@/services/database/rssArticles';
import ArticleCard from '@/components/cards/articleCard';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import ArticleListHeader from '@/components/headers/articleListHeader';

export default function FeedDetailScreen() {
    const { id } = useLocalSearchParams();
    const feedId = typeof id === 'string' ? parseInt(id, 10) : 0;
    const [feed, setFeed] = useState<Feed | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation('feed');

    useEffect(() => {
        const loadFeedData = async () => {
            try {
                // Load feed information
                const feeds = await getFeeds();
                const currentFeed = feeds.find(f => f.id === feedId);

                if (currentFeed) {
                    setFeed(currentFeed);

                    // Load articles for this feed
                    const feedArticles = await getArticles(feedId);
                    setArticles(feedArticles);
                }
            } catch (error) {
                console.error('Error loading feed details:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFeedData();
    }, [feedId]);

    const handleArticlePress = (article: Article) => {
        // Navigate to article detail screen (we'll create this later)
        // router.push(`/article/${articleId}`);
        console.log('Article pressed:', article.title);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-primary-light dark:bg-primary-dark">
                <ActivityIndicator size="large" color="#60a5fa" />
            </View>
        );
    }

    if (!feed) {
        return (
            <View className="flex-1 justify-center items-center bg-primary-light dark:bg-primary-dark">
                <ThemedText>{t('error.feedNotFound', 'Feed not found')}</ThemedText>
            </View>
        );
    }

    // Animation for article list header
    const scrollY = useRef(new Animated.Value(0)).current;

    const HEADER_MAX_HEIGHT = 120;
    const HEADER_MIN_HEIGHT = 60;
    const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: "clamp",
    });

    const unreadOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
        outputRange: [1, 0.5, 0],
        extrapolate: "clamp",
    });

    return (
        <View className="flex-1 bg-primary-light dark:bg-primary-dark">
            <Stack.Screen
                name="feed"
                options={{
                    headerShown: false,
                }}
            />

            <ArticleListHeader
            feed={feed}
            unreadArticlesCount={1}
            headerHeight={headerHeight}
            unreadOpacity={unreadOpacity}
            />

            <Animated.FlatList
                data={articles}
                keyExtractor={(item) => item.url}
                renderItem={({ item }) => (
                    <ArticleCard
                        article={item}
                        onPress={() => handleArticlePress(item)}
                    />
                )}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center p-8">
                        <ThemedText>{t('feed.noArticles', 'No articles found for this feed')}</ThemedText>
                    </View>
                }
            />
        </View>
    );
}
