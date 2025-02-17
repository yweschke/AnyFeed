import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { supabase } from "@/services/supabase/supabaseClient.ts";
import Articles from "@/types/rssFeed/article.ts";
import { useTranslation } from 'react-i18next';

export default function HelloUserLabel(props: Articles[]) {
    const { t } = useTranslation('home');
    const [greeting, setGreeting] = useState("");
    const [username, setUsername] = useState<string | null>(null);
    const [articleCount, setArticleCount] = useState<number>(0);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUsername(user.user_metadata?.username || "");
            }
        };

        fetchUser();
    }, []); // No dependency needed

    useEffect(() => {
        const updateGreeting = () => {
            const hours = new Date().getHours();
            setArticleCount(props?.length ?? 0);

            if (hours < 12) {
                setGreeting(t("home.greeting.morning", { name: username ? ", " + username : "" }));
            } else if (hours < 18) {
                setGreeting(t("home.greeting.afternoon", { name: username ? ", " + username : "" }));
            } else {
                setGreeting(t("home.greeting.evening", { name: username ? ", " + username : "" }));
            }
        };

        updateGreeting();
    }, []);

    return (
        <View className="p-4">
            <Text className="text-xl font-bold text-white">
                {greeting}
            </Text>
            <Text className="text-white">
                {t("home.greeting.unreadArticles", { unreadArticles: articleCount })}
            </Text>
        </View>
    );
}
