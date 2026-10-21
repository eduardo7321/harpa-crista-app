import AsyncStorage from '@react-native-async-storage/async-storage';

export const SETTINGS_KEY = '@harpa_settings';
export const FONT_SIZES = [16, 18, 20, 22, 24, 27, 30];
export const DEFAULT_SETTINGS = {
  tema: 'sistema',
  fontSize: 20,
  fonte: 'serif',
  manterTelaLigada: true,
};

const VALIDOS = {
  tema: valor => ['sistema', 'claro', 'escuro'].includes(valor),
  fontSize: valor => FONT_SIZES.includes(valor),
  fonte: valor => ['serif', 'sans'].includes(valor),
  manterTelaLigada: valor => typeof valor === 'boolean',
};

export const carregarAjustes = async () => {
  let salvos = {};
  try {
    salvos = JSON.parse(await AsyncStorage.getItem(SETTINGS_KEY)) || {};
  } catch (error) {
    salvos = {};
  }
  const ajustes = { ...DEFAULT_SETTINGS };
  for (const chave of Object.keys(VALIDOS)) {
    if (VALIDOS[chave](salvos[chave])) ajustes[chave] = salvos[chave];
  }
  return ajustes;
};

export const salvarAjustes = async (ajustes) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(ajustes));
  } catch (error) {
    console.error('Erro ao salvar ajustes:', error);
  }
};
