import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  carregarAjustes, salvarAjustes, DEFAULT_SETTINGS, FONT_SIZES, SETTINGS_KEY,
} from '../src/services/settingsService';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

beforeEach(() => AsyncStorage.clear());

test('padrões quando não há nada salvo', async () => {
  expect(DEFAULT_SETTINGS).toEqual({ tema: 'sistema', fontSize: 20, fonte: 'serif', manterTelaLigada: true });
  expect(FONT_SIZES).toEqual([16, 18, 20, 22, 24, 27, 30]);
  expect(await carregarAjustes()).toEqual(DEFAULT_SETTINGS);
});

test('salva e carrega', async () => {
  await salvarAjustes({ ...DEFAULT_SETTINGS, tema: 'escuro', fontSize: 24 });
  expect(await carregarAjustes()).toEqual({ ...DEFAULT_SETTINGS, tema: 'escuro', fontSize: 24 });
});

test('valores inválidos voltam ao padrão', async () => {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ tema: 'roxo', fontSize: 19, fonte: 'sans', manterTelaLigada: 'sim' }));
  expect(await carregarAjustes()).toEqual({ ...DEFAULT_SETTINGS, fonte: 'sans' });
});

test('JSON corrompido usa o padrão', async () => {
  await AsyncStorage.setItem(SETTINGS_KEY, '{x');
  expect(await carregarAjustes()).toEqual(DEFAULT_SETTINGS);
});
