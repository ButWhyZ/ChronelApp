import { Pressable, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/theme";

export function PrimaryButton(props: {
  title: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable testID={props.testID} onPress={props.onPress} style={styles.btn}>
      <Text style={styles.txt}>{props.title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.light.tint,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  txt: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
