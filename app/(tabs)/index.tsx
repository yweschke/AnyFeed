import { useEffect, useState } from "react";
import { SafeAreaView, Text, TextInput, Button, ScrollView } from "react-native";
import { fetchRSSFeed } from "@/services/rss-parser/fetchRSSFeed.ts";
import { insertFeed, getFeeds, deleteFeed } from "@/services/database/rssFeeds";
import { Article } from "@/types/rssFeed/article.ts";
import ArticleCard from "@/components/cards/articleCard.tsx";
import HelloUserLabel from "@/components/labels/HelloUserLabel.tsx";

export default function HomeScreen() {
    const [url, setUrl] = useState("");
    const [articles, setArticles] = useState<Article[]>([]);
    const [unreadArticles, setUnreadArticles] = useState<Article[]>([]);

    useEffect(() => {
        const fetchAllArticles = async () => {
            try {
                const feeds = await getFeeds(); // Fetch stored feeds
                let allArticles: Article[] = [];

                for (const feed of feeds) {
                    const fetchedArticles = await fetchRSSFeed(feed.url);
                    allArticles = [...allArticles, ...fetchedArticles];
                }

                setArticles(allArticles);
            } catch (error) {
                console.error("❌ Error fetching articles:", error);
            }
        };

        fetchAllArticles();
    }, []);

    const handleAddFeed = async () => {
        if (!url.trim()) return;
        try {
            await insertFeed(url, url);
            console.log("✅ Feed added");
            setUrl("");
        } catch (error) {
            console.error("❌ Error adding feed:", error);
        }
    };

    const handleDeleteFeed = async (id: number) => {
        try {
            await deleteFeed(id);
            console.log("✅ Feed deleted");
        } catch (error) {
            console.error("❌ Error deleting feed:", error);
        }
    };

    return (
        <SafeAreaView className="flex-1">
            <HelloUserLabel />
        </SafeAreaView>
    );
}
