import { View, Text } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/theme";
import { PrimaryButton } from "../../components/primarybutton";
import { SecondaryButton } from "../../components/secondarybutton";
import { InfoCard } from "../../components/InfoCard";

export default function Welcome() {
  return (
    <View
      testID="ID:welcome_root_01"
      style={{ flex: 1, backgroundColor: Colors.light.background, padding: 24 }}
    >
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          testID="ID:welcome_titleTxt_01"
          style={{
            fontSize: 42,
            fontWeight: "800",
            color: Colors.light.tint,
            textAlign: "center",
          }}
        >
          Welcome to Chronel
        </Text>

        <Text
          testID="ID:welcome_subTxt_01"
          style={{
            marginTop: 12,
            fontSize: 16,
            color: Colors.light.icon,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Track your daily well-being, gain insights, and build better habits with AI-powered suggestions.
        </Text>

        <View style={{ marginTop: 28 }}>
          <InfoCard
            testIDRoot="ID:welcome_privacyCard_01"
            testIDTitle="ID:welcome_privacyTitle_01"
            testIDBody="ID:welcome_privacyBody_01"
            title="Your privacy matters."
            body="Your check-ins are stored locally on your device. We never access your journal entries."
          />
        </View>
      </View>

      <View style={{ gap: 12, paddingBottom: 10 }}>
        <PrimaryButton
          testID="ID:welcome_signInBtn_01"
          title="Sign In"
          onPress={() => router.push("/login")}
        />
        <SecondaryButton
          testID="ID:welcome_guestBtn_01"
          title="Continue Without Account"
          onPress={() => router.replace("/onboarding/mode")}
        />
      </View>
    </View>
  );
}
