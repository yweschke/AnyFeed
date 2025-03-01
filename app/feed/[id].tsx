import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, FlatList, ActivityIndicator } from 'react-native';
import ArticleList from '@/components/lists/articleList.tsx'

export default function FeedDetailScreen() {
    return (
        <SafeAreaView className="flex-1 bg-primary-light dark:bg-primary-dark">
            <ArticleList />
        </SafeAreaView>
    );
}
