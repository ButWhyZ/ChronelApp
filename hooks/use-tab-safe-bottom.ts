import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useTabSafeBottom(extra: number = 16) {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  return tabBarHeight + insets.bottom + extra;
}
