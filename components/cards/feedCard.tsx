import React from 'react';
import { View } from 'react-native';
import { Article } from '@/types/rssFeed/article';
import ArticleBigCard from '@/components/cards/articleBigCard.tsx';
import ArticleCard from '@/components/cards/articleCard.tsx';

export default function FeedCard({ articles }: { articles: Article[] }) {
    return (
        <View className="bg-secondary-light dark:bg-secondary-dark shadow shadow-accent-light dark:shadow-accent-dark p-2 rounded-lg m-3 justify-center items-center">
            {/* ✅ Render a big article only if at least one exists */}
            {articles.length > 0 && <ArticleBigCard article={articles[0]} />}

            {/* ✅ Render up to 3 ArticleCards if they exist */}
            {articles.length > 1 &&
                articles.slice(1, 3).map((article) => {
                    return <ArticleCard key={article.url} article={article} />;
                })}
        </View>
    );
}
