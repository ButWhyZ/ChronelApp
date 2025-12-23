import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/theme";
import { ProgressBar } from "../../components/progressbar";
import { PrimaryButton } from "../../components/primarybutton";
import { SecondaryButton } from "../../components/secondarybutton";

const chipData = [
  "Distractions",
  "Procrastination",
  "Lack of energy",
  "Unclear goals",
  "Too many tasks",
  "Poor sleep",
];

export default function AboutDay() {
  const [selected, setSelected] = useState<string[]>([]);
  const [unproductive, setUnproductive] = useState("");
  const [unfulfilling, setUnfulfilling] = useState("");
  const [intervalTracking, setIntervalTracking] = useState(false);

  const toggleChip = (c: string) => {
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  return (
    <View
      testID="ID:about_root_01"
      style={{ flex: 1, backgroundColor: Colors.light.background, padding: 24 }}
    >
      <ProgressBar testID="ID:about_progress_01" progress={2 / 3} />

      <Text
        testID="ID:about_stepTxt_01"
        style={{ marginTop: 16, color: Colors.light.icon }}
      >
        Step 2 of 3
      </Text>

      <Text
        testID="ID:about_titleTxt_01"
        style={{ marginTop: 10, fontSize: 34, fontWeight: "900", color: Colors.light.text }}
      >
        Tell Us About Your Day
      </Text>

      <Text
        testID="ID:about_subTxt_01"
        style={{ marginTop: 10, color: Colors.light.icon }}
      >
        Help us personalize your experience
      </Text>

      <View style={{ marginTop: 20 }}>
        <Text
          testID="ID:about_blockersLabel_01"
          style={{ fontWeight: "800", color: Colors.light.text, marginBottom: 10 }}
        >
          Common blockers (select all that apply)
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {chipData.map((c, idx) => {
            const isOn = selected.includes(c);
            return (
              <Pressable
                key={c}
                testID={`ID:about_chip_${idx + 1}`}
                onPress={() => toggleChip(c)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: isOn ? Colors.light.tint : Colors.light.icon,
                  backgroundColor: isOn
                    ? "#EEF2FF"
                    : Colors.light.background,
                }}
              >
                <Text style={{ fontWeight: "700", color: Colors.light.text }}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          testID="ID:about_unprodLabel_01"
          style={{ marginTop: 18, fontWeight: "800", color: Colors.light.text }}
        >
          What typically causes unproductivity?
        </Text>

        <TextInput
          testID="ID:about_unprodInput_01"
          value={unproductive}
          onChangeText={setUnproductive}
          placeholder="e.g., Social media, unclear priorities..."
          placeholderTextColor="#9CA3AF"
          style={{
            marginTop: 10,
            backgroundColor: Colors.light.background,
            borderRadius: 14,
            padding: 14,
            minHeight: 80,
            borderWidth: 1,
            borderColor: Colors.light.icon,
          }}
          multiline
        />

        <Text
          testID="ID:about_unfulLabel_01"
          style={{ marginTop: 18, fontWeight: "800", color: Colors.light.text }}
        >
          What feels unfulfilling?
        </Text>

        <TextInput
          testID="ID:about_unfulInput_01"
          value={unfulfilling}
          onChangeText={setUnfulfilling}
          placeholder="e.g., Repetitive tasks, lack of progress..."
          placeholderTextColor="#9CA3AF"
          style={{
            marginTop: 10,
            backgroundColor: Colors.light.background,
            borderRadius: 14,
            padding: 14,
            minHeight: 80,
            borderWidth: 1,
            borderColor: Colors.light.icon,
          }}
          multiline
        />

        <Pressable
          testID="ID:about_intervalRow_01"
          onPress={() => setIntervalTracking((v) => !v)}
          style={{
            marginTop: 18,
            backgroundColor: Colors.light.background,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.light.icon,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text
              testID="ID:about_intervalTitle_01"
              style={{ fontWeight: "900", color: Colors.light.text }}
            >
              Enable time-interval tracking
            </Text>
            <Text
              testID="ID:about_intervalSub_01"
              style={{ marginTop: 4, color: Colors.light.icon }}
            >
              Break your day into intervals for detailed insights
            </Text>
          </View>

          <View
            testID="ID:about_intervalToggle_01"
            style={{
              width: 46,
              height: 28,
              borderRadius: 999,
              backgroundColor: intervalTracking
                ? Colors.light.tint
                : Colors.light.icon,
              padding: 3,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                backgroundColor: "white",
                alignSelf: intervalTracking ? "flex-end" : "flex-start",
              }}
            />
          </View>
        </Pressable>
      </View>

      <View style={{ marginTop: "auto", paddingBottom: 10, flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <SecondaryButton
            testID="ID:about_backBtn_01"
            title="Back"
            onPress={() => router.back()}
          />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            testID="ID:about_continueBtn_01"
            title="Continue"
            onPress={() => router.push("/onboarding/permissions")}
          />
        </View>
      </View>
    </View>
  );
}
