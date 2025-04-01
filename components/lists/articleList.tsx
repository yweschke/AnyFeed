import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, FlatList, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Article } from '@/types/rssFeed/article';
import { Feed } from '@/types/rssFeed/feed';
import { getFeeds } from '@/services/database/rssFeeds';
import { getArticles, getUnreadArticlesNumberFromFeed, setToRead, deleteArticle, setToUnread, setToNotSafedForLater, setToSafedForLater } from '@/services/database/rssArticles';
import ArticleCard from '@/components/cards/articleCard';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import ArticleListHeader from '@/components/headers/articleListHeader';
import Ionicons from '@expo/vector-icons/Ionicons';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

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

    const loadArticles = async (feedId: number, page: number) => {
        try {
            setLoadingMore(true);
            const offset = (page - 1) * ARTICLES_PER_PAGE;

            const feedArticles = await getArticles(feedId, ARTICLES_PER_PAGE, offset);
            console.log(`Loaded ${feedArticles.length} articles for page ${page}`);

            setHasMoreArticles(feedArticles.length === ARTICLES_PER_PAGE);

            const sortedArticles = feedArticles.sort((a, b) =>
                new Date(b.published || 0).getTime() - new Date(a.published || 0).getTime()
            );

            if (page === 1) {
                setArticles(sortedArticles);
            } else {
                setArticles(prevArticles => [...prevArticles, ...sortedArticles]);
            }

            setCurrentPage(page);
        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleLoadMore = async () => {
        if (loadingMore || !hasMoreArticles) return;

        console.log('Loading more articles, page:', currentPage + 1);
        await loadArticles(feedId, currentPage + 1);
    };

    useEffect(() => {
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

    function handleLeftAction(prog: SharedValue<number>, drag: SharedValue<number>, article: Article) {
        const handleMarkAsRead = async () => {
            try {
                if (article.id) {
                    await setToRead(article.id);
                    const numberOfUnreadArticles = await getUnreadArticlesNumberFromFeed(feedId);
                    setUnreadArticlesNumber(numberOfUnreadArticles);
                }
            } catch (error) {
                console.error('Error marking article as read:', error);
            }
        };

        const handleDelete = async () => {
            try {
                await deleteArticle(article.url);
                setArticles(prevArticles => prevArticles.filter(a => a.url !== article.url));
                const numberOfUnreadArticles = await getUnreadArticlesNumberFromFeed(feedId);
                setUnreadArticlesNumber(numberOfUnreadArticles);
            } catch (error) {
                console.error('Error deleting article:', error);
            }
        };

        return (
            <View className="flex-row h-full">
                <TouchableOpacity 
                    className="w-20 bg-blue-500 items-center justify-center"
                    onPress={handleMarkAsRead}
                >
                    <Ionicons name="checkmark-circle-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                    className="w-20 bg-red-500 items-center justify-center"
                    onPress={handleDelete}
                >
                    <Ionicons name="trash-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>
        );
    }


    function handleRightAction(prog: SharedValue<number>, drag: SharedValue<number>, article: Article) {
        const handleMarkReadUnread = async () => {
            try {
                if (article.id) {
                    if (article.unread) {
                        await setToRead(article.id);
                        article.unread = false;
                    } else {
                        await setToUnread(article.id);
                        article.unread = true;
                    }
                    const numberOfUnreadArticles = await getUnreadArticlesNumberFromFeed(feedId);
                    setUnreadArticlesNumber(numberOfUnreadArticles);
                    // Force re-render to update the icon
                    setArticles([...articles]);
                }
            } catch (error) {
                console.error('Error toggling read status:', error);
            }
        };

        const handleSaveForLater = async () => {
            try {
                if (article.id) {
                    if (article.safedForLater) {
                        await setToNotSafedForLater(article.id);
                        article.safedForLater = false;
                    } else {
                        await setToSafedForLater(article.id);
                        article.safedForLater = true;
                    }
                    // Force re-render to update the icon
                    setArticles([...articles]);
                }
            } catch (error) {
                console.error('Error toggling save for later:', error);
            }
        };

        return (
            <View className="bg-primary-light dark:bg-primary-dark m-2 my-1 mx-2 flex-row items-center" key={`${article.id}-${article.unread}-${article.safedForLater}`}>
                <TouchableOpacity 
                    className="w-20 bg-blue-500 h-full items-center justify-center rounded-l-2xl"
                    onPress={handleMarkReadUnread}
                >
                    <Ionicons 
                        name={article.unread ? "checkmark-circle-outline" : "checkmark-circle"} 
                        size={24} 
                        color="white" 
                    />
                </TouchableOpacity>
                <TouchableOpacity 
                    className="w-20 bg-yellow-500 h-full items-center justify-center rounded-r-2xl"
                    onPress={handleSaveForLater}
                >
                    <Ionicons 
                        name={article.safedForLater ? "bookmark" : "bookmark-outline"} 
                        size={24} 
                        color="white" 
                    />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <GestureHandlerRootView className="flex-1">
            <View className="flex-1 bg-primary-light dark:bg-primary-dark">
                <Stack.Screen
                    name="feed"
                    options={{
                        headerShown: false,
                    }}
                />

                {feed && (
                    <ArticleListHeader
                        feed={feed}
                        unreadArticlesCount={unreadArticlesNumber}
                        headerHeight={headerHeight}
                        unreadOpacity={unreadOpacity}
                    />
                )}

                <Animated.FlatList
                    ref={flatListRef}
                    data={articles}
                    keyExtractor={(item) => item.url.toString()}
                    renderItem={({ item }) => (        
                    <ReanimatedSwipeable
                        friction={2}
                        renderRightActions={(progress, drag) => handleRightAction(progress, drag, item)}
                    >
                        <ArticleCard article={item} />
                    </ReanimatedSwipeable>
                    )}
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
        </GestureHandlerRootView>
    );
}
