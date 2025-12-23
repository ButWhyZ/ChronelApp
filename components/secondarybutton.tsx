import { Pressable, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/theme";

export function SecondaryButton(props: {
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
    backgroundColor: Colors.light.background,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.icon,
  },
  txt: {
    color: Colors.light.text,
    fontWeight: "700",
    fontSize: 16,
  },
});
