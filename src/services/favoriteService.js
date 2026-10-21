import AsyncStorage from '@react-native-async-storage/async-storage';

export const FAVORITES_KEY = '@harpa_favorites';
const RECENT_KEY = '@harpa_recent';

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