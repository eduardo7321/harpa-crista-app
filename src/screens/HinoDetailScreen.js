import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView  } from 'react-native';
import { isFavorite, addFavorite, removeFavorite } from '../services/favoriteService';

const HinoDetailScreen = ({ route, navigation }) => {
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
    }
    
    return resultado;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeTop}/>
      {/* Header com fundo combinando */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.numero}>Hino {hino.numero}</Text>
          <Text style={styles.titulo}>{hino.titulo}</Text>
        </View>
        <TouchableOpacity onPress={toggleFavorite} style={styles.heartButton}>
          {/* <Text style={[styles.heart, isFav && styles.heartActive]}>
            {isFav ? '❤️' : '♡'}
          </Text> */}
        </TouchableOpacity>
      </View>
      
      {/* Conteúdo do hino */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.letraContainer}>
          {renderLetra()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeTop: {
  height: Platform.OS === 'ios' ? 40 : 30,
  backgroundColor: '#2C1810', // Mesma cor do header
},
  container: {
    flex: 1,
    backgroundColor: '#F8F5F0', // Papel envelhecido (igual da HomeScreen)
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C1810', // Marrom escuro (combina com o título da Home)
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
  numero: {
    fontSize: 14,
    color: '#F8F5F0',
    opacity: 0.8,
    marginBottom: 4,
    fontWeight: '500',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8F5F0',
    textAlign: 'center',
  },
  heartButton: {
    padding: 8,
    width: 70,
    alignItems: 'flex-end',
  },
  heart: {
    fontSize: 28,
    color: '#F8F5F0',
  },
  heartActive: {
    color: '#E53935',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  letraContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  textoNormal: {
    fontSize: 18,
    lineHeight: 30,
    color: '#2C1810', // Marrom escuro (combina com o texto da Home)
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  negrito: {
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 30,
    color: '#2C1810',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});

// Adicionar Platform no import
import { Platform } from 'react-native';

export default HinoDetailScreen;