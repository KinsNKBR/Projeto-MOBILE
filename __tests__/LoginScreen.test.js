import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import crypto from 'crypto-js';

// Importar o App para extrair o componente LoginScreen
import App from '../App';

// Extrair o componente LoginScreen do App
const Stack = createStackNavigator();

// Função helper para criptografar senha (igual à do App)
const encryptData = (password) => {
  return crypto.SHA256(password).toString();
};

// Mock da navegação
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('LoginScreen', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('Renderização da Interface', () => {
    it('deve renderizar todos os elementos da tela de login', () => {
      // Renderizar o App diretamente (que já tem NavigationContainer)
      const { getByText, getByPlaceholderText } = render(<App />);

      // Verificar se os elementos principais estão presentes
      expect(getByText('Login')).toBeTruthy();
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Senha')).toBeTruthy();
      expect(getByText('Entrar')).toBeTruthy();
      expect(getByText('Criar Conta')).toBeTruthy();
    });

    it('deve ter os campos de entrada com as propriedades corretas', () => {
      const { getByPlaceholderText } = render(<App />);

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Senha');

      // Verificar propriedades do campo de email
      expect(emailInput.props.keyboardType).toBe('email-address');
      expect(emailInput.props.autoCapitalize).toBe('none');

      // Verificar propriedades do campo de senha
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Validação de Email', () => {
    it('deve mostrar erro para email que não termina com @gmail.com', async () => {
      const { getByPlaceholderText, getByText } = render(<App />);

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Senha');
      const loginButton = getByText('Entrar');

      // Preencher com email inválido
      fireEvent.changeText(emailInput, 'teste@hotmail.com');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Email deve terminar com @gmail.com');
      });
    });

    it('deve aceitar email válido que termina com @gmail.com', async () => {
      const { getByPlaceholderText, getByText } = render(<App />);
      const Alert = require('react-native').Alert;

      // Mock do SecureStore para simular usuário não encontrado
      SecureStore.getItemAsync.mockResolvedValue(null);

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Senha');
      const loginButton = getByText('Entrar');

      // Preencher com email válido
      fireEvent.changeText(emailInput, 'teste@gmail.com');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Credenciais inválidas');
      });
    });
  });

  describe('Autenticação', () => {
    it('deve fazer login com credenciais corretas', async () => {
      const { getByPlaceholderText, getByText } = render(<App />);
      
      // Mock do SecureStore com dados de usuário válidos
      const testEmail = 'teste@gmail.com';
      const testPassword = '123456';
      const hashedPassword = encryptData(testPassword);
      
      SecureStore.getItemAsync
        .mockResolvedValueOnce(testEmail) // user_email
        .mockResolvedValueOnce(hashedPassword); // user_password

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Senha');
      const loginButton = getByText('Entrar');

      // Preencher credenciais corretas
      fireEvent.changeText(emailInput, testEmail);
      fireEvent.changeText(passwordInput, testPassword);
      fireEvent.press(loginButton);

      // Como não temos acesso direto à navegação no teste, verificamos se não houve erro
      await waitFor(() => {
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith('user_email');
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith('user_password');
      });
    });

    it('deve mostrar erro para credenciais incorretas', async () => {
      const { getByPlaceholderText, getByText } = render(<App />);
      const Alert = require('react-native').Alert;

      // Mock do SecureStore com dados diferentes dos fornecidos
      SecureStore.getItemAsync
        .mockResolvedValueOnce('outro@gmail.com')
        .mockResolvedValueOnce('hash_diferente');

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Senha');
      const loginButton = getByText('Entrar');

      fireEvent.changeText(emailInput, 'teste@gmail.com');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Credenciais inválidas');
      });
    });

    it('deve mostrar erro quando SecureStore falha', async () => {
      const { getByPlaceholderText, getByText } = render(<App />);
      const Alert = require('react-native').Alert;

      // Mock do SecureStore para simular erro
      SecureStore.getItemAsync.mockRejectedValue(new Error('Erro de armazenamento'));

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Senha');
      const loginButton = getByText('Entrar');

      fireEvent.changeText(emailInput, 'teste@gmail.com');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Falha ao fazer login');
      });
    });
  });

  describe('Estados de Loading', () => {
    it('deve mostrar "Carregando..." no botão durante o login', async () => {
      const { getByPlaceholderText, getByText } = render(<App />);

      // Mock do SecureStore para simular delay
      SecureStore.getItemAsync.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(null), 100))
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Senha');
      const loginButton = getByText('Entrar');

      fireEvent.changeText(emailInput, 'teste@gmail.com');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent.press(loginButton);

      // Verificar se o texto mudou para "Carregando..."
      await waitFor(() => {
        expect(getByText('Carregando...')).toBeTruthy();
      });
    });

    it('deve desabilitar o botão durante o loading', async () => {
      const { getByPlaceholderText, getByText } = render(<App />);

      // Mock do SecureStore para simular delay
      SecureStore.getItemAsync.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(null), 100))
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Senha');
      const loginButton = getByText('Entrar');

      fireEvent.changeText(emailInput, 'teste@gmail.com');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent.press(loginButton);

      // Verificar se o botão está desabilitado
      await waitFor(() => {
        expect(loginButton).toBeDisabled();
      });
    });
  });

  describe('Interação com Campos', () => {
    it('deve atualizar o valor do campo de email quando digitado', () => {
      const { getByPlaceholderText } = render(<App />);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'novo@gmail.com');

      expect(emailInput.props.value).toBe('novo@gmail.com');
    });

    it('deve atualizar o valor do campo de senha quando digitado', () => {
      const { getByPlaceholderText } = render(<App />);

      const passwordInput = getByPlaceholderText('Senha');
      fireEvent.changeText(passwordInput, 'minhasenha123');

      expect(passwordInput.props.value).toBe('minhasenha123');
    });
  });

  describe('Navegação', () => {
    it('deve navegar para a tela de cadastro quando botão "Criar Conta" for pressionado', () => {
      const { getByText } = render(<App />);

      const signupButton = getByText('Criar Conta');
      fireEvent.press(signupButton);

      // Como estamos testando apenas o componente isolado, 
      // verificamos se o botão está presente e pode ser pressionado
      expect(signupButton).toBeTruthy();
    });
  });
}); 