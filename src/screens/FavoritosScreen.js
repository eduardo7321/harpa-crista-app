import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, FlatList, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
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
    >
      <Text style={styles.numero}>{item.numero}</Text>
      <Text style={styles.titulo}>{item.titulo}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>⭐ Meus Favoritos</Text>
      <FlatList
        data={hinosFavoritos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Você ainda não tem hinos favoritos.{'\n'}
            Toque no ♡ ao lado do hino para adicionar!
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  numero: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
  },
});

export default FavoritosScreen;