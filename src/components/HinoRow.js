import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/SettingsContext';

// Linha de hino usada nas listas; o marcador é opcional
const HinoRow = ({ hino, onPress, salvo, onToggleSalvo, acaoDireita }) => {
  const { cores } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: cores.line }]}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={`Hino ${hino.numero}, ${hino.titulo}`}
    >
      <View style={[styles.numero, { backgroundColor: cores.chip }]}>
        <Text style={[styles.numeroTexto, { color: cores.accent }]}>{hino.numero}</Text>
      </View>
      <Text style={[styles.titulo, { color: cores.text }]} numberOfLines={2}>
        {hino.titulo}
      </Text>
      {onToggleSalvo && (
        <TouchableOpacity
          onPress={onToggleSalvo}
          style={styles.botao}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={salvo ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        >
          <Ionicons name={salvo ? 'bookmark' : 'bookmark-outline'} size={22} color={cores.accent} />
        </TouchableOpacity>
      )}
      {acaoDireita}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  numero: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  numeroTexto: {
    fontSize: 17,
    fontWeight: '700',
  },
  titulo: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  botao: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HinoRow;
