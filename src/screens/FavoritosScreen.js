import React, { useState, useEffect, useCallback } from 'react';
import { 
  SafeAreaView, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  View,
  Platform 
} from 'react-native';
import { getAllHinos } from '../services/hinoService';
import { loadFavorites, removeFavorite } from '../services/favoriteService';

const FavoritosScreen = ({ navigation }) => {
  const [hinosFavoritos, setHinosFavoritos] = useState([]);

  const carregarFavoritos = useCallback(async () => {
    const todosHinos = getAllHinos();
    const favIds = await loadFavorites();
    const favoritosEncontrados = todosHinos.filter(hino => favIds.includes(hino.id));
    setHinosFavoritos(favoritosEncontrados);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarFavoritos();
    });
    return unsubscribe;
  }, [navigation, carregarFavoritos]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('HinoDetail', { hino: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.numberContainer}>
          <Text style={styles.numero}>{item.numero}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.subtitle}>Harpa Cristã</Text>
        </View>
        <TouchableOpacity 
          onPress={async () => {
            await removeFavorite(item.id);
            carregarFavoritos();
          }} 
          style={styles.removeButton}
        >
          {/* <Text style={styles.removeText}>🗑️</Text> */}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeTop} />
      {/* Header estilizado */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>⭐ Meus Favoritos</Text>
          <Text style={styles.headerSubtitle}>
            {hinosFavoritos.length} hino{hinosFavoritos.length !== 1 ? 's' : ''} salvos
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      
      {/* Lista de favoritos */}
      <FlatList
        data={hinosFavoritos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💔</Text>
            <Text style={styles.emptyText}>
              Você ainda não tem hinos favoritos.
            </Text>
            <Text style={styles.emptySubtext}>
              Toque no ♡ ao lado do hino para adicionar!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeTop: {
    height: Platform.OS === 'ios' ? 40 : 30, // Ajuste para camera
    backgroundColor: '#F8F5F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F5F0', // Papel envelhecido
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C1810', // Marrom escuro
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DCC8',
  },
  backButton: {
    padding: 8,
    width: 70,
  },
  backButtonText: {
    fontSize: 16,
    color: '#F8F5F0',
    fontWeight: '500',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8F5F0',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#F8F5F0',
    opacity: 0.8,
  },
  placeholder: {
    width: 70,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFF',
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  numberContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numero: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B7355',
  },
  textContainer: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C1810',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#A0522D',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  removeText: {
    fontSize: 20,
    opacity: 0.6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#A0522D',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});

export default FavoritosScreen;