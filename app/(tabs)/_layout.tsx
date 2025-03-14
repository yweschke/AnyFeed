import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    // Use explicit hex format for all colors to ensure consistency
    const iconColor = isDark ? "#8ca0b4" : "#50647f";
    const activeColor = isDark ? '#60a5fa' : '#0284c7';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: isDark ? 'rgba(90, 110, 140, 1)' : 'rgba(50, 70, 100, 1)',
                tabBarInactiveTintColor: isDark ? 'rgba(27, 38, 59, 1)' : 'rgba(119, 141, 169, 1)',
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    opacity: 1,
                    width: '90%',
                    marginLeft: '5%',
                    position: 'absolute',
                    bottom: 30,
                    left: 30,
                    right: 30,
                    borderRadius: 25,
                    elevation: 5,
                    backgroundColor: isDark ? 'rgba(13, 27, 42, 1)' : 'rgba(255, 255, 255, 1)',
                    shadowColor: isDark ? 'rgba(90, 110, 140, 1)' : 'rgba(50, 70, 100, 1)',
                    shadowOpacity: 0.2,
                    shadowOffset: { width: 0, height: 10 },
                    shadowRadius: 5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                }
            }}
        >
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name="search"
                            size={28}
                            color={focused ? activeColor : iconColor}
                            style={{ opacity: 1 }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <IconSymbol
                            size={50}
                            name="house.fill"
                            color={focused ? activeColor : iconColor}
                            style={{ opacity: 1 }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Library',
                    tabBarIcon: ({ focused }) => (
                        <IconSymbol
                            size={28}
                            name="bookmark.fill"
                            color={focused ? activeColor : iconColor}
                            style={{ opacity: 1 }}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
