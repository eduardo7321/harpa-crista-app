import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@HarpaApp:favoritos';

// Carrega os favoritos salvos
export const loadFavorites = async () => {
  try {
    const saved = await AsyncStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
    return [];
  }
};

// Salva a lista de favoritos
export const saveFavorites = async (favoritos) => {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritos));
  } catch (error) {
    console.error('Erro ao salvar favoritos:', error);
  }
};

// Adiciona um hino aos favoritos
export const addFavorite = async (hinoId) => {
  const atual = await loadFavorites();
  if (!atual.includes(hinoId)) {
    const novo = [...atual, hinoId];
    await saveFavorites(novo);
  }
};

// Remove um hino dos favoritos
export const removeFavorite = async (hinoId) => {
  const atual = await loadFavorites();
  const novo = atual.filter(id => id !== hinoId);
  await saveFavorites(novo);
};

// Verifica se um hino é favorito
export const isFavorite = async (hinoId) => {
  const favoritos = await loadFavorites();
  return favoritos.includes(hinoId);
};