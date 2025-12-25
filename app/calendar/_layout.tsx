import React from "react";
import { Stack } from "expo-router";

export default function CalendarStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Default calendar index/day pages render normally */}
      <Stack.Screen name="index" />
      <Stack.Screen name="[date]" />

      {/* Add Task as a modal sheet */}
      <Stack.Screen
        name="add-task"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
