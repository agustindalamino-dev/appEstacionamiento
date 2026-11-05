import { Redirect } from "expo-router";
import { Dashboard } from "../components/Dashboard";
import { LoadingScreen } from "../components/LoadingScreen";
import { useApp } from "../context/AppContext";

export default function ParkingScreen() {
  const {
    user,
    isLoading,
    logout,
    addLocation,
    editLocation,
    deleteLocation,
  } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={logout}
      onAddLocation={addLocation}
      onEditLocation={editLocation}
      onDeleteLocation={deleteLocation}
    />
  );
}
