import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  Platform 
} from 'react-native';
import { getAllHinos, searchHinos } from '../services/hinoService';
import { loadFavorites, addFavorite, removeFavorite } from '../services/favoriteService';

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hinos, setHinos] = useState([]);
  const [todosHinos, setTodosHinos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      console.log('Carregando hinos...');
      const todos = getAllHinos();
      console.log('Total de hinos carregados:', todos.length);
      
      // Verificar se o primeiro hino tem letra
      if (todos.length > 0) {
        console.log('Exemplo do primeiro hino:', {
          id: todos[0].id,
          numero: todos[0].numero,
          titulo: todos[0].titulo,
          temLetra: !!todos[0].letra,
          letraPreview: todos[0].letra?.substring(0, 50)
        });
      }
      
      setTodosHinos(todos);
      setHinos(todos);
      
      const favs = await loadFavorites();
      setFavoritos(favs);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setHinos(todosHinos);
    } else {
      const results = searchHinos(text);
      setHinos(results);
    }
  };

  const toggleFavorite = async (id) => {
    if (favoritos.includes(id)) {
      await removeFavorite(id);
      setFavoritos(favoritos.filter(f => f !== id));
    } else {
      await addFavorite(id);
      setFavoritos([...favoritos, id]);
    }
  };

  const ListHeader = () => {
    const favoritosHinos = todosHinos.filter(h => favoritos.includes(h.id)).slice(0, 6);
    
    if (favoritos.length === 0 || searchQuery) return null;
    
    return (
      <View style={styles.favSection}>
        <View style={styles.favHeader}>
          <Text style={styles.favTitle}>❤️ Seus Favoritos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Favoritos')}>
            <Text style={styles.favSeeAll}>Ver todos ({favoritos.length})</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.favScrollContent}
        >
          {favoritosHinos.map(hino => (
            <TouchableOpacity
              key={hino.id}
              style={styles.favCard}
              onPress={() => navigation.navigate('HinoDetail', { hino })}
            >
              <Text style={styles.favNumber}>{hino.numero}</Text>
              <Text style={styles.favTitleText} numberOfLines={2}>{hino.titulo}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const isFav = favoritos.includes(item.id);
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          console.log('Navegando para hino:', item.numero, item.titulo, 'Tem letra?', !!item.letra);
          navigation.navigate('HinoDetail', { hino: item });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.numberContainer}>
            <Text style={styles.number}>{item.numero}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.titulo}</Text>
            <Text style={styles.subtitle}>Harpa Cristã</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.heart, isFav && styles.heartActive]}>
              {isFav ? '❤️' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando hinos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeTop}/>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Harpa Cristã</Text>
          <Text style={styles.headerSubtitle}>640 hinos de adoração</Text>
        </View>
        <TouchableOpacity style={styles.favButton} onPress={() => navigation.navigate('Favoritos')}>
          <Text style={styles.favButtonText}>⭐ {favoritos.length}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Número (ex: 360) ou título..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      
      <FlatList
        data={hinos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          searchQuery ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>😔</Text>
              <Text style={styles.emptyText}>Nenhum hino encontrado</Text>
              <Text style={styles.emptySubtext}>Tente outro número ou palavra-chave</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeTop: {
  height: Platform.OS === 'ios' ? 40 : 30, // Ajuste para camera
  backgroundColor: '#F8F5F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F5F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F5F0',
  },
  loadingText: {
    fontSize: 16,
    color: '#A0522D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F8F5F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C1810',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A0522D',
    opacity: 0.8,
    marginTop: 2,
  },
  favButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  favButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C1810',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#2C1810',
  },
  listContent: {
    paddingBottom: 24,
  },
  favSection: {
    marginBottom: 20,
  },
  favHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  favTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C1810',
  },
  favSeeAll: {
    fontSize: 13,
    color: '#A0522D',
    fontWeight: '500',
  },
  favScrollContent: {
    paddingHorizontal: 16,
  },
  favCard: {
    backgroundColor: '#FFF',
    width: 100,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  favNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 8,
  },
  favTitleText: {
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
    lineHeight: 14,
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 8,
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
  number: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B7355',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C1810',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#A0522D',
  },
  heart: {
    fontSize: 26,
    color: '#CCC',
    marginLeft: 12,
  },
  heartActive: {
    color: '#E53935',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
  },
});