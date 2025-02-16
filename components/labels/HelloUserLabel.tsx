import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { supabase } from "@/services/supabase/supabaseClient.ts";

export default function HelloUserLabel() {
    const [greeting, setGreeting] = useState("");
    const [username, setUsername] = useState<string | null>(null);

    // ✅ Fetch User from Supabase
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUsername(user.user_metadata?.username || "");
            }
        };

        fetchUser();
    }, []); // No dependency needed

    // ✅ Update Greeting Based on Time
    useEffect(() => {
        const updateGreeting = () => {
            const hours = new Date().getHours();

            if (hours < 12) {
                setGreeting("Good Morning");
            } else if (hours < 18) {
                setGreeting("Good Afternoon");
            } else {
                setGreeting("Good Evening");
            }
        };

        updateGreeting();
    }, []); // Runs once on mount

    return (
        <View className="p-4">
            <Text className="text-xl font-bold text-white">
                {greeting} {username}
            </Text>
        </View>
    );
}
