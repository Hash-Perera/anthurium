import { Tabs } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const HeaderIcons = () => (
    <View
      style={{
        flexDirection: "row",
        gap: 16,
        marginRight: 16,
      }}
    >
      <TouchableOpacity>
        <IconSymbol size={24} name="bell.fill" color={colors.white} />
      </TouchableOpacity>
      <TouchableOpacity>
        <IconSymbol size={24} name="person.circle.fill" color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        headerRight: () => <HeaderIcons />,
      }}
      // tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="root-zone"
        options={{
          title: "Root Zone",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="leaf.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: "Market",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="diseases"
        options={{
          title: "Diseases",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="exclamationmark.triangle.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: "Weather",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cloud.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
