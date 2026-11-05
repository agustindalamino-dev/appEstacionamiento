import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import type { Location, User } from "../types";

const USER_KEY = "app_user";
const ACCOUNTS_KEY = "app_accounts";
const getParkingKey = (email: string) => `parking_${email}`;
const getPasswordKey = (id: string) => `password_${id}`;

interface RegisteredAccount {
  id: string;
  email: string;
}

interface SavedLocation extends Omit<Location, "id" | "name"> {
  id?: string;
  name?: string;
}

interface AppContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addLocation: (location: Omit<Location, "id" | "name">) => Promise<void>;
  editLocation: (id: string, name: string) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

async function getPassword(id: string) {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(getPasswordKey(id));
  }

  return SecureStore.getItemAsync(getPasswordKey(id));
}

async function savePassword(id: string, password: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(getPasswordKey(id), password);
    return;
  }

  await SecureStore.setItemAsync(getPasswordKey(id), password);
}

async function removePassword(id: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(getPasswordKey(id));
    return;
  }

  await SecureStore.deleteItemAsync(getPasswordKey(id));
}

function readLocations(
  savedLocations: string | null,
  oldLocations: SavedLocation[] = [],
  oldLocation?: SavedLocation | null,
): Location[] {
  const legacyLocations = oldLocations.length
    ? oldLocations
    : oldLocation
      ? [oldLocation]
      : [];
  let locations = legacyLocations;

  if (savedLocations) {
    const saved = JSON.parse(savedLocations) as SavedLocation[] | SavedLocation;
    locations = Array.isArray(saved) ? saved : [saved];
  }

  return locations.map((location, index) => ({
    ...location,
    id: location.id ?? `parking_${index + 1}`,
    name: location.name ?? "Mi estacionamiento",
  }));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const savedUser = await AsyncStorage.getItem(USER_KEY);
        const savedAccounts = await AsyncStorage.getItem(ACCOUNTS_KEY);

        if (savedUser && savedAccounts) {
          const currentUser = JSON.parse(savedUser) as User & {
            parkedLocation?: SavedLocation | null;
            parkedLocations?: SavedLocation[];
          };
          const accounts = JSON.parse(savedAccounts) as RegisteredAccount[];
          const accountExists = accounts.some(
            (account) =>
              account.id === currentUser.id &&
              account.email === currentUser.email,
          );

          if (accountExists) {
            const storedLocations = await AsyncStorage.getItem(
              getParkingKey(currentUser.email),
            );
            const loadedUser: User = {
              id: currentUser.id,
              email: currentUser.email,
              parkedLocations: readLocations(
                storedLocations,
                currentUser.parkedLocations,
                currentUser.parkedLocation,
              ),
            };
            await AsyncStorage.setItem(
              getParkingKey(loadedUser.email),
              JSON.stringify(loadedUser.parkedLocations),
            );
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(loadedUser));
            setUser(loadedUser);
          } else {
            await AsyncStorage.removeItem(USER_KEY);
          }
        }
      } catch {
        Alert.alert(
          "No se pudieron cargar los datos",
          "Cierra y vuelve a abrir la app para intentarlo nuevamente.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const savedAccounts = await AsyncStorage.getItem(ACCOUNTS_KEY);
    const accounts = savedAccounts
      ? (JSON.parse(savedAccounts) as RegisteredAccount[])
      : [];
    const account = accounts.find((savedAccount) => savedAccount.email === email);

    if (!account) {
      throw new Error("No existe una cuenta con ese correo.");
    }

    const savedPassword = await getPassword(account.id);
    if (savedPassword !== password) {
      throw new Error("El correo o la contraseña son incorrectos.");
    }

    const storedLocations = await AsyncStorage.getItem(getParkingKey(email));
    const newUser: User = {
      ...account,
      parkedLocations: readLocations(storedLocations),
    };

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const register = async (email: string, password: string) => {
    const savedAccounts = await AsyncStorage.getItem(ACCOUNTS_KEY);
    const accounts = savedAccounts
      ? (JSON.parse(savedAccounts) as RegisteredAccount[])
      : [];

    if (accounts.some((account) => account.email === email)) {
      throw new Error("Ya existe una cuenta con ese correo.");
    }

    const account: RegisteredAccount = {
      id: `usr_${Date.now()}`,
      email,
    };
    await savePassword(account.id, password);

    try {
      await AsyncStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify([...accounts, account]),
      );
    } catch (error) {
      await removePassword(account.id);
      throw error;
    }

    const newUser: User = { ...account, parkedLocations: [] };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const saveLocations = async (locations: Location[]) => {
    if (!user) {
      return;
    }

    const updatedUser = { ...user, parkedLocations: locations };
    await AsyncStorage.setItem(
      getParkingKey(user.email),
      JSON.stringify(locations),
    );
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const addLocation = async (location: Omit<Location, "id" | "name">) => {
    if (!user) {
      return;
    }

    const newLocation: Location = {
      ...location,
      id: `parking_${Date.now()}`,
      name: `Estacionamiento ${user.parkedLocations.length + 1}`,
    };
    await saveLocations([...user.parkedLocations, newLocation]);
  };

  const editLocation = async (id: string, name: string) => {
    if (!user) {
      return;
    }

    const locations = user.parkedLocations.map((location) =>
      location.id === id ? { ...location, name } : location,
    );
    await saveLocations(locations);
  };

  const deleteLocation = async (id: string) => {
    if (!user) {
      return;
    }

    const locations = user.parkedLocations.filter(
      (location) => location.id !== id,
    );
    await saveLocations(locations);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        addLocation,
        editLocation,
        deleteLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe usarse dentro de AppProvider.");
  }

  return context;
}
