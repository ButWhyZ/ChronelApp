import { Pressable, Text, View } from "react-native";
import { Colors } from "../constants/theme";

export function OAuthButton(props: {
  label: string;
  icon: string; // emoji placeholder; swap for icons later
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      testID={props.testID}
      onPress={props.onPress}
      style={{
        borderWidth: 1,
        borderColor: Colors.light.icon,
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: Colors.light.background,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 18 }}>{props.icon}</Text>
        <Text style={{ fontWeight: "700", color: Colors.light.text }}>
          {props.label}
        </Text>
      </View>
    </Pressable>
  );
}
