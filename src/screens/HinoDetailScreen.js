import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { isFavorite, addFavorite, removeFavorite } from '../services/favoriteService';

const HinoDetailScreen = ({ route }) => {
  const { hino } = route.params;
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    verificarFavorito();
  }, []);

  const verificarFavorito = async () => {
    const fav = await isFavorite(hino.id);
    setIsFav(fav);
  };

  const toggleFavorite = async () => {
    if (isFav) {
      await removeFavorite(hino.id);
      setIsFav(false);
    } else {
      await addFavorite(hino.id);
      setIsFav(true);
    }
  };

  // Função para formatar texto com **negrito**
  const formatarTexto = (texto) => {
    if (!texto) return null;
    const partes = texto.split(/(\*\*[^*]+\*\*)/g);
    return partes.map((parte, index) => {
      if (parte.startsWith('**') && parte.endsWith('**')) {
        return <Text key={index} style={styles.negrito}>{parte.slice(2, -2)}</Text>;
      }
      return <Text key={index}>{parte}</Text>;
    });
  };

  const linhas = hino.letra?.split('\n') || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.numero}>Hino {hino.numero}</Text>
        <Text style={styles.titulo}>{hino.titulo}</Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.heartButton}>
          <Text style={[styles.heart, isFav && styles.heartActive]}>
            {isFav ? '❤️' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.letraContainer}>
        {linhas.map((linha, idx) => (
          <Text key={idx} style={styles.linha}>
            {formatarTexto(linha)}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4a90e2',
    padding: 24,
    alignItems: 'center',
  },
  numero: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  heartButton: {
    marginTop: 12,
  },
  heart: {
    fontSize: 32,
    color: '#fff',
  },
  heartActive: {
    color: '#ff6b6b',
  },
  letraContainer: {
    padding: 24,
  },
  linha: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  negrito: {
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
    textAlign: 'center',
  },
});

export default HinoDetailScreen;