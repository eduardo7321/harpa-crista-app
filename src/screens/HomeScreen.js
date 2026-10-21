import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllHinos, getHinoById, searchHinos } from '../services/hinoService';
import { getRecentHinos } from '../services/favoriteService';
import { FAVORITOS_ID } from '../services/listService';
import { useLists } from '../context/ListsContext';
import { useTheme } from '../context/SettingsContext';
import HinoRow from '../components/HinoRow';

export default function HomeScreen({ navigation }) {
  const { cores } = useTheme();
  const { isFavorito, toggleHino } = useLists();
  const [busca, setBusca] = useState('');
  const [recentes, setRecentes] = useState([]);

  const total = getAllHinos().length;
  const hinos = useMemo(() => searchHinos(busca), [busca]);

  useFocusEffect(
    useCallback(() => {
      getRecentHinos().then(ids => setRecentes(ids.map(getHinoById).filter(Boolean)));
    }, [])
  );

  const abrir = (hino) => navigation.navigate('HinoDetail', { hinoId: hino.id });

  const cabecalhoLista = !busca.trim() && recentes.length > 0 ? (
    <View style={styles.recentes}>
      <Text style={[styles.secao, { color: cores.muted }]}>ABERTOS RECENTEMENTE</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {recentes.map(hino => (
          <TouchableOpacity
            key={hino.id}
            style={[styles.chip, { backgroundColor: cores.chip }]}
            onPress={() => abrir(hino)}
            accessibilityRole="button"
            accessibilityLabel={`Abrir hino ${hino.numero}, ${hino.titulo}`}
          >
            <Text style={[styles.chipNumero, { color: cores.accent }]}>{hino.numero}</Text>
            <Text style={[styles.chipTitulo, { color: cores.text }]} numberOfLines={1}>
              {hino.titulo}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={[styles.secao, { color: cores.muted }]}>TODOS OS HINOS</Text>
    </View>
  ) : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: cores.text }]}>Harpa Cristã</Text>
        <Text style={[styles.subtitulo, { color: cores.muted }]}>{total} hinos</Text>
      </View>

      <View style={[styles.busca, { backgroundColor: cores.card, borderColor: cores.line }]}>
        <Ionicons name="search" size={18} color={cores.muted} />
        <TextInput
          style={[styles.buscaInput, { color: cores.text }]}
          placeholder="Número, título ou trecho da letra"
          placeholderTextColor={cores.muted}
          value={busca}
          onChangeText={setBusca}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Buscar hino"
        />
        {busca.length > 0 && (
          <TouchableOpacity
            onPress={() => setBusca('')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
          >
            <Ionicons name="close-circle" size={18} color={cores.muted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={hinos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <HinoRow
            hino={item}
            onPress={() => abrir(item)}
            salvo={isFavorito(item.id)}
            onToggleSalvo={() => toggleHino(FAVORITOS_ID, item.id)}
          />
        )}
        ListHeaderComponent={cabecalhoLista}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={15}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="search-outline" size={40} color={cores.muted} />
            <Text style={[styles.vazioTexto, { color: cores.text }]}>Nenhum hino encontrado</Text>
            <Text style={[styles.vazioSub, { color: cores.muted }]}>
              Tente outro número ou palavra
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  subtitulo: {
    fontSize: 14,
    marginTop: 2,
  },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  buscaInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  recentes: {
    paddingTop: 8,
  },
  secao: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  chips: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: 200,
    gap: 6,
  },
  chipNumero: {
    fontSize: 15,
    fontWeight: '700',
  },
  chipTitulo: {
    fontSize: 14,
    flexShrink: 1,
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  vazioTexto: {
    fontSize: 18,
    fontWeight: '600',
  },
  vazioSub: {
    fontSize: 14,
  },
});
