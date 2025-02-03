import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { insertFeed, getFeeds, deleteFeed } from '@/services/database/rssFeeds';

interface Feed {
  id: number;
  title: string;
  url: string;
  created_at: string;
}

export default function HomeScreen() {
  const [url, setUrl] = useState('');
  const [feeds, setFeeds] = useState<Feed[]>([]);

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    const data = await getFeeds();
    setFeeds(data);
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
                <View className="flex-row justify-between p-2 border-b">
                  <Text className="text-white">{item.url}</Text>
                  <TouchableOpacity onPress={() => handleDeleteFeed(item.id)}>
                    <Text className="text-red-500">Delete</Text>
                  </TouchableOpacity>
                </View>
            )}
        />
      </View>
  );
}
