import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  Button,
  Vibration
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import crypto from 'crypto-js';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Configurar as notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
      if (!email.endsWith('@gmail.com')) {
        Alert.alert('Erro', 'Email deve terminar com @gmail.com');
        return;
      }

      const storedEmail = await SecureStore.getItemAsync('user_email');
      const storedHash = await SecureStore.getItemAsync('user_password');

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

// Tela de Cadastro
const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    try {
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

// Tela Home
function HomeTabScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Bem-vindo à Home!</Text>
    </View>
  );
}

// Tela de Produtos
function ProdutosScreen() {
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState('quantidade');
  const [modalVisible, setModalVisible] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [form, setForm] = useState({
    nome: '',
    quantidade: '',
    validade: '',
    saidas: '',
    preco: 0
  });

  useEffect(() => {
    setProdutos([
      { id: '1', nome: 'Arroz', quantidade: 0, validade: '06-01-2025', saidas: 50, preco: 5.5 },
      { id: '2', nome: 'Feijão', quantidade: 10, validade: '12-10-2024', saidas: 30, preco: 7.2 }
    ]);
  }, []);

  const enviarNotificacao = async (nomeProduto) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Novo Produto Adicionado!',
        body: `O produto ${nomeProduto} foi adicionado com sucesso.`,
        sound: true,
        vibrate: [0, 250, 250, 250],
      },
      trigger: null, // Envia imediatamente
    });
  };

  const abrirModalAdicionar = () => {
    setForm({ nome: '', quantidade: '', validade: '', saidas: '', preco: 0 });
    setProdutoEditando(null);
    setModalVisible(true);
  };

  const abrirModalEditar = (produto) => {
    setForm(produto);
    setProdutoEditando(produto);
    setModalVisible(true);
  };

  const salvarProduto = async () => {
    const novoProduto = {
      ...form,
      quantidade: parseInt(form.quantidade) || 0,
      saidas: parseInt(form.saidas) || 0,
      preco: parseFloat(form.preco) || 0
    };

    if (!novoProduto.nome || novoProduto.preco === 0) {
      Alert.alert('Erro', 'Preencha o nome e o preço.');
      return;
    }

    if (produtoEditando) {
      setProdutos(produtos.map(p => (p.id === produtoEditando.id ? novoProduto : p)));
    } else {
      setProdutos([...produtos, { ...novoProduto, id: Date.now().toString() }]);
      Vibration.vibrate(); // VIBRA AO ADICIONAR NOVO PRODUTO
      await enviarNotificacao(novoProduto.nome); // ENVIA NOTIFICAÇÃO
    }

    setModalVisible(false);
  };

  const excluirProduto = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o produto "${form.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setProdutos(produtos.filter(p => p.id !== produtoEditando.id));
            setModalVisible(false);
          }
        }
      ]
    );
  };

  const filtrarProdutos = () => {
    switch (filtro) {
      case 'quantidade':
        return [...produtos].sort((a, b) => a.quantidade - b.quantidade);
      case 'vencimento':
        return [...produtos].sort((a, b) => new Date(a.validade) - new Date(b.validade));
      case 'saida':
        return [...produtos].sort((a, b) => b.saidas - a.saidas);
      default:
        return produtos;
    }
  };

  return (
    <View style={stylesProdutos.container}>
      <Text style={stylesProdutos.title}>Relatórios Gerenciais</Text>

      <View style={stylesProdutos.buttons}>
        <Button title="Por Quantidade" onPress={() => setFiltro('quantidade')} />
        <Button title="Por Vencimento" onPress={() => setFiltro('vencimento')} />
        <Button title="Por Saída" onPress={() => setFiltro('saida')} />
        <Button title="Adicionar Produto" onPress={abrirModalAdicionar} color="green" />
      </View>

      <FlatList
        data={filtrarProdutos()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => abrirModalEditar(item)}>
            <View style={stylesProdutos.item}>
              <Text>Nome: {item.nome}</Text>
              <Text>Quantidade: {item.quantidade}</Text>
              <Text>Validade: {item.validade}</Text>
              <Text>Saídas: {item.saidas}</Text>
              <Text style={{ color: 'green' }}>
                Preço: R$ {Number(item.preco || 0).toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={stylesProdutos.modalContent}>
          <Text style={stylesProdutos.modalTitle}>
            {produtoEditando ? 'Editar Produto' : 'Adicionar Produto'}
          </Text>

          <TextInput
            style={stylesProdutos.input}
            placeholder="Nome"
            value={form.nome}
            onChangeText={(text) => setForm({ ...form, nome: text })}
          />
          <TextInput
            style={stylesProdutos.input}
            placeholder="Quantidade"
            keyboardType="numeric"
            value={form.quantidade.toString()}
            onChangeText={(text) => setForm({ ...form, quantidade: text })}
          />
          <TextInput
            style={stylesProdutos.input}
            placeholder="Validade (Dia-Mes-Ano)"
            value={form.validade}
            onChangeText={(text) => setForm({ ...form, validade: text })}
          />
          <TextInput
            style={stylesProdutos.input}
            placeholder="Saídas"
            keyboardType="numeric"
            value={form.saidas.toString()}
            onChangeText={(text) => setForm({ ...form, saidas: text })}
          />
          <TextInput
            style={stylesProdutos.input}
            placeholder="Preço"
            keyboardType="numeric"
            value={form.preco.toString()}
            onChangeText={(text) => setForm({ ...form, preco: text })}
          />

          <View style={stylesProdutos.modalButtons}>
            <Button title="Salvar" onPress={salvarProduto} />
            <Button title="Cancelar" color="gray" onPress={() => setModalVisible(false)} />
            {produtoEditando && (
              <Button title="Excluir" color="red" onPress={excluirProduto} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Tela de Usuário
function ProfileScreen() {
  const [email, setEmail] = useState('');
  const [showFullEmail, setShowFullEmail] = useState(false);

  useEffect(() => {
    const loadEmail = async () => {
      const storedEmail = await SecureStore.getItemAsync('user_email');
      setEmail(storedEmail || '');
    };
    loadEmail();
  }, []);

  const getUsername = () => {
    if (!email) return 'Usuário';
    return email.split('@')[0];
  };

  const getMaskedEmail = () => {
    if (!email) return '*****';
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 2) + '****' + username.slice(-2);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <View style={styles.profileScreen}>
      <Text style={styles.userTitle}>Informações do Usuário</Text>

      <View style={styles.userInfoContainer}>
        <Text style={styles.userLabel}>Usuário:</Text>
        <Text style={styles.userValue}>{getUsername()}</Text>
      </View>

      <View style={styles.userInfoContainer}>
        <Text style={styles.userLabel}>Email:</Text>
        <Text style={styles.userValue}>
          {showFullEmail ? email : getMaskedEmail()}
        </Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowFullEmail(!showFullEmail)}
        >
          <Text style={styles.toggleButtonText}>
            {showFullEmail ? 'Ocultar' : 'Mostrar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  profileScreen: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  userTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  userLabel: {
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
    width: 80,
  },
  userValue: {
    flex: 1,
    color: '#555',
  },
  toggleButton: {
    backgroundColor: '#7a0dff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

// Estilos específicos para a tela de produtos
const stylesProdutos = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  item: {
    padding: 10,
    backgroundColor: '#eee',
    marginBottom: 10,
    borderRadius: 5
  },
  modalContent: { flex: 1, justifyContent: 'center', padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5
  },
  modalButtons: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 20
  }
});

// Navegação por abas
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

// App principal
export default function App() {
  useEffect(() => {
    // Solicitar permissão para notificações quando o app inicia
    const configurarNotificacoes = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Você não receberá notificações.');
      }
    };
    configurarNotificacoes();
  }, []);

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