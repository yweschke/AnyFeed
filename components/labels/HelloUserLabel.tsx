import React, { useEffect, useState } from "react";
import { Animated, View, Text } from "react-native";
import { supabase } from "@/services/supabase/supabaseClient.ts";
import { useTranslation } from "react-i18next";

interface HelloUserLabelProps {
    headerHeight: Animated.AnimatedInterpolation<number>;
    unreadOpacity: Animated.AnimatedInterpolation<number>;
    articles: any[];
}

export default function HelloUserLabel({ articles, headerHeight, unreadOpacity }: HelloUserLabelProps) {
    const { t } = useTranslation("home");
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
    }, []);

    useEffect(() => {
        const updateGreeting = () => {
            const hours = new Date().getHours();
            setArticleCount(articles?.length ?? 0);

            if (hours < 12) {
                setGreeting(t("home.greeting.morning", { name: username ? ", " + username : "" }));
            } else if (hours < 18) {
                setGreeting(t("home.greeting.afternoon", { name: username ? ", " + username : "" }));
            } else {
                setGreeting(t("home.greeting.evening", { name: username ? ", " + username : "" }));
            }
        };

        updateGreeting();
    }, [username, articles, t]);

    return (
        <Animated.View
            className="absolute top-0 left-0 right-0 bg-gray-950 justify-center px-4"
            style={{ height: headerHeight, zIndex: 1000, elevation: 4 }}
        >
            <Text className="text-3xl font-bold text-white pt-8">{greeting}</Text>
            <Animated.Text className="text-2xl text-white" style={{ opacity: unreadOpacity }}>
                {t("home.greeting.unreadArticles", { unreadArticles: articleCount })}
            </Animated.Text>
        </Animated.View>
    );
}
