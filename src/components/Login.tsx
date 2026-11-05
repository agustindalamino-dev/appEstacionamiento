import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert("Faltan datos", "Ingresa tu correo y contraseña.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert("Correo inválido", "Revisa el correo e inténtalo nuevamente.");
      return;
    }

    if (isRegistering && password.length < 6) {
      Alert.alert(
        "Contraseña muy corta",
        "La contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      Alert.alert("Las contraseñas no coinciden", "Vuelve a escribirlas.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegistering) {
        await onRegister(normalizedEmail, password);
      } else {
        await onLogin(normalizedEmail, password);
      }
    } catch (error) {
      Alert.alert(
        isRegistering ? "No se pudo crear la cuenta" : "No se pudo iniciar sesión",
        error instanceof Error ? error.message : "Inténtalo nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {isRegistering ? "Crear cuenta" : "Iniciar sesión"}
        </Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          accessibilityLabel="Correo electrónico"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          secureTextEntry
          autoComplete="password"
          accessibilityLabel="Contraseña"
        />
        {isRegistering && (
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repetir contraseña"
            secureTextEntry
            autoComplete="new-password"
            accessibilityLabel="Repetir contraseña"
          />
        )}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            (pressed || isSubmitting) && styles.buttonPressed,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {isSubmitting
              ? isRegistering
                ? "Creando cuenta..."
                : "Ingresando..."
              : isRegistering
                ? "Crear cuenta"
                : "Ingresar"}
          </Text>
        </Pressable>
        <Pressable
          style={styles.switchButton}
          onPress={() => {
            setIsRegistering(!isRegistering);
            setPassword("");
            setConfirmPassword("");
          }}
          disabled={isSubmitting}
          accessibilityRole="button"
        >
          <Text style={styles.switchText}>
            {isRegistering
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Crear una"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f5f7fa",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 16,
    padding: 24,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  title: {
    marginBottom: 4,
    color: "#1a202c",
    fontSize: 24,
    fontWeight: "700",
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#cbd5e0",
    borderRadius: 8,
    color: "#1a202c",
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2b6cb0",
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  switchText: {
    color: "#2b6cb0",
    fontSize: 15,
    fontWeight: "600",
  },
});
