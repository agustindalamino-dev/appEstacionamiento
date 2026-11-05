import { Redirect } from "expo-router";
import { LoadingScreen } from "../components/LoadingScreen";
import { useApp } from "../context/AppContext";

export default function IndexScreen() {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <Redirect href={user ? "/parking" : "/login"} />;
}
