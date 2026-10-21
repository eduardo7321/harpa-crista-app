import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/SettingsContext';
import { useLists } from '../context/ListsContext';
import ListFormModal from './ListFormModal';

// Janela inferior "Salvar em…": marca o hino em uma ou mais listas
const SaveToListSheet = ({ visible, hino, onFechar }) => {
  const { cores } = useTheme();
  const { listas, toggleHino, criar } = useLists();
  const insets = useSafeAreaInsets();
  const [criando, setCriando] = useState(false);

  const criarComHino = ({ nome, cor }) => {
    criar({ nome, cor, hinos: [hino.id] });
    setCriando(false);
  };

  return (
    <>
      <Modal visible={visible && !criando} transparent animationType="slide" onRequestClose={onFechar}>
        <Pressable style={styles.fundo} onPress={onFechar} accessibilityLabel="Fechar" />
        <View style={[styles.sheet, { backgroundColor: cores.card, paddingBottom: 16 + insets.bottom }]}>
          <View style={[styles.alca, { backgroundColor: cores.line }]} />
          <Text style={[styles.titulo, { color: cores.text }]} numberOfLines={2}>
            Salvar "{hino.titulo}" em…
          </Text>
          <Text style={[styles.sub, { color: cores.muted }]}>Marque uma ou mais listas</Text>

          <ScrollView style={styles.lista}>
            {listas.map(lista => {
              const marcado = lista.hinos.includes(hino.id);
              return (
                <TouchableOpacity
                  key={lista.id}
                  style={[styles.opcao, { borderBottomColor: cores.line }]}
                  onPress={() => toggleHino(lista.id, hino.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: marcado }}
                >
                  <Ionicons
                    name={marcado ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={marcado ? cores.accent : cores.muted}
                  />
                  {lista.fixa ? (
                    <Ionicons name="star" size={14} color={cores.accent} />
                  ) : (
                    <View style={[styles.ponto, { backgroundColor: lista.cor }]} />
                  )}
                  <Text style={[styles.nome, { color: cores.text }]}>{lista.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.nova} onPress={() => setCriando(true)} accessibilityRole="button">
            <Ionicons name="add" size={22} color={cores.accent} />
            <Text style={[styles.novaTexto, { color: cores.accent }]}>Criar nova lista</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <ListFormModal
        visible={visible && criando}
        titulo="Nova lista"
        onSalvar={criarComHino}
        onCancelar={() => setCriando(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '75%',
  },
  alca: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
  },
  sub: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 8,
  },
  lista: {
    flexGrow: 0,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ponto: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  nome: {
    fontSize: 16,
  },
  nova: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
  },
  novaTexto: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SaveToListSheet;
