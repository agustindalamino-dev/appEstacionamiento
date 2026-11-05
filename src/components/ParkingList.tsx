import { useState } from "react";
import * as LocationService from "expo-location";
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Location } from "../types";

interface ParkingListProps {
  locations: Location[];
  onAddLocation: (location: Omit<Location, "id" | "name">) => Promise<void>;
  onEditLocation: (id: string, name: string) => Promise<void>;
  onDeleteLocation: (id: string) => Promise<void>;
}

export function ParkingList({
  locations,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
}: ParkingListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  const handleAddLocation = async () => {
    setIsLoading(true);
    try {
      const permission =
        await LocationService.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permiso necesario",
          "Permite el acceso a la ubicación para guardar dónde estacionaste.",
        );
        return;
      }

      const position = await LocationService.getCurrentPositionAsync({});
      await onAddLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        savedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch {
      Alert.alert(
        "No se pudo guardar la ubicación",
        "Comprueba que la ubicación del teléfono esté activada e inténtalo nuevamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMap = async (location: Location) => {
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("No se pudo abrir el mapa", "Inténtalo nuevamente.");
    }
  };

  const handleSaveName = async (id: string) => {
    const name = editedName.trim();
    if (!name) {
      Alert.alert("Falta el nombre", "Escribe un nombre para esta ubicación.");
      return;
    }

    try {
      await onEditLocation(id, name);
      setEditingId(null);
    } catch {
      Alert.alert("No se pudo editar", "Inténtalo nuevamente.");
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await onDeleteLocation(id);
    } catch {
      Alert.alert("No se pudo eliminar", "Inténtalo nuevamente.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis estacionamientos</Text>
      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          (pressed || isLoading) && styles.buttonPressed,
        ]}
        onPress={handleAddLocation}
        disabled={isLoading}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Obteniendo ubicación..." : "Guardar ubicación actual"}
        </Text>
      </Pressable>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Todavía no guardaste ningún estacionamiento.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {editingId === item.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Nombre del estacionamiento"
                  accessibilityLabel="Nombre del estacionamiento"
                  autoFocus
                />
                <View style={styles.actions}>
                  <Pressable
                    style={styles.smallButton}
                    onPress={() => void handleSaveName(item.id)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.buttonText}>Guardar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.smallButton, styles.cancelButton]}
                    onPress={() => setEditingId(null)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.locationName}>{item.name}</Text>
                <Text style={styles.body}>Latitud: {item.lat.toFixed(5)}</Text>
                <Text style={styles.body}>Longitud: {item.lng.toFixed(5)}</Text>
                <Text style={styles.muted}>Guardado a las {item.savedAt}</Text>
                <View style={styles.actions}>
                  <Pressable
                    style={styles.smallButton}
                    onPress={() => void handleOpenMap(item)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.buttonText}>Ver en mapa</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.smallButton, styles.editButton]}
                    onPress={() => {
                      setEditedName(item.name);
                      setEditingId(item.id);
                    }}
                    accessibilityRole="button"
                  >
                    <Text style={styles.buttonText}>Editar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.smallButton, styles.deleteButton]}
                    onPress={() => void handleDeleteLocation(item.id)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.buttonText}>Eliminar</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
    color: "#1a202c",
    fontSize: 20,
    fontWeight: "700",
  },
  addButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#2b6cb0",
    borderRadius: 8,
  },
  list: {
    flexGrow: 1,
    gap: 12,
    paddingTop: 16,
    paddingBottom: 24,
  },
  emptyText: {
    paddingVertical: 24,
    color: "#718096",
    fontSize: 16,
    textAlign: "center",
  },
  card: {
    gap: 10,
    padding: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
  },
  locationName: {
    color: "#1a202c",
    fontSize: 18,
    fontWeight: "700",
  },
  body: {
    color: "#2d3748",
    fontSize: 15,
  },
  muted: {
    color: "#718096",
    fontSize: 14,
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#cbd5e0",
    borderRadius: 8,
    color: "#1a202c",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  smallButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: "#2b6cb0",
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: "#718096",
  },
  cancelButton: {
    backgroundColor: "#718096",
  },
  deleteButton: {
    backgroundColor: "#e53e3e",
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
