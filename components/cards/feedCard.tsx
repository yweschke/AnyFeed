import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Article } from '@/types/rssFeed/article';
import { Feed } from '@/types/rssFeed/feed';
import ArticleBigCard from '@/components/cards/articleBigCard.tsx';
import ArticleCard from '@/components/cards/articleCard.tsx';

export default function FeedCard({ feed, articles }: { feed: Feed, articles: Article[] }) {
    const router = useRouter();

    const handleFeedPress = () => {
        router.push(`/feed/${feed.id}`);
    };

    return (
        <View className="bg-secondary-light dark:bg-secondary-dark shadow shadow-accent-light dark:shadow-accent-dark p-2 rounded-lg m-3 justify-center items-center">
            <TouchableOpacity onPress={handleFeedPress}>
                <Text className="text-xl text-textSecondary-light dark:text-textSecondary-dark">{feed.title}</Text>
            </TouchableOpacity>

            {/* Render a big article only if at least one exists */}
            {articles.length > 0 && (
                <ArticleBigCard
                    article={articles[0]}
                />
            )}

            {/* Render up to 3 ArticleCards if they exist */}
            {articles.length > 1 &&
                articles.slice(1, 3).map((article) => (
                    <ArticleCard
                        key={article.url}
                        article={article}
                    />
                ))
            }
        </View>
    );
}
