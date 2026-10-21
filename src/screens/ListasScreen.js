import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/SettingsContext';
import { useLists } from '../context/ListsContext';
import ListFormModal from '../components/ListFormModal';

const NOVA = { id: '__nova__' };

const contagem = (n) => `${n} hino${n === 1 ? '' : 's'}`;

export default function ListasScreen({ navigation }) {
  const { cores } = useTheme();
  const { listas, criar, editar, excluir } = useLists();
  // form: null (fechado) | { modo: 'nova' } | { modo: 'editar', lista }
  const [form, setForm] = useState(null);

  const abrirOpcoes = (lista) => {
    if (lista.fixa) return;
    Alert.alert(lista.nome, undefined, [
      { text: 'Renomear', onPress: () => setForm({ modo: 'editar', lista }) },
      { text: 'Mudar cor', onPress: () => setForm({ modo: 'editar', lista }) },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Excluir lista', `Excluir a lista "${lista.nome}"? Os hinos não serão apagados.`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: () => excluir(lista.id) },
          ]),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const salvarForm = ({ nome, cor }) => {
    if (form.modo === 'nova') criar({ nome, cor });
    else editar(form.lista.id, { nome, cor });
    setForm(null);
  };

  const renderItem = ({ item }) => {
    if (item === NOVA) {
      return (
        <TouchableOpacity
          style={[styles.card, styles.nova, { borderColor: cores.muted }]}
          onPress={() => setForm({ modo: 'nova' })}
          accessibilityRole="button"
          accessibilityLabel="Criar nova lista"
        >
          <Ionicons name="add" size={22} color={cores.muted} />
          <Text style={[styles.novaTexto, { color: cores.muted }]}>Nova lista</Text>
        </TouchableOpacity>
      );
    }

    const destaque = item.fixa;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          destaque
            ? { backgroundColor: cores.accent }
            : { backgroundColor: cores.card, borderColor: cores.line, borderWidth: 1 },
        ]}
        onPress={() => navigation.navigate('ListaDetail', { listaId: item.id })}
        onLongPress={() => abrirOpcoes(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.nome}, ${contagem(item.hinos.length)}`}
        accessibilityHint={item.fixa ? undefined : 'Toque e segure para editar ou excluir'}
      >
        <View style={styles.nomeLinha}>
          {destaque ? (
            <Ionicons name="star" size={16} color="#FFF" />
          ) : (
            <View style={[styles.ponto, { backgroundColor: item.cor }]} />
          )}
          <Text style={[styles.nome, { color: destaque ? '#FFF' : cores.text }]} numberOfLines={2}>
            {item.nome}
          </Text>
        </View>
        <Text style={[styles.qtd, { color: destaque ? 'rgba(255,255,255,0.85)' : cores.muted }]}>
          {contagem(item.hinos.length)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.bg }]} edges={['top']}>
      <Text style={[styles.titulo, { color: cores.text }]}>Minhas listas</Text>
      <Text style={[styles.dica, { color: cores.muted }]}>Toque e segure uma lista para editar</Text>

      <FlatList
        data={[...listas, NOVA]}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.coluna}
        contentContainerStyle={styles.grade}
      />

      <ListFormModal
        visible={form !== null}
        titulo={form?.modo === 'editar' ? 'Editar lista' : 'Nova lista'}
        inicial={form?.lista}
        onSalvar={salvarForm}
        onCancelar={() => setForm(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'serif',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  dica: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginTop: 2,
    marginBottom: 12,
  },
  grade: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  coluna: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    minHeight: 88,
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
  },
  nova: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  novaTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  nomeLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ponto: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  nome: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  qtd: {
    fontSize: 13,
    marginTop: 8,
  },
});
