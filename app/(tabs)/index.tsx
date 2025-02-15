import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Image } from 'react-native';
import { insertFeed, getFeeds, deleteFeed } from '@/services/database/rssFeeds';
import { fetchRSSFeed } from '@/services/rss-parser/fetchRSSFeed.ts';
import { Feed } from '@/types/rssFeed/feed.ts';
import { Article } from '@/types/rssFeed/article.ts';

export default function HomeScreen() {
    const [url, setUrl] = useState('');
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [articles, setArticles] = useState<{ [key: string]: Article[] }>({});

    useEffect(() => {
        const fetchData = async () => {
            await fetchFeeds();
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (feeds.length === 0) return;

        const loadArticles = async () => {
            for (const feed of feeds) {
                await fetchArticles(feed.url);
            }
        };

        loadArticles();
    }, [feeds]);

    const fetchFeeds = async () => {
        try {
            const data = await getFeeds();
            setFeeds(data);
        } catch (error) {
            console.error("❌ Error fetching feeds:", error);
        }
    };

    const fetchArticles = async (feedUrl: string) => {
        try {
            const fetchedArticles = await fetchRSSFeed(feedUrl);
            setArticles(prev => ({ ...prev, [feedUrl]: fetchedArticles }));
        } catch (error) {
            console.error(`❌ Error fetching articles for ${feedUrl}:`, error);
        }
    };

    const handleAddFeed = async () => {
        if (!url.trim()) return;
        try {
            await insertFeed(url, url);
            console.log('✅ Feed added');
            setUrl('');
            await fetchFeeds();
        } catch (error) {
            console.error("❌ Error adding feed:", error);
        }
    };

    const handleDeleteFeed = async (id: number) => {
        try {
            await deleteFeed(id);
            await fetchFeeds();
        } catch (error) {
            console.error("❌ Error deleting feed:", error);
        }
    };

    return (
        <View className="p-4">
            <Text className="text-xl font-bold">Subscribe to RSS Feeds</Text>
            <TextInput
                className="border p-2 my-2 text-white"
                placeholder="Enter RSS Feed URL"
                value={url}
                onChangeText={setUrl}
            />
            <Button title="Add Feed" onPress={handleAddFeed} />

            <FlatList
                data={feeds}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View className="p-4 border-b">
                        <View className="flex-row justify-between">
                            <Text className="text-white">{item.url}</Text>
                            <TouchableOpacity onPress={() => handleDeleteFeed(item.id)}>
                                <Text className="text-red-500">Delete</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Show articles safely */}
                        {(articles[item.url] ?? []).length > 0 && (
                            <FlatList
                                data={articles[item.url] ?? []}
                                keyExtractor={(article, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <View className="p-2 border-b">
                                        {/* Display Image if Available */}
                                        {item.image?.url && (
                                            <Image
                                                source={{ uri: item.image.url }}
                                                style={{ width: 100, height: 100, borderRadius: 8, marginBottom: 5 }}
                                            />
                                        )}
                                        <Text className="text-lg font-semibold text-gray-600">{item.title}</Text>
                                        <Text className="text-gray-600">
                                            {item.published ? new Date(item.published).toLocaleDateString() : "No date available"}
                                        </Text>
                                        <Text className="text-white">{item.description}</Text>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                )}
            />
        </View>
    );
}
