import { View, Text, SafeAreaView } from "react-native";

export default function Dashboard() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0B0F" }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "600",
            color: "#F3F4F6",
          }}
        >
          Dashboard
        </Text>
      </View>
    </SafeAreaView>
  );
}
