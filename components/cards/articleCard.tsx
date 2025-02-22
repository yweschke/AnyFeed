import { View, Text, Image, TouchableOpacity } from "react-native";
import { Article } from "@/types/rssFeed/article.ts";

export default function ArticleCard({ article, onPress }: { article: Article; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-gray-700 my-1 mx-2 p-2 rounded-lg flex-row items-center"
        >
            <View className="flex-1  pr-2">
                <Text className="text-white font-bold text-sm" numberOfLines={2}>
                    {article.title}
                </Text>
                <Text className="text-white opacity-80 text-xs mt-1" numberOfLines={2}>
                    {article.description}
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
