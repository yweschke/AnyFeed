// app/article/[id].tsx
import React, { useEffect, useState, useRef } from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity, Share, StatusBar, FlatList, Dimensions, Animated } from 'react-native';
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { getArticle, setToRead, setToNotSafedForLater, setToSafedForLater, setToUnread, getArticles } from '@/services/database/rssArticles';
import { getFeed } from '@/services/database/rssFeeds';
import { Article } from '@/types/rssFeed/article';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/useColorScheme';
import TextSettingsModal, { TextSettings } from '@/components/modals/TextSettingsModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';

// Default text settings
const DEFAULT_TEXT_SETTINGS: TextSettings = {
    fontSize: 18,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
};

const ARTICLES_PER_PAGE = 10;

// Storage key for saved text settings
const TEXT_SETTINGS_STORAGE_KEY = 'article_text_settings';

// Get screen width for FlatList
const { width } = Dimensions.get('window');

export default function ArticleScreen() {
    const { id } = useLocalSearchParams();
    const initialArticleId = typeof id === 'string' ? parseInt(id, 10) : 0;
    const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
    const [articles, setArticles] = useState<Article[]>([]);
    const [feed, setFeed] = useState<String | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [viewOriginalWebsite, setViewOriginalWebsite] = useState(false);
    const [hasMoreArticles, setHasMoreArticles] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [feedId, setFeedId] = useState<number | null>(null);
    const router = useRouter();
    const { t } = useTranslation('article');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const flatListRef = useRef(null);
    // Text settings state for modal
    const [textSettings, setTextSettings] = useState<TextSettings>(DEFAULT_TEXT_SETTINGS);
    const [textSettingsModalVisible, setTextSettingsModalVisible] = useState(false);

    // Colors
    const iconColor = isDark ? "#8ca0b4" : "#50647f";
    const activeColor = isDark ? '#60a5fa' : '#0284c7';
    const backgroundColor = isDark ? 'rgba(13, 27, 42, 1)' : 'rgba(255, 255, 255, 1)';
    const inactiveColor = isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(156, 163, 175, 0.5)';

    // Animation for pagination dots
    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Load saved text settings
        const loadTextSettings = async () => {
            try {
                const savedSettings = await AsyncStorage.getItem(TEXT_SETTINGS_STORAGE_KEY);
                if (savedSettings) {
                    setTextSettings(JSON.parse(savedSettings));
                }
            } catch (error) {
                console.error('Error loading text settings:', error);
            }
        };

        loadTextSettings();
    }, []);

    useEffect(() => {
        const loadInitialArticle = async () => {
            try {
                if (initialArticleId <= 0) {
                    setLoading(false);
                    return;
                }

                // First, get the current article to determine its feed
                const currentArticle = await getArticle(initialArticleId);

                if (!currentArticle || !currentArticle.id) {
                    setLoading(false);
                    return;
                }

                const articleFeedId = currentArticle.feedId;
                setFeedId(articleFeedId);
                console.log('Loading articles from feed ID:', articleFeedId);

                // Load the feed information
                const feedInfo = await getFeed(articleFeedId);
                setFeed(feedInfo);

                // Load the first batch of articles
                await loadArticles(articleFeedId, 1, initialArticleId);
            } catch (error) {
                console.error('Error loading initial article:', error);
                setLoading(false);
            }
        };

        loadInitialArticle();
    }, [initialArticleId]);

    // Function to load articles with pagination
    const loadArticles = async (feedId: number, page: number, focusArticleId?: number) => {
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

                if (focusArticleId) {
                    const index = sortedArticles.findIndex(article => article.id === focusArticleId);
                    if (index !== -1) {
                        setCurrentArticleIndex(index);

                        if (sortedArticles[index].unread && sortedArticles[index].id) {
                            await setToRead(sortedArticles[index].id);

                            const updatedArticles = [...sortedArticles];
                            updatedArticles[index] = { ...updatedArticles[index], unread: false };
                            setArticles(updatedArticles);
                        }
                    }
                }
            } else {
                // Subsequent pages - append to existing articles
                setArticles(prevArticles => [...prevArticles, ...sortedArticles]);
            }

            setCurrentPage(page);
        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Load more articles when needed
    const loadMoreArticles = async () => {
        if (loadingMore || !hasMoreArticles || !feedId) return;

        console.log('Loading more articles, page:', currentPage + 1);
        await loadArticles(feedId, currentPage + 1);
    };

    // This will be called when the user scrolls close to the end
    const checkForMoreArticles = (index: number) => {
        // If we're within 3 articles of the end, and we have more to load
        if (hasMoreArticles && index >= articles.length - 3 && !loadingMore) {
            loadMoreArticles();
        }
    };

    // Scroll to the current article when the index changes
    useEffect(() => {
        try {
            if (flatListRef.current && articles.length > 0) {
                flatListRef.current.scrollToIndex({
                    index: currentArticleIndex,
                    animated: false,
                    viewPosition: 0
                });
            }
        } catch  (error) {
            console.error('Error scrolling to index:', error);
        }
    }, [currentArticleIndex, articles.length]);

    const handleBackPress = () => {
        try {
            router.back();
        } catch (error) {
            console.error('Error going back:', error);
        }
    };

    const handleSharePress = async () => {
        const article = articles[currentArticleIndex];
        if (article) {
            try {
                await Share.share({
                    message: `${article.title}\n${article.url}`,
                    url: article.url,
                });
            } catch (error) {
                console.error('Error sharing article:', error);
            }
        }
    };

    const handleTextPress = () => {
        try {
            setTextSettingsModalVisible(true);
        } catch (error) {
            console.error('Error opening text settings:', error);
        }
    };

    const handleUnreadPress = async () => {
        if (articles.length === 0 || currentArticleIndex >= articles.length) return;

        const article = articles[currentArticleIndex];

        try {
            if (article?.id) {
                const updatedArticles = [...articles];

                if (article.unread) {
                    await setToRead(article.id);
                    updatedArticles[currentArticleIndex].unread = false;
                } else {
                    await setToUnread(article.id);
                    updatedArticles[currentArticleIndex].unread = true;
                }

                setArticles(updatedArticles);
            }
        } catch (error) {
            console.error('Error updating unread status:', error);
        }
    };

    const handleToggleWebView = () => {
        try {
            setViewOriginalWebsite(!viewOriginalWebsite);
        } catch (error) {
            console.error('Error toggleWebView:', error);
        }
    };

    const handleSaveTextSettings = async (newSettings: TextSettings) => {
        setTextSettings(newSettings);
        try {
            await AsyncStorage.setItem(TEXT_SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error('Error saving text settings:', error);
        }
    };

    const handleSafeForLaterPress = async () => {
        if (articles.length === 0 || currentArticleIndex >= articles.length) return;

        const article = articles[currentArticleIndex];

        try {
            if (article?.id) {
                const updatedArticles = [...articles];

                if (!article.safedForLater) {
                    await setToSafedForLater(article.id);
                    updatedArticles[currentArticleIndex].safedForLater = true;
                } else {
                    await setToNotSafedForLater(article.id);
                    updatedArticles[currentArticleIndex].safedForLater = false;
                }

                setArticles(updatedArticles);
            }
        } catch (error) {
            console.error('Error updating saved for later status:', error);
        }
    };

    const handleViewableItemsChanged = async ({ viewableItems}) => {
        try {
            if (viewableItems.length > 0) {
                const viewedArticleIndex = viewableItems[0].index;
                setCurrentArticleIndex(viewedArticleIndex);

                // Check if we need to load more articles when approaching the end
                checkForMoreArticles(viewedArticleIndex);

                // Mark article as read when it comes into view
                const article = articles[viewedArticleIndex];
                if (article && article.id && article.unread) {
                    await setToRead(article.id);

                    // Update the articles array with the read status
                    const updatedArticles = [...articles];
                    updatedArticles[viewedArticleIndex] = { ...updatedArticles[viewedArticleIndex], unread: false };
                    setArticles(updatedArticles);
                }
            }
        } catch (error) {
            console.error('Error setting article to read:', error);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Create HTML content with appropriate styling based on theme and text settings
    const createHTMLContent = (article: Article) => {
        try {
            if (!article) return '';

            let content;
            if (article.content === "No content available") {
                if (article.description === "No description available") {
                    content = 'No content available';
                } else {
                    // Fixed image element to properly use the URL with a fallback if image doesn't exist
                    content = article.image?.url
                        ? `<div style="text-align: center; margin-bottom: 10px;"> <img src="${article.image.url}" alt="${article.image?.title || 'Article image'}" style="width:100%; height:auto; float:left; margin-right:15px; margin-bottom:10px;"/> </div> <div>${article.description}</div>`
                        : article.description;
                }
            } else {
                content = article.content;
            }

            const htmlContent = content || '';
            const textColor = isDark ? '#ffffff' : '#000000';
            const secondaryTextColor = isDark ? '#8ca0b4' : '#50647f'; // Secondary text color from theme
            const linkColor = isDark ? '#60a5fa' : '#0284c7';

            const authorName = article.authors && article.authors.length > 0 ? article.authors[0]?.name : '';
            const publishedDate = formatDate(article.published);

            // Create info line with author and date
            const infoLine = (authorName || publishedDate) ?
                `<div style="font-size: ${textSettings.fontSize - 2}px; color: ${secondaryTextColor}; margin-bottom: 10px; display: flex;">${authorName}${authorName && publishedDate ? ' • ' : ''}${publishedDate}</div>` : '';

            return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                body {
                    font-family: ${textSettings.fontFamily};
                    padding: 16px;
                    color: ${textColor};
                    background-color: transparent;
                    line-height: 1.6;
                    font-size: ${textSettings.fontSize}px;
                }
                img {
                    width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 8px auto;
                    display: block;
                }
                a {
                    color: ${linkColor};
                    text-decoration: none;
                }
                h1, h2, h3, h4, h5, h6 {
                    margin-top: 10px;
                    margin-bottom: 10px;
                    line-height: 1.2; /* Added to fix multi-line heading spacing */
                    font-family: ${textSettings.fontFamily};
                }
                h1 {
                    font-size: ${textSettings.fontSize + 6}px;
                    line-height: 1.2;
                }
                h2 {
                    font-size: ${textSettings.fontSize + 4}px;
                    line-height: 1.2;
                }
                h3 {
                    font-size: ${textSettings.fontSize + 2}px;
                    line-height: 1.2;
                }
                blockquote {
                    border-left: 4px solid ${linkColor};
                    padding-left: 16px;
                    margin-left: 0;
                    opacity: 0.8;
                }
                pre {
                    background-color: ${isDark ? '#1e293b' : '#f1f5f9'};
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                }
                code {
                    font-family: monospace;
                    background-color: ${isDark ? '#1e293b' : '#f1f5f9'};
                    padding: 2px 4px;
                    border-radius: 4px;
                }
                .image-container {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .info-container {
                        display: inline;
                        color: ${secondaryTextColor};
                        font-size: ${textSettings.fontSize - 2}px;
                    }
                    </style>
                </head>
                <body>
                    <h1>${article.title || ''}</h1>
                    ${infoLine}
                    ${htmlContent}
                </body>
                </html>
        `;
        } catch (error) {
            console.error('Error creating HTML content:', error);
            return 'An error occurred while loading the article.';
        }
    };

    // Render individual article item
    const renderArticleItem = ({ item }) => {
        return (
            <View style={{ width }}>
                {viewOriginalWebsite && item.url ? (
                    <WebView
                        source={{ uri: item.url }}
                        style={{ flex: 1, backgroundColor: 'transparent' }}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View className="absolute inset-0 justify-center items-center bg-primary-light dark:bg-primary-dark">
                                <ActivityIndicator size="large" color={activeColor} />
                            </View>
                        )}
                    />
                ) : (
                    <WebView
                        source={{ html: createHTMLContent(item) }}
                        style={{ flex: 1, backgroundColor: 'transparent' }}
                        originWhitelist={['*']}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        scalesPageToFit={false}
                        renderLoading={() => (
                            <View className="absolute inset-0 justify-center items-center bg-primary-light dark:bg-primary-dark">
                                <ActivityIndicator size="large" color={activeColor} />
                            </View>
                        )}
                    />
                )}
            </View>
        );
    };

    // Create pagination dots
    const renderPaginationDots = () => {
        if (articles.length <= 1) return null;

        const maxDots = 5; // Maximum number of dots to show
        let startDot = 0;
        let endDot = articles.length;

        // If we have more than maxDots articles, adjust which range to show
        if (articles.length > maxDots) {
            // Calculate the range to show around the current article
            const visibleRadius = Math.floor(maxDots / 2);
            startDot = Math.max(0, currentArticleIndex - visibleRadius);
            endDot = Math.min(articles.length, startDot + maxDots);

            // Adjust if we're close to the end
            if (endDot === articles.length) {
                startDot = Math.max(0, endDot - maxDots);
            }
        }

        return (
            <View className="flex-row justify-center items-center mx-4">
                {currentArticleIndex > 0 && currentArticleIndex < 3 ? (
                    <TouchableOpacity
                        onPress={() => setCurrentArticleIndex(Math.max(0, currentArticleIndex - 1))}
                        className="px-1"
                    >
                        <Ionicons
                            name="chevron-back-outline"
                            size={16}
                            color={iconColor}
                        />
                    </TouchableOpacity>
                ): currentArticleIndex > 0 &&
                    (
                        <TouchableOpacity
                            onPress={() => setCurrentArticleIndex(0)}
                            className="px-1 flex flex-row items-center"
                        >
                            <Ionicons
                                name="chevron-back-outline"
                                size={16}
                                color={iconColor}
                            />
                            <Ionicons
                                name="chevron-back-outline"
                                size={16}
                                color={iconColor}
                            />
                        </TouchableOpacity>
                    )
                }

                {Array.from({ length: endDot - startDot }, (_, i) => i + startDot).map((index) => (
                    <TouchableOpacity
                        key={`dot-${index}`}
                        onPress={() => setCurrentArticleIndex(index)}
                        className="px-1"
                    >
                        <View
                            className="h-2 w-2 rounded-full mx-1"
                            style={{
                                backgroundColor: index === currentArticleIndex
                                    ? activeColor
                                    : inactiveColor
                            }}
                        />
                    </TouchableOpacity>
                ))}

                {currentArticleIndex < articles.length - 1 && currentArticleIndex >= articles.length - 3 ? (
                    <TouchableOpacity
                        onPress={() => setCurrentArticleIndex(Math.min(articles.length - 1, currentArticleIndex + 1))}
                        className="px-1"
                    >
                        <Ionicons
                            name="chevron-forward-outline"
                            size={16}
                            color={iconColor}
                        />
                    </TouchableOpacity>
                ): currentArticleIndex < articles.length - 1 &&
                (
                    <TouchableOpacity
                        onPress={() => setCurrentArticleIndex(articles.length - 1)}
                        className="px-1 flex flex-row items-center"
                    >
                        <Ionicons
                            name="chevron-forward-outline"
                            size={16}
                            color={iconColor}
                        />
                        <Ionicons
                            name="chevron-forward-outline"
                            size={16}
                            color={iconColor}
                        />
                    </TouchableOpacity>
                )
                }
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-primary-light dark:bg-primary-dark">
                <ActivityIndicator size="large" color={activeColor} />
            </View>
        );
    }

    if (articles.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-primary-light dark:bg-primary-dark">
                <ThemedText>{t('error.articleNotFound', 'Article not found')}</ThemedText>
                <TouchableOpacity onPress={handleBackPress} className="mt-4 p-3 bg-secondary-light dark:bg-secondary-dark rounded-lg">
                    <ThemedText>{t('actions.goBack', 'Go Back')}</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    const currentArticle = articles[currentArticleIndex];

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    animation: 'slide_from_right'
                }}
            />

            <SafeAreaView className="flex-1 bg-primary-light dark:bg-primary-dark" edges={['top', 'right', 'left']}>
                <StatusBar
                    backgroundColor={backgroundColor}
                    barStyle={isDark ? 'light-content' : 'dark-content'}
                />

                {/* Custom Top Navigation Bar */}
                <View className="bg-secondary-light dark:bg-secondary-dark border-b border-accent-light dark:border-accent-dark">
                    <View className="flex-row justify-between items-center px-4 pt-3">
                        <TouchableOpacity onPress={handleBackPress} className="p-2">
                            <Ionicons
                                name="arrow-back"
                                size={28}
                                color={iconColor}
                            />
                        </TouchableOpacity>

                        <View className="flex-1 px-4">
                            <ThemedText numberOfLines={1} className="text-center font-semibold">
                                {currentArticle.title}
                            </ThemedText>
                        </View>

                        <TouchableOpacity onPress={handleTextPress} className="p-2">
                            <Ionicons
                                name="text"
                                size={28}
                                color={iconColor}
                            />
                        </TouchableOpacity>
                    </View>
                    <View className="items-center">
                        <Text className="text-textPrimary-light dark:text-textPrimary-dark text-base">{feed[0]?.title}</Text>
                    </View>
                    {/* Pagination Dots */}
                    <View className="py-2">
                        {renderPaginationDots()}
                    </View>
                </View>

                {/* Content */}
                <View className="flex-1">
                    <AnimatedFlatList
                        ref={flatListRef}
                        data={articles}
                        renderItem={renderArticleItem}
                        keyExtractor={(item) => item.id?.toString()}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={currentArticleIndex}
                        getItemLayout={(data, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                        onViewableItemsChanged={handleViewableItemsChanged}
                        viewabilityConfig={{
                            itemVisiblePercentThreshold: 50
                        }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true }
                        )}
                        ListFooterComponent={loadingMore ? (
                            <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={activeColor} />
                            </View>
                        ) : null}
                    />
                </View>

                {/* Bottom Navigation Bar */}
                <View className="flex-row p-10 pb-safe justify-around items-center py-3 bg-secondary-light dark:bg-secondary-dark border-t border-accent-light dark:border-accent-dark">
                    <TouchableOpacity onPress={handleSafeForLaterPress} className="items-center">
                        <Ionicons
                            name={currentArticle.safedForLater ? "bookmark" : "bookmark-outline"}
                            size={28}
                            color={currentArticle.safedForLater ? activeColor : iconColor}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleUnreadPress} className="items-center">
                        <Ionicons
                            name={!currentArticle.unread ? "checkbox-sharp" : "checkbox-outline"}
                            size={28}
                            color={!currentArticle.unread ? activeColor : iconColor}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleToggleWebView} className="items-center">
                        <Ionicons
                            name={viewOriginalWebsite ? "globe" : "globe-outline"}
                            size={28}
                            color={viewOriginalWebsite ? activeColor : iconColor}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSharePress} className="items-center">
                        <Ionicons
                            name="share-outline"
                            size={28}
                            color={iconColor}
                        />
                    </TouchableOpacity>
                </View>

                {/* Text Settings Modal */}
                <TextSettingsModal
                    visible={textSettingsModalVisible}
                    onClose={() => setTextSettingsModalVisible(false)}
                    initialSettings={textSettings}
                    onSave={handleSaveTextSettings}
                />
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}
