import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Location, User } from "../types";
import { ParkingList } from "./ParkingList";

interface DashboardProps {
  user: User;
  onLogout: () => Promise<void>;
  onAddLocation: (location: Omit<Location, "id" | "name">) => Promise<void>;
  onEditLocation: (id: string, name: string) => Promise<void>;
  onDeleteLocation: (id: string) => Promise<void>;
}

export function Dashboard({
  user,
  onLogout,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
}: DashboardProps) {
  const handleLogout = async () => {
    try {
      await onLogout();
    } catch {
      Alert.alert("No se pudo cerrar sesión", "Inténtalo nuevamente.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {user.email}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleLogout}
          accessibilityRole="button"
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
      <ParkingList
        locations={user.parkedLocations}
        onAddLocation={onAddLocation}
        onEditLocation={onEditLocation}
        onDeleteLocation={onDeleteLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  greeting: {
    flex: 1,
    color: "#1a202c",
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#718096",
    borderRadius: 8,
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
