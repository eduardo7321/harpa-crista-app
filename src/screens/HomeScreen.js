import React, { useState, useEffect, useCallback } from 'react';
import { 
  SafeAreaView, FlatList, Text, TextInput, 
  TouchableOpacity, StyleSheet, View 
} from 'react-native';
import { getAllHinos, searchHinos } from '../services/hinoService';
import { loadFavorites, addFavorite, removeFavorite } from '../services/favoriteService';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hinos, setHinos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  // Carrega hinos e favoritos ao iniciar
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const todosHinos = getAllHinos();
    setHinos(todosHinos);
    const favs = await loadFavorites();
    setFavoritos(favs);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const results = searchHinos(text);
    setHinos(results);
  };

  const toggleFavorite = async (hinoId) => {
    if (favoritos.includes(hinoId)) {
      await removeFavorite(hinoId);
      setFavoritos(favoritos.filter(id => id !== hinoId));
    } else {
      await addFavorite(hinoId);
      setFavoritos([...favoritos, hinoId]);
    }
  };

  const renderItem = ({ item }) => {
    const isFav = favoritos.includes(item.id);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('HinoDetail', { hino: item })}
      >
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>            
            <Text style={styles.titulo}>{item.numero} - {item.titulo}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
            <Text style={[styles.heart, isFav && styles.heartActive]}>
              {isFav ? '❤️' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Harpa Cristã</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Favoritos')}>
          <Text style={styles.favLink}>⭐ Favoritos</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por número ou título..."
        value={searchQuery}
        onChangeText={handleSearch}
        clearButtonMode="while-editing"
      />
      
      <FlatList
        data={hinos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum hino encontrado</Text>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  favLink: {
    fontSize: 18,
    color: '#4a90e2',
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  textContainer: {
    flex: 1,
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
  heart: {
    fontSize: 28,
    color: '#999',
    marginLeft: 12,
  },
  heartActive: {
    color: '#e74c3c',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});

export default HomeScreen;