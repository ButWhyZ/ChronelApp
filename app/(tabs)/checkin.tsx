// app/(tabs)/checkin.tsx
import React, { useMemo, useState } from "react";
import {  View, Text,  TextInput, Pressable, StyleSheet,Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useAppTheme } from "@/hooks/use-app-theme";

type MetricKey = "mood" | "energy" | "stress" | "fulfillment";

export default function CheckIn() {
  const { colors } = useAppTheme();

  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [fulfillment, setFulfillment] = useState(3);

  const [notes, setNotes] = useState("");

  const charLimit = 500;

  const metricRows = useMemo(
    () =>
      [
        { key: "mood" as const, label: "Mood", icon: "😊", value: mood, set: setMood },
        { key: "energy" as const, label: "Energy", icon: "⚡", value: energy, set: setEnergy },
        { key: "stress" as const, label: "Stress", icon: "😰", value: stress, set: setStress },
        { key: "fulfillment" as const, label: "Fulfillment", icon: "✨", value: fulfillment, set: setFulfillment },
      ] as const,
    [mood, energy, stress, fulfillment]
  );

  const onSave = () => {
    // TODO: Persist to AsyncStorage / DB
    // For now just a placeholder
    console.log("Saved check-in:", { mood, energy, stress, fulfillment, notes });
  };

  const onAiSuggestions = () => {
    // TODO: Hook into AI suggestions flow later
    console.log("AI suggestions requested");
  };

  const styles = useMemo(
    () =>
      createStyles({
        bg: colors.bg,
        text: colors.text,
        subtext: colors.subtext,
        tint: colors.tint,
        surface: colors.card ?? "#F5F6F8",
        border: colors.border ?? "#E5E7EB",
      }),
    [colors]
  );

  return (
    <View testID="ID:checkin_root_01" style={styles.root}>
      <Text testID="ID:checkin_titleTxt_01" style={styles.title}>
        Daily Check-In
      </Text>
      <Text testID="ID:checkin_subTxt_01" style={styles.subtitle}>
        How are you feeling today?
      </Text>

      <View style={{ marginTop: 18, gap: 18 }}>
        {metricRows.map((m) => (
          <MetricRow
            key={m.key}
            testIDPrefix={`ID:checkin_${m.key}`}
            label={m.label}
            icon={m.icon}
            value={m.value}
            onChange={m.set}
            colors={{
              text: colors.text,
              subtext: colors.subtext,
              tint: colors.tint,
            }}
          />
        ))}
      </View>

      <View style={{ marginTop: 22 }}>
        <View style={styles.notesHeader}>
          <Text testID="ID:checkin_notesLabel_01" style={styles.notesLabel}>
            What happened today?
          </Text>
          <Text testID="ID:checkin_notesCount_01" style={styles.notesCount}>
            {notes.length}/{charLimit}
          </Text>
        </View>

        <TextInput
          testID="ID:checkin_notesInput_01"
          style={styles.textarea}
          value={notes}
          onChangeText={(t) => setNotes(t.slice(0, charLimit))}
          multiline
          placeholder="Brief notes about your day, challenges, or wins..."
          placeholderTextColor={colors.subtext}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.bottom}>
        <Pressable testID="ID:checkin_saveBtn_01" onPress={onSave} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnTxt}>Save Check-In</Text>
        </Pressable>

        <Pressable testID="ID:checkin_aiBtn_01" onPress={onAiSuggestions} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnTxt}>Get AI Suggestions (0/2 today)</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MetricRow(props: {
  testIDPrefix: string;
  label: string;
  icon: string;
  value: number;
  onChange: (v: number) => void;
  colors: { text: string; subtext: string; tint: string };
}) {
  const { testIDPrefix, label, icon, value, onChange, colors } = props;

  return (
    <View testID={`${testIDPrefix}_row_01`}>
      <View style={rowStyles.header}>
        <Text testID={`${testIDPrefix}_label_01`} style={[rowStyles.label, { color: colors.text }]}>
          {label}
        </Text>

        <View style={rowStyles.valueWrap}>
          <Text testID={`${testIDPrefix}_icon_01`} style={rowStyles.icon}>
            {icon}
          </Text>
          <Text
            testID={`${testIDPrefix}_value_01`}
            style={[rowStyles.value, { color: colors.tint }]}
          >
            {value}
          </Text>
        </View>
      </View>

      <Slider
        testID={`${testIDPrefix}_slider_01`}
        value={value}
        minimumValue={1}
        maximumValue={5}
        step={1}
        onValueChange={onChange}
        minimumTrackTintColor={colors.tint}
        maximumTrackTintColor={"#D1D5DB"}
        thumbTintColor={colors.tint}
        style={{ marginTop: 10 }}
      />

      <View style={rowStyles.range}>
        <Text testID={`${testIDPrefix}_low_01`} style={[rowStyles.rangeTxt, { color: colors.subtext }]}>
          Low
        </Text>
        <Text testID={`${testIDPrefix}_high_01`} style={[rowStyles.rangeTxt, { color: colors.subtext }]}>
          High
        </Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
  },
  valueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  value: {
    fontSize: 18,
    fontWeight: "800",
  },
  range: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rangeTxt: {
    fontSize: 12,
    fontWeight: "600",
  },
});

function createStyles(p: {
  bg: string;
  text: string;
  subtext: string;
  tint: string;
  surface: string;
  border: string;
}) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: p.bg,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 18,
    },
    title: {
      fontSize: 28,
      fontWeight: "900",
      color: p.text,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 16,
      fontWeight: "600",
      color: p.subtext,
    },
    notesHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
    },
    notesLabel: {
      fontSize: 18,
      fontWeight: "900",
      color: p.text,
    },
    notesCount: {
      fontSize: 12,
      fontWeight: "700",
      color: p.subtext,
    },
    textarea: {
      marginTop: 10,
      backgroundColor: p.surface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: p.border,
      minHeight: 140,
      color: p.text,
      fontSize: 14,
      lineHeight: 20,
    },
    bottom: {
      marginTop: "auto",
      gap: 10,
      paddingTop: 16,
      paddingBottom: Platform.OS === "ios" ? 8 : 0,
    },
    primaryBtn: {
      backgroundColor: p.tint,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtnTxt: {
      color: "white",
      fontSize: 16,
      fontWeight: "800",
    },
    secondaryBtn: {
      backgroundColor: "transparent",
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: p.border,
    },
    secondaryBtnTxt: {
      color: p.text,
      fontSize: 16,
      fontWeight: "800",
    },
  });
}
