import { Redirect } from "expo-router";
import { LoadingScreen } from "../components/LoadingScreen";
import { Login } from "../components/Login";
import { useApp } from "../context/AppContext";

export default function LoginScreen() {
  const { user, isLoading, login, register } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Redirect href="/parking" />;
  }

  return <Login onLogin={login} onRegister={register} />;
}
