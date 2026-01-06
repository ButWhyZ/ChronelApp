import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("chronel_loggedIn").then(value => {
      setIsAuthenticated(value === "true");
    });
  }, []);

  return { isAuthenticated };
}
