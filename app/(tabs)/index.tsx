import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { insertFeed, getFeeds, deleteFeed } from '@/services/database/rssFeeds';
import { fetchRSSFeed } from '@/services/rss-parser/fetchRSSFeed.ts';

interface Feed {
    id: number;
    title: string;
    url: string;
    created_at: string;
}

interface Article {
    title: string;
    link: string;
    date: string;
    creator?: string;
    content?: string;
    description?: string;
    categories?: string;
    isoDate?: string;
}

export default function HomeScreen() {
    const [url, setUrl] = useState('');
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [articles, setArticles] = useState<{ [key: string]: Article[] }>({});

    useEffect(() => {
        fetchFeeds();
    }, []);

    const fetchFeeds = async () => {
        const data = await getFeeds();
        setFeeds(data);
    };

    // Fetch articles when feeds update
    useEffect(() => {
        const loadArticles = async () => {
            for (const feed of feeds) {
                await fetchArticles(feed.url);
            }
        };
        if (feeds.length > 0) {
            loadArticles();
        }
    }, [feeds]);

    const fetchArticles = async (feedUrl: string) => {
        const fetchedArticles = await fetchRSSFeed(feedUrl);
        setArticles(prev => ({ ...prev, [feedUrl]: fetchedArticles }));
    };

    const handleAddFeed = async () => {
        if (!url.trim()) return;
        await insertFeed(url, url);
        console.log('✅ Feed added');
        setUrl('');
        fetchFeeds();
    };

    const handleDeleteFeed = async (id: number) => {
        await deleteFeed(id);
        fetchFeeds();
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
                                        <Text className="text-lg font-semibold">{item.title}</Text>
                                        <Text className="text-gray-600">{item.date}</Text>
                                        <Text>{item.description}</Text>
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
