import React, { useMemo, useEffect, useState } from "react";
import { Platform } from "react-native";
import { Tabs, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const loggedIn = await AsyncStorage.getItem("chronel_loggedIn");

      if (!loggedIn) {
        router.replace("/welcome");
        return;
      }

      setReady(true);
    })();
  }, []);

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: theme.background,
      borderTopWidth: 0,
      borderTopColor: "transparent",
      elevation: 0,
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },

      height: Platform.OS === "ios" ? 88 : 72,
      paddingTop: 8,
      paddingBottom: Platform.OS === "ios" ? 24 : 12,

      position: "absolute" as const,
      left: 0,
      right: 0,
      bottom: 0,
    }),
    [theme.background]
  );

  if (!ready) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="checkin"
        options={{
          title: "Check-In",
          tabBarButtonTestID: "tab_checkin_btn_01",
          tabBarAccessibilityLabel: "tab_checkin_btn_01",
          tabBarButton: (props) => (
            <HapticTab {...props} testID="tab_checkin_btn_01" />
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house.fill" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarButtonTestID: "tab_calendar_btn_01",
          tabBarAccessibilityLabel: "tab_calendar_btn_01",
          tabBarButton: (props) => (
            <HapticTab {...props} testID="tab_calendar_btn_01" />
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="calendar" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarButtonTestID: "tab_insights_btn_01",
          tabBarAccessibilityLabel: "tab_insights_btn_01",
          tabBarButton: (props) => (
            <HapticTab {...props} testID="tab_insights_btn_01" />
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="chart.line.uptrend.xyaxis" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarButtonTestID: "tab_settings_btn_01",
          tabBarAccessibilityLabel: "tab_settings_btn_01",
          tabBarButton: (props) => (
            <HapticTab {...props} testID="tab_settings_btn_01" />
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="gearshape.fill" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
