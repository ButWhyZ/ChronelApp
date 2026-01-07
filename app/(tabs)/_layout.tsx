import React from "react";
import { Tabs } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../../hooks/use-app-theme";

export const TAB_BAR_BASE_HEIGHT = 74; // visual height without safe-area

function GlassTabBar({ state, descriptors, navigation }: any) {
  const { colors, themeMode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const bottom = (Platform.OS === "ios" ? 10 : 10) + insets.bottom;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]} testID="ID:tabbar_wrap_01">
      <BlurView
        intensity={90}
        tint={themeMode === "dark" ? "dark" : "light"}
        style={[
          styles.glass,
          {
            borderColor: colors.border,
            backgroundColor: themeMode === "dark" ? "rgba(0,0,0,0.20)" : "rgba(255,255,255,0.12)",
          },
        ]}
        testID="ID:tabbar_glass_01"
      >
        <View
          pointerEvents="none"
          style={[styles.glassHighlight, { borderColor: themeMode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.30)" }]}
          testID="ID:tabbar_glassHighlight_01"
        />

        <View style={styles.row} testID="ID:tabbar_row_01">
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const icon = (() => {
              if (route.name === "index") return isFocused ? "home" : "home-outline";
              if (route.name === "calendar") return isFocused ? "calendar" : "calendar-outline";
              if (route.name === "checkin") return isFocused ? "checkbox" : "checkbox-outline";
              if (route.name === "insights") return isFocused ? "stats-chart" : "stats-chart-outline";
              if (route.name === "settings") return isFocused ? "settings" : "settings-outline";
              return isFocused ? "ellipse" : "ellipse-outline";
            })();

            const label =
              options.tabBarLabel ??
              options.title ??
              (route.name === "index" ? "Home" : route.name);

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.item}
                testID={`ID:tabbar_item_${route.name}_01`}
              >
                <Ionicons
                  name={icon as any}
                  size={22}
                  color={isFocused ? colors.tint : colors.subtext}
                  testID={`ID:tabbar_icon_${route.name}_01`}
                />
                <Text
                  style={[styles.label, { color: isFocused ? colors.tint : colors.subtext }]}
                  testID={`ID:tabbar_label_${route.name}_01`}
                >
                  {String(label)}
                </Text>

                {isFocused ? (
                  <View style={[styles.activeDot, { backgroundColor: colors.tint }]} testID={`ID:tabbar_activeDot_${route.name}_01`} />
                ) : (
                  <View style={styles.activeDotPlaceholder} testID={`ID:tabbar_activeDotEmpty_${route.name}_01`} />
                )}
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Tell navigator the tab bar has height so screens can layout correctly.
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom + 20;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: tabBarHeight,
        },
      }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      <Tabs.Screen name="checkin" options={{ title: "Check-in" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  glass: {
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  glassHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  item: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6, gap: 4 },
  label: { fontSize: 12, fontWeight: "800" },
  activeDot: { width: 6, height: 6, borderRadius: 999, marginTop: 2 },
  activeDotPlaceholder: { width: 6, height: 6, marginTop: 2 },
});
