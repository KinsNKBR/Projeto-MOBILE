const RN = jest.requireActual('react-native');

// Garante que Alert.alert é sempre um mock do Jest
RN.Alert = RN.Alert || {};
RN.Alert.alert = jest.fn();
if (RN.NativeModules) {
  RN.NativeModules.DevMenu = {
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  };
}
RN.TurboModuleRegistry = {
  get: jest.fn(),
  getEnforcing: jest.fn(() => ({
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  })),
};

module.exports = RN; 