import React, {useEffect, useRef, useState} from 'react';
import { Animated, View } from 'react-native';
import { Article } from '@/types/rssFeed/article';
import HelloUserLabel from "@/components/labels/HelloUserLabel.tsx";
import ArticleCard from "@/components/cards/articleCard.tsx";
import ArticleBigCard from "@/components/cards/articleBigCard.tsx";
import FeedCard from "@/components/cards/feedCard.tsx";
import {getFeeds} from "@/services/database/rssFeeds.ts";
import {fetchRSSFeed} from "@/services/rss-parser/fetchRSSFeed.ts";

export default function ArticleList() {
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

                setArticles(allArticles );
            } catch (error) {
                console.error("❌ Error fetching articles:", error);
            }
        };

        fetchAllArticles();
    }, []);

    //Animation for HelloUserLabel
    const scrollY = useRef(new Animated.Value(0)).current;

    const HEADER_MAX_HEIGHT = 120;
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

    const articleArray : Article[] = articles.slice(0, 4);

    return (
        <View className="flex-1 bg-primary-light dark:bg-primary-dark ">
            {/* ✅ Pass scroll animations as props */}
            <HelloUserLabel
                articles={articles}
                headerHeight={headerHeight}
                unreadOpacity={unreadOpacity}
            />

            {/* ✅ Fix: Use Animated.ScrollView for scrolling */}
            <Animated.ScrollView
                style={{ paddingTop: HEADER_MAX_HEIGHT }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false } // `false` because `height` can't be animated with `nativeDriver`
                )}
                className="m-2 rounded-2xl"
            >
                <View className="justify-center items-center w-full">
                    <FeedCard articles={articleArray} />
                </View>
            </Animated.ScrollView>
        </View>
    );r
}
