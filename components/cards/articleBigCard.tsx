import { View, Text, Image, TouchableOpacity } from "react-native";
import { Article } from "@/types/rssFeed/article.ts";

export default function ArticleBigCard({ article, onPress }: { article: Article; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
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
                <Text className="text-textPrimary-light dark:text-textPrimary-dark font-bold text-lg mt-2" numberOfLines={2}>
                    {article.title}
                </Text>
                <Text className="text-textPrimary-light dark:text-textPrimary-dark opacity-80 mt-1" numberOfLines={3}>
                    {article.description}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
