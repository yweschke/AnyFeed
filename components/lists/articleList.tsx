import React, { useRef } from 'react';
import { Animated, View } from 'react-native';
import { Article } from '@/types/rssFeed/article';
import HelloUserLabel from "@/components/labels/HelloUserLabel.tsx";
import ArticleCard from "@/components/cards/articleCard.tsx";
import ArticleBigCard from "@/components/cards/articleBigCard.tsx";
import FeedCard from "@/components/cards/feedCard.tsx";

export default function ArticleList({ articles }: { articles: Article[] }) {
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
        <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary ">
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
                className="bg-light-bg-primary dark:bg-dark-bg-primary m-2 rounded-2xl shadow-xl"
            >
                <View className="justify-center items-center w-full">
                    <FeedCard articles={articleArray} />
                </View>
            </Animated.ScrollView>
        </View>
    );r
}
