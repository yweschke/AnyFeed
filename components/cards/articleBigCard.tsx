// components/cards/articleBigCard.tsx
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Article } from "@/types/rssFeed/article.ts";
import { useTimeAgo } from "@/hooks/useTimeAgo.ts";

export default function ArticleBigCard({ article}: { article: Article}) {
    const getTimeAgo = useTimeAgo();
    const timeAgo = getTimeAgo(article.published);
    const router = useRouter();

    const handlePress = () => {
        if (article.id) {
            console.log("Navigating to article:", article.id);
            router.push(`/article/${article.id}`);
        } else {
            console.warn("Article has no ID, cannot navigate");
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            className="bg-primary-light dark:bg-primary-dark shadow-sm shadow-accent-light dark:shadow-accent-dark m-2 rounded-2xl w-100"
        >
            {/* Article Content */}
            <View className="p-3">
                {article.image?.url && (
                    <Image
                        className="w-full h-40 rounded-lg"
                        source={{uri: article.image.url}}
                    />
                )}
                <Text className={`${article.unread ? "text-textPrimary-light dark:text-textPrimary-dark" : "text-textSecondary-light dark:text-textSecondary-dark"} font-bold text-lg mt-2`} numberOfLines={2}>
                    {article.title}
                </Text>
                <Text className={`${article.unread ? "text-textPrimary-light dark:text-textPrimary-dark" : "text-textSecondary-light dark:text-textSecondary-dark"} opacity-80 mt-1`} numberOfLines={3}>
                    {article.description}
                </Text>
                <Text className={`${article.unread ? "text-textPrimary-light dark:text-textPrimary-dark" : "text-textSecondary-light dark:text-textSecondary-dark"} opacity-80 text-sm mt-1`} numberOfLines={1}>
                    {timeAgo}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
