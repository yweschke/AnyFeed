// Enhanced ArticleList component with pagination
// For components/lists/articleList.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, FlatList, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Article } from '@/types/rssFeed/article';
import { Feed } from '@/types/rssFeed/feed';
import { getFeeds } from '@/services/database/rssFeeds';
import { getArticles, getUnreadArticlesNumberFromFeed } from '@/services/database/rssArticles';
import ArticleCard from '@/components/cards/articleCard';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import ArticleListHeader from '@/components/headers/articleListHeader';
import Ionicons from '@expo/vector-icons/Ionicons';

// Constants for pagination
const ARTICLES_PER_PAGE = 10;

export default function ArticleList() {
    const { id } = useLocalSearchParams();
    const feedId = typeof id === 'string' ? parseInt(id, 10) : 0;
    const [feed, setFeed] = useState<Feed | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreArticles, setHasMoreArticles] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [unreadArticlesNumber, setUnreadArticlesNumber] = useState<number>(0);
    const { t } = useTranslation('feed');
    const flatListRef = useRef(null);

    // Animation for article list header
    const scrollY = useRef(new Animated.Value(0)).current;

    const HEADER_MAX_HEIGHT = 100;
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

    useEffect(() => {
        const loadFeedData = async () => {
            try {
                // Load feed information
                const feeds = await getFeeds();
                const currentFeed = feeds.find(f => f.id === feedId);

                if (currentFeed) {
                    setFeed(currentFeed);
                    // Load first batch of articles
                    await loadArticles(feedId, 1);
                }
            } catch (error) {
                console.error('Error loading feed details:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFeedData();
    }, [feedId]);

    // Function to load articles with pagination
    const loadArticles = async (feedId: number, page: number) => {
        try {
            setLoadingMore(true);

            // Calculate offset based on page number
            const offset = (page - 1) * ARTICLES_PER_PAGE;

            // Get articles for this page
            const feedArticles = await getArticles(feedId, ARTICLES_PER_PAGE, offset);
            console.log(`Loaded ${feedArticles.length} articles for page ${page}`);

            // Check if we have more articles to load
            setHasMoreArticles(feedArticles.length === ARTICLES_PER_PAGE);

            // Sort articles by date (newest first)
            const sortedArticles = feedArticles.sort((a, b) =>
                new Date(b.published || 0).getTime() - new Date(a.published || 0).getTime()
            );

            if (page === 1) {
                // First page - replace existing articles
                setArticles(sortedArticles);
            } else {
                // Subsequent pages - append to existing articles
                setArticles(prevArticles => [...prevArticles, ...sortedArticles]);
            }

            setCurrentPage(page);
        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Load more articles when reaching the end of the list
    const handleLoadMore = async () => {
        if (loadingMore || !hasMoreArticles) return;

        console.log('Loading more articles, page:', currentPage + 1);
        await loadArticles(feedId, currentPage + 1);
    };

    useEffect(() => {
        // Only run this effect if feed exists, is not null, and articles are loaded
        if (feed?.id) {
            const fetchUnreadArticles = async () => {
                try {
                    const numberOfUnreadArticles = await getUnreadArticlesNumberFromFeed(feed?.id);
                    setUnreadArticlesNumber(numberOfUnreadArticles);
                } catch (error) {
                    console.error("❌ Error fetching unread articles:", error);
                }
            };

            fetchUnreadArticles();
        }
    }, [articles]);

    // Render footer with loading indicator or "load more" button
    const renderFooter = () => {
        if (!hasMoreArticles) {
            return (
                <View className="py-4 items-center">
                    <ThemedText>{t('feed.noMoreArticles', 'No more articles')}</ThemedText>
                </View>
            );
        }

        if (loadingMore) {
            return (
                <View className="py-4">
                    <ActivityIndicator size="small" color="#60a5fa" />
                </View>
            );
        }

        return (
            <TouchableOpacity
                onPress={handleLoadMore}
                className="flex-row items-center justify-center py-4 bg-secondary-light dark:bg-secondary-dark mx-4 my-2 rounded-lg"
            >
                <ThemedText className="mr-2">{t('feed.loadMore', 'Load more articles')}</ThemedText>
                <Ionicons name="arrow-down" size={16} color="#60a5fa" />
            </TouchableOpacity>
        );
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
                unreadArticlesCount={unreadArticlesNumber}
                headerHeight={headerHeight}
                unreadOpacity={unreadOpacity}
            />

            <Animated.FlatList
                ref={flatListRef}
                data={articles}
                keyExtractor={(item) => item.url.toString()}
                renderItem={({ item }) => <ArticleCard article={item} />}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center p-8">
                        <ThemedText>{t('feed.noArticles', 'No articles found for this feed')}</ThemedText>
                    </View>
                }
            />
        </View>
    );
}
