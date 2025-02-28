import { useEffect, useState } from "react";
import { View } from "react-native";
import { fetchRSSFeed } from "@/services/rss-parser/fetchRSSFeed.ts";
import { getFeeds } from "@/services/database/rssFeeds";
import { Article } from "@/types/rssFeed/article.ts";
import ArticleList from "@/components/lists/articleList.tsx";

export default function HomeScreen() {
    return (
        <View className="flex-1 pt-safe">
            <ArticleList/>
        </View>
    );
}
