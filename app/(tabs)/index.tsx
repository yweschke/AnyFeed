import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { fetchRSSFeed } from "@/services/rss-parser/fetchRSSFeed.ts";
import { getFeeds } from "@/services/database/rssFeeds";
import { Article } from "@/types/rssFeed/article.ts";
import ArticleList from "@/components/lists/articleList.tsx";

export default function HomeScreen() {
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        const fetchAllArticles = async () => {
            try {
                const feeds = await getFeeds();
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

    return (
        <SafeAreaView className="flex-1 ">
            <ArticleList articles={articles} />
        </SafeAreaView>
    );
}
