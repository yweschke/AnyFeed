import { View, Text, Image, TouchableOpacity } from "react-native";
import { Article } from "@/types/rssFeed/article.ts";

export default function ArticleBigCard({ article}: { article: Article; onPress: () => void }) {
    return (
        <TouchableOpacity className="bg-light-bg-primary dark:bg-dark-bg-primary m-2 rounded-2xl shadow-xl shadow-light-accent dark:shadow-dark-accent w-100">
            {/* Article Content */}
            <View className="p-3">
                <Image
                    className="w-full h-40 rounded-lg"
                    source={{uri: article.image?.url}}
                />
                <Text className="text-light-text dark:text-dark-text font-bold text-lg" numberOfLines={2}>{article.title}</Text>
                <Text className="text-light-text dark:text-dark-text opacity-80" numberOfLines={3}>{article.description}</Text>
            </View>
        </TouchableOpacity>
    );
}
