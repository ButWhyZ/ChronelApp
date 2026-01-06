import { Redirect } from "expo-router";

export default function Index() {
  // Choose where your app should land on web root:
  return <Redirect href="/(tabs)" />;
  // or: return <Redirect href="/welcome" />;
}
