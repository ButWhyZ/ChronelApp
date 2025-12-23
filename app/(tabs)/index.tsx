import { useEffect } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../constants/theme";

export default function Splash() {
  useEffect(() => {
    const run = async () => {
      const hasLaunched = await AsyncStorage.getItem("chronel_hasLaunched");
      // First time: show splash for 3 seconds, then go to welcome
      if (!hasLaunched) {
        setTimeout(async () => {
          await AsyncStorage.setItem("chronel_hasLaunched", "true");
          router.replace("/welcome");
        }, 3000);
        return;
      }
      // Returning user: skip splash
      router.replace("/welcome");
    };
    run();
  }, []);

  return (
    <View
      testID="ID:splash_root_01"
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      <Text
        testID="ID:splash_titleTxt_01"
        style={{
          fontSize: 44,
          fontWeight: "700",
          color: Colors.light.tint,
          letterSpacing: 0.2,
        }}
      >
        Chronel
      </Text>
      <Text
        testID="ID:splash_taglineTxt_01"
        style={{
          marginTop: 10,
          fontSize: 18,
          color: Colors.light.icon,
        }}
      >
        Reflect. Adjust. Repeat.
      </Text>
    </View>
  );
}
