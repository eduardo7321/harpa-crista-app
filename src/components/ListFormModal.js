import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/SettingsContext';
import { LIST_COLORS } from '../theme/colors';

// Formulário de criar/editar lista; se onSalvar lançar erro, mostra a mensagem
const ListFormModal = ({ visible, inicial, titulo, onSalvar, onCancelar }) => {
  const { cores } = useTheme();
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(LIST_COLORS[0]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (visible) {
      setNome(inicial?.nome ?? '');
      setCor(inicial?.cor ?? LIST_COLORS[0]);
      setErro(null);
    }
  }, [visible, inicial]);

  const salvar = () => {
    try {
      onSalvar({ nome, cor });
    } catch (e) {
      setErro(e.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <KeyboardAvoidingView
        style={styles.fundo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.caixa, { backgroundColor: cores.card }]}>
          <Text style={[styles.titulo, { color: cores.text }]}>{titulo}</Text>

          <TextInput
            style={[styles.input, { color: cores.text, borderColor: erro ? '#C0392B' : cores.line, backgroundColor: cores.bg }]}
            value={nome}
            onChangeText={(texto) => { setNome(texto); setErro(null); }}
            placeholder="Nome da lista"
            placeholderTextColor={cores.muted}
            autoFocus
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={salvar}
            accessibilityLabel="Nome da lista"
          />
          {erro && <Text style={styles.erro}>{erro}</Text>}

          <Text style={[styles.rotulo, { color: cores.muted }]}>Cor</Text>
          <View style={styles.cores}>
            {LIST_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.cor, { backgroundColor: c }, cor === c && { borderColor: cores.text }]}
                onPress={() => setCor(c)}
                accessibilityRole="button"
                accessibilityState={{ selected: cor === c }}
                accessibilityLabel={`Cor ${LIST_COLORS.indexOf(c) + 1}`}
              >
                {cor === c && <Ionicons name="checkmark" size={18} color="#FFF" />}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.acoes}>
            <TouchableOpacity onPress={onCancelar} style={styles.botao} accessibilityRole="button">
              <Text style={[styles.botaoTexto, { color: cores.muted }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={salvar}
              style={[styles.botao, styles.botaoPrimario, { backgroundColor: cores.accent }]}
              accessibilityRole="button"
            >
              <Text style={[styles.botaoTexto, { color: cores.onAccent }]}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  caixa: {
    borderRadius: 16,
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  erro: {
    color: '#C0392B',
    fontSize: 13,
    marginTop: 6,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
  },
  cores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 8,
  },
  botao: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  botaoPrimario: {
    paddingHorizontal: 20,
  },
  botaoTexto: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ListFormModal;
