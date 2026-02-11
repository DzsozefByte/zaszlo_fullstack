import React, { useState } from "react";
import { View, TextInput, Image, Button, Text, StyleSheet } from "react-native";
import { useAuth } from "../../auth/AuthProvider";
import { Background } from "@react-navigation/elements";

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function User() {
  const { login, logout, user } = useAuth();
  const [email, setEmail] = useState("admin@admin.hu");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      {!user ? (
        <>
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
          <Button title="Login" onPress={() => login(email, password)} />
        </>
      ) : (
        <>
          <Text style={styles.text}>{user?.name} sikeresen belépett</Text>
          <Image
            source={{ uri: `${backendUrl}/images/${user.imagename}` }}
            style={styles.image}
          />
          
          <Button title="Logout" onPress={logout} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: { borderWidth: 1, color: "white", borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
  text: { color: "white" },
  image: {
    height: 200,
    resizeMode: 'contain',
    marginVertical: 40,
  },
});
