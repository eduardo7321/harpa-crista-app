import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getHinoById } from '../services/hinoService';
import { useTheme } from '../context/SettingsContext';
import { useLists } from '../context/ListsContext';
import HinoRow from '../components/HinoRow';

export default function ListaDetailScreen({ route, navigation }) {
  const { listaId } = route.params;
  const { cores } = useTheme();
  const { listas, toggleHino } = useLists();
  const [removido, setRemovido] = useState(null);
  const timer = useRef(null);

  const lista = listas.find(l => l.id === listaId);

  // Lista excluída enquanto aberta: volta para a tela anterior
  useEffect(() => {
    if (!lista) navigation.goBack();
  }, [lista, navigation]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!lista) return null;

  const hinos = lista.hinos
    .map(getHinoById)
    .filter(Boolean)
    .sort((a, b) => a.numero - b.numero);

  const remover = (hino) => {
    toggleHino(lista.id, hino.id);
    setRemovido(hino);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setRemovido(null), 4000);
  };

  const desfazer = () => {
    clearTimeout(timer.current);
    if (!lista.hinos.includes(removido.id)) toggleHino(lista.id, removido.id);
    setRemovido(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.bg }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: cores.line }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.voltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={26} color={cores.text} />
        </TouchableOpacity>
        <View style={styles.headerMeio}>
          <Text style={[styles.titulo, { color: cores.text }]} numberOfLines={1}>{lista.nome}</Text>
          <Text style={[styles.sub, { color: cores.muted }]}>
            {hinos.length} hino{hinos.length === 1 ? '' : 's'}
          </Text>
        </View>
        <View style={styles.voltar} />
      </View>

      <FlatList
        data={hinos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <HinoRow
            hino={item}
            onPress={() => navigation.navigate('HinoDetail', { hinoId: item.id })}
            acaoDireita={
              <TouchableOpacity
                onPress={() => remover(item)}
                style={styles.remover}
                accessibilityRole="button"
                accessibilityLabel={`Remover hino ${item.numero} da lista`}
              >
                <Ionicons name="close-circle-outline" size={24} color={cores.muted} />
              </TouchableOpacity>
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="bookmark-outline" size={40} color={cores.muted} />
            <Text style={[styles.vazioTexto, { color: cores.text }]}>Nenhum hino nesta lista ainda.</Text>
            <Text style={[styles.vazioSub, { color: cores.muted }]}>
              Abra um hino e toque no marcador para salvá-lo aqui.
            </Text>
          </View>
        }
      />

      {removido && (
        <View style={[styles.aviso, { backgroundColor: cores.text }]}>
          <Text style={[styles.avisoTexto, { color: cores.bg }]}>Hino removido</Text>
          <TouchableOpacity onPress={desfazer} style={styles.desfazer} accessibilityRole="button">
            <Text style={[styles.desfazerTexto, { color: cores.bg }]}>Desfazer</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  voltar: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMeio: {
    flex: 1,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
  },
  sub: {
    fontSize: 13,
  },
  remover: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 8,
  },
  vazioTexto: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  vazioSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  aviso: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
  },
  avisoTexto: {
    fontSize: 15,
  },
  desfazer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  desfazerTexto: {
    fontSize: 15,
    fontWeight: '700',
  },
});
