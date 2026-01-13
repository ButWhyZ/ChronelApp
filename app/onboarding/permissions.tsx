import { View, Text } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/theme";
import { ProgressBar } from "../../components/progressbar";
import { PrimaryButton } from "../../components/primarybutton";
import { SecondaryButton } from "../../components/secondarybutton";

function PermissionCard(props: {
  title: string;
  subtitle: string;
  allowID: string;
  notNowID: string;
}) {
  return (
    <View
      style={{
        backgroundColor: Colors.light.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.light.icon,
        padding: 18,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "900", color: Colors.light.text }}>
        {props.title}
      </Text>
      <Text style={{ marginTop: 6, color: Colors.light.icon }}>
        {props.subtitle}
      </Text>

      <View style={{ marginTop: 16, flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 2 }}>
          <PrimaryButton testID={props.allowID} title="Allow" onPress={() => {}} />
        </View>
        <View style={{ flex: 1 }}>
          <SecondaryButton testID={props.notNowID} title="Not Now" onPress={() => {}} />
        </View>
      </View>
    </View>
  );
}

export default function Permissions() {
  return (
    <View
      testID="ID:perms_root_01"
      style={{ flex: 1, backgroundColor: Colors.light.background, padding: 24 }}
    >
      <ProgressBar testID="ID:perms_progress_01" progress={1} />

      <Text
        testID="ID:perms_stepTxt_01"
        style={{ marginTop: 16, color: Colors.light.icon }}
      >
        Step 3 of 3
      </Text>

      <Text
        testID="ID:perms_titleTxt_01"
        style={{ marginTop: 10, fontSize: 34, fontWeight: "900", color: Colors.light.text }}
      >
        Grant Permissions
      </Text>

      <Text
        testID="ID:perms_subTxt_01"
        style={{ marginTop: 10, color: Colors.light.icon }}
      >
        Optional features to enhance your experience
      </Text>

      <View style={{ marginTop: 18, gap: 14 }}>
        <PermissionCard
          title="Notifications"
          subtitle="Get reminders for check-ins and insights"
          allowID="ID:perms_notifAllowBtn_01"
          notNowID="ID:perms_notifNotNowBtn_01"
        />
        <PermissionCard
          title="Calendar Sync"
          subtitle="Add tasks to your device calendar"
          allowID="ID:perms_calendarAllowBtn_01"
          notNowID="ID:perms_calendarNotNowBtn_01"
        />
        <PermissionCard
          title="Screen Time"
          subtitle="Correlate usage with your well-being"
          allowID="ID:perms_screenAllowBtn_01"
          notNowID="ID:perms_screenNotNowBtn_01"
        />
      </View>

      <View style={{ marginTop: "auto", paddingBottom: 10, flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <SecondaryButton
            testID="ID:perms_backBtn_01"
            title="Back"
            onPress={() => router.back()}
          />
        </View>
        <View style={{ flex: 2 }}>
          <PrimaryButton
            testID="ID:perms_getStartedBtn_01"
            title="Get Started"
            onPress={() => {
              router.replace("/dashboard"); // placeholder
            }}
          />
        </View>
      </View>
    </View>
  );
}
