import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App'; 


jest.mock('expo-secure-store');
jest.mock('expo-notifications');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('App - Ponto de Entrada Principal (Snapshot)', () => {

  it('deve renderizar o estado inicial do aplicativo corretamente', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });

});