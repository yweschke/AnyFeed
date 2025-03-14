import { View, Text, Image } from "react-native";
import { Article } from "@/services/database/rssArticles";

export default function ArticleCard({ article }: { article: Article }) {
    return (
        <View className="p-4 bg-white shadow-md rounded-lg mb-4">
            {/* Article Image */}
            {article.enclosure?.url && (
                <Image
                    source={{ uri: article.enclosure.url }}
                    className="w-full h-40 rounded-lg"
                    resizeMode="cover"
                />
            )}

            {/* Article Title */}
            <Text className="text-lg font-bold mt-2">{article.title}</Text>

            {/* Article Date */}
            <Text className="text-gray-500 text-sm">
                {new Date(article.isoDate || article.date).toLocaleDateString()}
            </Text>
        </View>
    );
}
