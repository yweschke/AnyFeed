// components/cards/articleCard.tsx
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Article } from "@/types/rssFeed/article";
import { useTimeAgo } from "@/hooks/useTimeAgo";

export default function  ArticleCard({ article }: { article: Article }) {
    const getTimeAgo = useTimeAgo();
    const timeAgo = getTimeAgo(article.published);
    const router = useRouter();

    const handlePress = () => {
        if (article.id) {
            router.push(`/article/${article.id}`);
        } else {
            console.warn("Article has no ID, cannot navigate");
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={1}
            className="bg-primary-light dark:bg-primary-dark shadow-sm shadow-accent-light dark:shadow-accent-dark m-2 rounded-2xl my-1 mx-2 p-2 flex-row items-center"
        >
            <View className="flex-1 pr-2">
                <Text className={`${article.unread ? "text-textPrimary-light dark:text-textPrimary-dark" : "text-textSecondary-light dark:text-textSecondary-dark"} font-bold text`} numberOfLines={2}>
                    {article.title}
                </Text>
                <Text className={`${article.unread ? "text-textPrimary-light dark:text-textPrimary-dark" : "text-textSecondary-light dark:text-textSecondary-dark"} opacity-80 text-sm mt-1`} numberOfLines={2}>
                    {article.description}
                </Text>
                <Text className={`${article.unread ? "text-textPrimary-light dark:text-textPrimary-dark" : "text-textSecondary-light dark:text-textSecondary-dark"} opacity-80 text-xs mt-1`} numberOfLines={1}>
                    {timeAgo}
                </Text>
            </View>

            {article.image?.url && (
                <Image
                    className="w-20 h-20 rounded-md"
                    source={{ uri: article.image.url }}
                />
            )}
        </TouchableOpacity>
    );
}
