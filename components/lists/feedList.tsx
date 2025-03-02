import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, ActivityIndicator } from 'react-native';
import { Article } from '@/types/rssFeed/article';
import { Feed } from '@/types/rssFeed/feed';
import HelloUserLabel from "@/components/labels/HelloUserLabel.tsx";
import FeedCard from "@/components/cards/feedCard.tsx";
import { getFeeds } from "@/services/database/rssFeeds.ts";
import { fetchRSSFeed } from "@/services/rss-parser/fetchRSSFeed.ts";
import { insertArticles, getNewestArticles, getUnreadArticlesNumber } from "@/services/database/rssArticles.ts";

interface FeedWithArticles {
    feed: Feed;
    articles: Article[];
}

export default function FeedList() {
    const [feedsWithArticles, setFeedsWithArticles] = useState<FeedWithArticles[]>([]);
    const [unreadArticlesNumber, setUnreadArticlesNumber] = useState<number>(0);

    useEffect(() => {
        const fetchAndStoreArticles = async () => {
            try {
                const feeds = await getFeeds();
                let allFetchedArticles: Article[] = [];
                const feedsWithArticlesArray: FeedWithArticles[] = [];

                // Fetch, store and organize articles by feed
                for (const feed of feeds) {
                    // Fetch new articles
                    const fetchedArticles = await fetchRSSFeed(feed.url);

                    // Skip to next feed if no articles were fetched
                    if (!fetchedArticles || fetchedArticles.length === 0) {
                        console.log(`No articles fetched for feed: ${feed.title}`);
                        continue;
                    }

                    // Store in database
                    await insertArticles(fetchedArticles, feed.id);

                    // Get newest articles for display
                    const newestArticles = await getNewestArticles(feed.id, 4);

                    // Skip if no articles are available to display
                    if (newestArticles.length === 0) {
                        continue;
                    }

                    // Add to our feed-articles mapping
                    feedsWithArticlesArray.push({
                        feed: feed,
                        articles: newestArticles
                    });
                }

                setFeedsWithArticles(feedsWithArticlesArray);
            } catch (error) {
                console.error("❌ Error fetching and storing articles:", error);
            }
        };

        fetchAndStoreArticles();
    }, []);

    useEffect(() => {
        const fetchUnreadArticles = async () => {
            try {
                const numberOfUnreadArticles = await getUnreadArticlesNumber();
                setUnreadArticlesNumber(numberOfUnreadArticles);
            } catch (error) {
                console.error("❌ Error fetching unread articles:", error);
            }
        };

        fetchUnreadArticles();
    }, [feedsWithArticles]);

    // Animation for HelloUserLabel
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

    return (
        <View className="flex-1 bg-primary-light dark:bg-primary-dark">
            <HelloUserLabel
                unreadArticlesNumber={unreadArticlesNumber}
                headerHeight={headerHeight}
                unreadOpacity={unreadOpacity}
            />

            <Animated.FlatList
                style={{ paddingTop: HEADER_MAX_HEIGHT}}
                data={feedsWithArticles}
                keyExtractor={(item) => item.feed.id.toString()}
                renderItem={({ item }) => (
                    <FeedCard articles={item.articles} feed={item.feed} />
                )}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                className="m-2 rounded-2xl pb-100"
                ListFooterComponent={<View style={{ height: 100 }} />}
            />
        </View>
    );
}
