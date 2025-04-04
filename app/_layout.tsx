import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "../global.css";

import { useColorScheme } from "@/hooks/useColorScheme";
import { setupDatabase } from "@/services/database/rssFeeds";
import { supabase } from "@/services/supabase/supabaseClient.ts"; // Import Supabase client
import Auth from "@/app/auth/auth.tsx"; // Import auth screen
import '@/services/i18n/config.ts';// Prevent the splash screen from auto-hiding before asset loading is complete.
import { setupDatabase as setupFeedsDatabase } from "@/services/database/rssFeeds";
import { setupDatabase as setupArticlesDatabase } from "@/services/database/rssArticles";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    setupFeedsDatabase();
    setupArticlesDatabase();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar
            style={colorScheme === 'dark' ? 'light' : 'dark'}
            backgroundColor={colorScheme === 'dark' ? "rgba(13, 27, 42, 1)" : "rgba(255, 255, 255, 1)"}
            translucent={false}
        />
        {session ? (
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
        ) : (
            <Auth />
        )}
      </ThemeProvider>
  );
}
