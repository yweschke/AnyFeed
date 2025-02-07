import Constants from "expo-constants";

const SUPABASE_URL = "https://lalrshainbuznfziqmnq.supabase.co";
const SUPABASE_ANON_KEY = "2fc97413aeeed7f8d9bdf9c118ade021a23d45b552de1a4521803c31457739cf";

console.log(`${SUPABASE_URL}/functions/v1/fetch-rss?url}`);

export const fetchRSSFeed = async (rssUrl: string): Promise<any[]> => {
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-rss?url=${encodeURIComponent(rssUrl)}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching RSS:", error);
        return [];
    }
};
