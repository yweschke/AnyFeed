import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
      <Tabs
          screenOptions={{
              tabBarActiveTintColor: Colors.light.tint,
              headerShown: false,
              tabBarButton: HapticTab,
              tabBarStyle: styles.floatingTabBar,
          }}
      >
          <Tabs.Screen
              name="explore"
              options={{
                  title: 'Explore',
                  tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
              }}
          />
          <Tabs.Screen
              name="index"
              options={{
                  title: 'Home',
                  tabBarIcon: ({ color }) => <IconSymbol size={50} name="house.fill" color={color} />,
              }}
          />
          <Tabs.Screen
              name="library"
              options={{
                  title: 'Library',
                  tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
              }}
          />
      </Tabs>

  );
}

const styles = StyleSheet.create({
    floatingTabBar: {
        width: '90%',
        marginLeft: '5%',
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        borderRadius: 25,
        elevation: 5,
        backgroundColor: 'rgba(255, 255, 255, 1)', // Semi-transparent white
        shadowColor: '#000', // iOS shadow
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
        display: 'flex',
        justifyContent: 'center', // Center items vertically
        alignItems: 'center', // Center items horizontally
        flexDirection: 'row', // Ensure items are in a row
    },
});
