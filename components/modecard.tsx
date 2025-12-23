import { Pressable, Text } from "react-native";
import { Colors } from "../constants/theme";

export function ModeCard(props: {
  title: string;
  subtitle: string;
  meta: string;
  selected?: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      testID={props.testID}
      onPress={props.onPress}
      style={{
        borderWidth: 2,
        borderColor: props.selected ? Colors.light.tint : Colors.light.icon,
        borderRadius: 14,
        padding: 18,
        backgroundColor: Colors.light.background,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.light.text }}>
        {props.title}
      </Text>
      <Text style={{ marginTop: 6, color: Colors.light.icon, fontWeight: "600" }}>
        {props.subtitle}
      </Text>
      <Text style={{ marginTop: 10, color: Colors.light.tint, fontWeight: "800" }}>
        {props.meta}
      </Text>
      <Text style={{ marginTop: 10, color: Colors.light.icon }}>
        Change later in settings
      </Text>
    </Pressable>
  );
}
