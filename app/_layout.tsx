import React, { useEffect, useRef, useState } from "react";
import { Slot } from "expo-router";
import { View, Text, Animated } from "react-native";
import { AppThemeProvider, useAppTheme } from "../hooks/use-app-theme";

function SplashOverlay({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const { colors, ready } = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    opacity.setValue(0);

    const anim = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(opacity, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]);

    anim.start(({ finished }) => {
      if (finished) onDone();
    });

    return () => anim.stop();
  }, [visible, opacity, onDone]);

  if (!ready) return null;
  if (!visible) return null;

  return (
    <Animated.View
      testID="ID:splash_root_01"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        elevation: 9999,
        backgroundColor: colors.bg,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        opacity,
      }}
    >
      <Text
        testID="ID:splash_titleTxt_01"
        style={{
          fontSize: 44,
          fontWeight: "700",
          color: colors.tint,
        }}
      >
        Chronel
      </Text>

      <Text
        testID="ID:splash_taglineTxt_01"
        style={{ marginTop: 10, fontSize: 18, color: colors.subtext }}
      >
        Reflect. Adjust. Repeat.
      </Text>
    </Animated.View>
  );
}

function AppShell() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setShowSplash(true);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <SplashOverlay visible={showSplash} onDone={() => setShowSplash(false)} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AppShell />
    </AppThemeProvider>
  );
}
