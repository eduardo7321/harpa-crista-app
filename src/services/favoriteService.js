import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@harpa_favorites';
const RECENT_KEY = '@harpa_recent';

export const loadFavorites = async () => {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
    return [];
  }
};

export const addFavorite = async (hinoId) => {
  try {
    const favorites = await loadFavorites();
    if (!favorites.includes(hinoId)) {
      const newFavorites = [...favorites, hinoId];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    }
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
  }
};

export const removeFavorite = async (hinoId) => {
  try {
    const favorites = await loadFavorites();
    const newFavorites = favorites.filter(id => id !== hinoId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
  }
};

export const getRecentHinos = async () => {
  try {
    const recents = await AsyncStorage.getItem(RECENT_KEY);
    return recents ? JSON.parse(recents) : [];
  } catch (error) {
    console.error('Erro ao carregar recentes:', error);
    return [];
  }
};

export const addToRecent = async (hinoId) => {
  try {
    let recents = await getRecentHinos();
    // Remove se já existir
    recents = recents.filter(id => id !== hinoId);
    // Adiciona no início
    recents = [hinoId, ...recents];
    // Mantém apenas os últimos 10
    recents = recents.slice(0, 10);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(recents));
  } catch (error) {
    console.error('Erro ao adicionar recente:', error);
  }
};