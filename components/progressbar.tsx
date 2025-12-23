import { View } from "react-native";
import { Colors } from "../constants/theme";

export function ProgressBar(props: { progress: number; testID: string }) {
  return (
    <View
      testID={props.testID}
      style={{
        height: 6,
        backgroundColor: Colors.light.icon,
        borderRadius: 999,
      }}
    >
      <View
        style={{
          width: `${Math.min(100, Math.max(0, props.progress * 100))}%`,
          height: 6,
          backgroundColor: Colors.light.tint,
          borderRadius: 999,
        }}
      />
    </View>
  );
}
