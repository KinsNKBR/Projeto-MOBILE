import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import crypto from 'crypto-js';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

      // Buscar as informações de login
      const storedEmail = await SecureStore.getItemAsync('user_email');
      const storedHash = await SecureStore.getItemAsync('user_password');

      // Criptografar senha
      const hashedPassword = encryptData(password);

      if (email === storedEmail && hashedPassword === storedHash) {
        navigation.navigate('Dashboard');
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

// Tela de login
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

// Tela Principal
function HomeTabScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Bem-vindo à Home!</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Usuário</Text>
    </View>
  );
}

function ProdutosScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Lista de Produtos</Text>
    </View>
  );
}

// Tela principal | Abas
const DashboardTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Usuário') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Produtos') {
            iconName = focused ? 'cart' : 'cart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeTabScreen} />
      <Tab.Screen name="Produtos" component={ProdutosScreen} />
      <Tab.Screen name="Usuário" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
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
    backgroundColor: '#7a0dff',
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
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
          name="Dashboard" 
          component={DashboardTabs} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
