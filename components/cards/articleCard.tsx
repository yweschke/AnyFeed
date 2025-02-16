import { View, Text, Image, TouchableOpacity } from "react-native";
import { Article } from "@/types/rssFeed/article.ts";

export default function ArticleCard({ article, onPress }: { article: Article; onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} className="bg-yellow-400 p-4 rounded-2xl shadow-md w-80">
            {/* Article Content */}
            <View className="p-3">
                <Image source={article.image?.url} className="w-full h-24 rounded-t-2xl"  />
                <Text className="text-black font-bold text-lg">{article.title}</Text>
                <Text className="text-black opacity-80">{article.description}</Text>
                <Text className="text-black font-bold mt-2">$3.99/month</Text>
            </View>

            {/* Right Arrow Icon */}
            <View className="absolute top-3 right-3 bg-black p-2 rounded-full">
                <Text className="text-white">{">"}</Text>
            </View>
        </TouchableOpacity>
    );
}
