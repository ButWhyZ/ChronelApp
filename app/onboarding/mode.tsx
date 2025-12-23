import { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/theme";
import { ProgressBar } from "../../components/progressbar";
import { ModeCard } from "../../components/modecard";
import { PrimaryButton } from "../../components/primarybutton";

type Mode = "pulse" | "rhythm" | "deepDive";

export default function ModeSelect() {
  const [mode, setMode] = useState<Mode>("rhythm");

  return (
    <View testID="ID:mode_root_01" style={{ flex: 1, backgroundColor: Colors.light.background, padding: 24 }}>
      <ProgressBar testID="ID:mode_progress_01" progress={1 / 3} />
      <Text testID="ID:mode_stepTxt_01" style={{ marginTop: 16, color: Colors.light.icon }}>
        Step 1 of 3
      </Text>

      <Text testID="ID:mode_titleTxt_01" style={{ marginTop: 10, fontSize: 34, fontWeight: "900", color: Colors.light.text }}>
        Choose Your Mode
      </Text>
      <Text testID="ID:mode_subTxt_01" style={{ marginTop: 10, color: Colors.light.icon }}>
        Select how frequently you'd like to check in
      </Text>

      <View style={{ marginTop: 18, gap: 14 }}>
        <ModeCard
          testID="ID:mode_pulseCard_01"
          title="Pulse"
          subtitle="Quick daily reflection for busy days"
          meta="1 check-in per day • 1 AI response"
          selected={mode === "pulse"}
          onPress={() => setMode("pulse")}
        />
        <ModeCard
          testID="ID:mode_rhythmCard_01"
          title="Rhythm"
          subtitle="Balanced approach for daily tracking"
          meta="1–2 check-ins per day"
          selected={mode === "rhythm"}
          onPress={() => setMode("rhythm")}
        />
        <ModeCard
          testID="ID:mode_deepDiveCard_01"
          title="Deep Dive"
          subtitle="Detailed tracking for comprehensive insights"
          meta="Up to 3 check-ins per day"
          selected={mode === "deepDive"}
          onPress={() => setMode("deepDive")}
        />
      </View>

      <View style={{ marginTop: "auto", paddingBottom: 10 }}>
        <PrimaryButton
          testID="ID:mode_continueBtn_01"
          title="Continue"
          onPress={() => router.push("/onboarding/about-day")}
        />
      </View>
    </View>
  );
}
