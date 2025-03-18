// app/article/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Share, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText.tsx';
import { getArticle, setToRead, setToNotSafedForLater, setToSafedForLater } from '@/services/database/rssArticles.ts';
import { Article } from '@/types/rssFeed/article.ts';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/IconSymbol.tsx';
import { useColorScheme } from '@/hooks/useColorScheme.ts';
import TextSettingsModal, { TextSettings } from '@/components/modals/TextSettingsModal';

// Default text settings
const DEFAULT_TEXT_SETTINGS: TextSettings = {
    fontSize: 18,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
};

// Storage key for saved text settings
const TEXT_SETTINGS_STORAGE_KEY = 'article_text_settings';

export default function ArticleScreen() {
    const { id } = useLocalSearchParams();
    const articleId = typeof id === 'string' ? parseInt(id, 10) : 0;
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { t } = useTranslation('article');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Text settings state
    const [textSettings, setTextSettings] = useState<TextSettings>(DEFAULT_TEXT_SETTINGS);
    const [textSettingsModalVisible, setTextSettingsModalVisible] = useState(false);

    // Colors
    const iconColor = isDark ? "#8ca0b4" : "#50647f";
    const activeColor = isDark ? '#60a5fa' : '#0284c7';
    const backgroundColor = isDark ? 'rgba(13, 27, 42, 1)' : 'rgba(255, 255, 255, 1)';

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
        const loadArticle = async () => {
            try {
                if (articleId <= 0) {
                    setLoading(false);
                    return;
                }

                const fetchedArticle = await getArticle(articleId);

                if (fetchedArticle) {
                    setArticle(fetchedArticle);

                    // Mark article as read
                    if (fetchedArticle.unread && fetchedArticle.id) {
                        await setToRead(fetchedArticle.id);
                    }
                }
            } catch (error) {
                console.error('Error loading article:', error);
            } finally {
                setLoading(false);
            }
        };

        loadArticle();
    }, [articleId]);

    const handleBackPress = () => {
        router.back();
    };

    const handleSharePress = async () => {
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
        setTextSettingsModalVisible(true);
    };

    const handleUnreadPress = async () => {
        try {
            if(article?.unread) {
                await setToRead(article.id);
                article.unread = false;
            } else {
                await setToNotRead(article.id);
                article.unread = true;
            }
        } catch (error) {
            console.error('Error updating unread status:', error);
        }

    }

    const handleOpenInBrowser = () => {
        if (article?.url) {
            router.push(article.url);
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
        try {
            if (article) {
                if (!article.safedForLater) {
                    await setToSafedForLater(article.id);
                    article.safedForLater = true;
                } else {
                    await setToNotSafedForLater(article.id);
                    article.safedForLater = false;
                }
            }
        } catch (error) {
            console.error('Error saving text settings:', error);
        }
    }

    // Create HTML content with appropriate styling based on theme and text settings
    const createHTMLContent = () => {
        if (!article) return '';

        let content;
        if(article.content === "No content available") {
            if(article.description === "No description available") {
                content = 'No content available';
            } else {
                // Fixed image element to properly use the URL with a fallback if image doesn't exist
                content = article.image?.url
                    ? `<div style="text-align: center; margin-bottom: 20px;"> <img src="${article.image.url}" alt="${article.image?.title || 'Article image'}" style="width:100%; height:auto; float:left; margin-right:15px; margin-bottom:10px;"/> </div> <div>${article.description}</div>`
                    : article.description;
            }
        } else {
            content = article.content;
        }

        const htmlContent = content || '';
        const textColor = isDark ? '#ffffff' : '#000000';
        const linkColor = isDark ? '#60a5fa' : '#0284c7';

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
                    margin-top: 24px;
                    margin-bottom: 16px;
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
                </style>
            </head>
            <body>
                <h1>${article.title || ''}</h1>
                ${htmlContent}
            </body>
            </html>
        `;
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-primary-light dark:bg-primary-dark">
                <ActivityIndicator size="large" color={activeColor} />
            </View>
        );
    }

    if (!article) {
        return (
            <View className="flex-1 justify-center items-center bg-primary-light dark:bg-primary-dark">
                <ThemedText>{t('error.articleNotFound', 'Article not found')}</ThemedText>
                <TouchableOpacity onPress={handleBackPress} className="mt-4 p-3 bg-secondary-light dark:bg-secondary-dark rounded-lg">
                    <ThemedText>{t('actions.goBack', 'Go Back')}</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
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
                <View className="flex-row justify-between items-center px-4 py-3 bg-secondary-light dark:bg-secondary-dark border-b border-accent-light dark:border-accent-dark">
                    <TouchableOpacity onPress={handleBackPress} className="p-2">
                        <IconSymbol name="chevron.backward" size={24} color={iconColor} />
                    </TouchableOpacity>

                    <View className="flex-1 px-4">
                        <ThemedText numberOfLines={1} className="text-center font-semibold">
                            {article.title}
                        </ThemedText>
                    </View>

                    <TouchableOpacity onPress={handleTextPress} className="p-2">
                        <IconSymbol name="paperplane.fill" size={24} color={iconColor} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View className="flex-1">
                    <WebView
                        source={{ html: createHTMLContent() }}
                        style={{ backgroundColor: 'transparent' }}
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
                </View>

                {/* Bottom Navigation Bar */}
                <View className="flex-row p-10 pb-safe justify-around items-center py-3 bg-secondary-light dark:bg-secondary-dark border-t border-accent-light dark:border-accent-dark">
                    <TouchableOpacity onPress={handleSafeForLaterPress} className="items-center">
                        <IconSymbol name="bookmark" size={40} color={iconColor} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleUnreadPress} className="items-center">
                        <IconSymbol name="paperplane.fill" size={40} color={iconColor} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleOpenInBrowser} className="items-center">
                        <IconSymbol name="globe.americas.fill" size={40} color={iconColor} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSharePress} className="items-center">
                        <IconSymbol name="paperplane.fill" size={40} color={iconColor} />
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
        </>
    );
}
