import { View, Text } from "react-native";
import { Colors } from "../constants/theme";

export function InfoCard(props: {
  title: string;
  body: string;
  testIDRoot: string;
  testIDTitle: string;
  testIDBody: string;
}) {
  return (
    <View
      testID={props.testIDRoot}
      style={{
        backgroundColor: Colors.light.background,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.light.icon,
      }}
    >
      <Text
        testID={props.testIDTitle}
        style={{
          fontWeight: "800",
          color: Colors.light.text,
          marginBottom: 6,
        }}
      >
        {props.title}
      </Text>

      <Text
        testID={props.testIDBody}
        style={{
          color: Colors.light.icon,
          lineHeight: 20,
        }}
      >
        {props.body}
      </Text>
    </View>
  );
}
