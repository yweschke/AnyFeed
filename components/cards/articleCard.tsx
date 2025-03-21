// components/cards/articleCard.tsx
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Article } from "@/types/rssFeed/article.ts";
import { useTimeAgo } from "@/hooks/useTimeAgo.ts";

export default function ArticleCard({ article, onPress }: { article: Article; onPress?: () => void }) {
    const getTimeAgo = useTimeAgo();
    const timeAgo = getTimeAgo(article.published);
    const router = useRouter();

    const handlePress = () => {
        // Navigate to the article detail page using the article ID as the parameter
        if (article.id) {
            router.push(`/article/${article.id}`);
        } else {
            console.warn("Article has no ID, cannot navigate");
        }

        if (onPress) {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            className="bg-primary-light dark:bg-primary-dark shadow-sm shadow-accent-light dark:shadow-accent-dark m-2 rounded-2xl my-1 mx-2 p-2 flex-row items-center"
        >
            <View className="flex-1 pr-2">
                <Text className="text-textPrimary-light dark:text-textPrimary-dark font-bold text" numberOfLines={2}>
                    {article.title}
                </Text>
                <Text className="text-textPrimary-light dark:text-textPrimary-dark opacity-80 text-sm mt-1" numberOfLines={2}>
                    {article.description}
                </Text>
                <Text className="text-textPrimary-light dark:text-textPrimary-dark opacity-80 text-xs mt-1" numberOfLines={1}>
                    {timeAgo}
                </Text>
            </View>

            {/* Image on the Right */}
            {article.image?.url && (
                <Image
                    className="w-20 h-20 rounded-md"
                    source={{ uri: article.image.url }}
                />
            )}
        </TouchableOpacity>
    );
}
