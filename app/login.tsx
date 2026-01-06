import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { OAuthButton } from "../components/OAuthButton";
import { InfoCard } from "../components/InfoCard";
import { useAppTheme } from "../hooks/use-app-theme";
import AsyncStorage from "@react-native-async-storage/async-storage";



export default function Login() {
  const { colors } = useAppTheme();

  const fakeAuth = async () => {
  await AsyncStorage.setItem("chronel_loggedIn", "true");
  router.replace("/(tabs)");
};

  return (
    <View
      testID="ID:login_root_01"
      style={{ flex: 1, backgroundColor: colors.bg, padding: 24 }}
    >
      <Pressable
        testID="ID:login_backBtn_01"
        onPress={() => router.back()}
        style={{ paddingVertical: 8 }}
      >
        <Text style={{ color: colors.subtext, fontWeight: "700" }}>← Back</Text>
      </Pressable>

      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          testID="ID:login_titleTxt_01"
          style={{ fontSize: 34, fontWeight: "900", color: colors.text }}
        >
          Sign In
        </Text>

        <Text
          testID="ID:login_subTxt_01"
          style={{ marginTop: 10, color: colors.subtext }}
        >
          Connect your account to sync across devices
        </Text>

        <View style={{ marginTop: 22, gap: 14 }}>
          <OAuthButton
            testID="ID:login_oauth_googleBtn_01"
            icon="🟢"
            label="Continue with Google"
            onPress={fakeAuth}
          />
          <OAuthButton
            testID="ID:login_oauth_appleBtn_01"
            icon=""
            label="Continue with Apple"
            onPress={fakeAuth}
          />
          <OAuthButton
            testID="ID:login_oauth_facebookBtn_01"
            icon="🔵"
            label="Continue with Facebook"
            onPress={fakeAuth}
          />
        </View>

        <View style={{ marginTop: 22 }}>
          <InfoCard
            testIDRoot="ID:login_privacyCard_01"
            testIDTitle="ID:login_privacyTitle_01"
            testIDBody="ID:login_privacyBody_01"
            title=" "
            body="Signing in only syncs your settings and preferences. Your journal data remains stored locally on your device."
          />
        </View>
      </View>
    </View>
  );
}
