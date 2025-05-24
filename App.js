import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import crypto from 'crypto-js';

const Stack = createStackNavigator();

// Função para criptografar dados
const encryptData = (password) => {
  return crypto.SHA256(password).toString();
};

// Tela de Login
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    
    try {
      // Validar email com o final "@gmail.com"
      if (!email.endsWith('@gmail.com')) {
        Alert.alert('Erro', 'Email deve terminar com @gmail.com');
        return;
      }

      // Buscar credenciais salvas
      const storedEmail = await SecureStore.getItemAsync('user_email');
      const storedHash = await SecureStore.getItemAsync('user_password');

      // Criptografar senha digitada
      const hashedPassword = encryptData(password);

      if (email === storedEmail && hashedPassword === storedHash) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Erro', 'Credenciais inválidas');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Carregando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Signup')}
      >
        <Text style={styles.secondaryButtonText}>Criar Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

// Tela de Cadastro
const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    try {
      // Validar email com o final "@gmail.com"
      if (!email.endsWith('@gmail.com')) {
        Alert.alert('Erro', 'Email deve terminar com @gmail.com');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Erro', 'Senhas não coincidem');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
        return;
      }

      // Criptografar e armazenar
      const hashedPassword = encryptData(password);
      
      await SecureStore.setItemAsync('user_email', email);
      await SecureStore.setItemAsync('user_password', hashedPassword);

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar conta');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignup}
      >
        <Text style={styles.buttonText}>Criar Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

// Tela inicial | Dashboard
const HomeScreen = () => (
  <View style={styles.homeContainer}>
    <Text style={styles.homeText}>Bem-vindo à tela principal!</Text>
  </View>
);

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007bff',
    fontSize: 14,
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  homeText: {
    fontSize: 20,
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen}
          options={{ title: 'Criar Conta' }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Início' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
