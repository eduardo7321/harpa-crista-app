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

const renderLetra = () => {
  if (!hino.letra) return null;
  
  const linhas = hino.letra.split('\n');
  const resultado = [];
  let dentroNegrito = false;
  
  for (let i = 0; i < linhas.length; i++) {
    let linha = linhas[i];
    
    // Verifica se a linha tem início de negrito
    if (linha.includes('**') && !dentroNegrito) {
      const partes = linha.split(/(\*\*)/);
      for (let j = 0; j < partes.length; j++) {
        const parte = partes[j];
        if (parte === '**') {
          dentroNegrito = !dentroNegrito;
        } else if (parte.trim() !== '') {
          resultado.push(
            <Text key={`${i}-${j}`} style={dentroNegrito ? styles.negrito : styles.textoNormal}>
              {parte}
            </Text>
          );
        }
      }
    } 
    // Verifica se a linha tem fim de negrito
    else if (linha.includes('**') && dentroNegrito) {
      const partes = linha.split(/(\*\*)/);
      for (let j = 0; j < partes.length; j++) {
        const parte = partes[j];
        if (parte === '**') {
          dentroNegrito = !dentroNegrito;
        } else if (parte.trim() !== '') {
          resultado.push(
            <Text key={`${i}-${j}`} style={dentroNegrito ? styles.negrito : styles.textoNormal}>
              {parte}
            </Text>
          );
        }
      }
    }
    // Linha normal (sem **)
    else {
      resultado.push(
        <Text key={i} style={dentroNegrito ? styles.negrito : styles.textoNormal}>
          {linha}
        </Text>
      );
    }
    
    // Adiciona quebra de linha após cada linha (exceto a última)
    //if (i < linhas.length - 1) {
    //  resultado.push(<Text key={`br-${i}`}>{"\n"}</Text>);
    //}
  }
  
  return resultado;
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.numero}>Hino {hino.numero}</Text>
        <Text style={styles.titulo}>{hino.titulo}</Text>
        {/*<TouchableOpacity onPress={toggleFavorite} style={styles.heartButton}>
          <Text style={[styles.heart, isFav && styles.heartActive]}>
            {isFav ? '❤️' : '♡'}
          </Text>
        </TouchableOpacity>*/}
      </View>
      <View style={styles.letraContainer}>
        {renderLetra()}
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
    marginBottom: 12,
  },
  textoNormal: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
    textAlign: 'center',
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