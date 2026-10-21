import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useSettings, useTheme } from '../context/SettingsContext';
import { FONT_SIZES } from '../services/settingsService';

const PRIVACIDADE_URL = 'https://github.com/eduardo7321/harpa-crista-app/blob/main/PRIVACY.md';

function Segmentado({ opcoes, valor, onChange, cores }) {
  return (
    <View style={[styles.segmentado, { backgroundColor: cores.chip }]}>
      {opcoes.map(opcao => {
        const ativo = opcao.valor === valor;
        return (
          <TouchableOpacity
            key={opcao.valor}
            style={[styles.segmento, ativo && { backgroundColor: cores.card }]}
            onPress={() => onChange(opcao.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo }}
          >
            <Text style={[styles.segmentoTexto, { color: ativo ? cores.accent : cores.muted }]}>
              {opcao.rotulo}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AjustesScreen() {
  const { cores } = useTheme();
  const { settings, atualizar } = useSettings();

  const indice = FONT_SIZES.indexOf(settings.fontSize);
  const mudarFonte = (delta) => {
    const novo = FONT_SIZES[indice + delta];
    if (novo) atualizar({ fontSize: novo });
  };

  const fontFamily = settings.fonte === 'serif' ? (Platform.OS === 'ios' ? 'Georgia' : 'serif') : undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={[styles.titulo, { color: cores.text }]}>Ajustes</Text>

        <Text style={[styles.secao, { color: cores.muted }]}>APARÊNCIA</Text>
        <View style={[styles.grupo, { backgroundColor: cores.card, borderColor: cores.line }]}>
          <Text style={[styles.rotulo, { color: cores.text }]}>Tema</Text>
          <Segmentado
            cores={cores}
            valor={settings.tema}
            onChange={(tema) => atualizar({ tema })}
            opcoes={[
              { valor: 'claro', rotulo: 'Claro' },
              { valor: 'escuro', rotulo: 'Escuro' },
              { valor: 'sistema', rotulo: 'Seguir o celular' },
            ]}
          />
          <Text style={[styles.rotulo, styles.rotuloEspaco, { color: cores.text }]}>Tipo de letra</Text>
          <Segmentado
            cores={cores}
            valor={settings.fonte}
            onChange={(fonte) => atualizar({ fonte })}
            opcoes={[
              { valor: 'serif', rotulo: 'Serifada' },
              { valor: 'sans', rotulo: 'Sem serifa' },
            ]}
          />
        </View>

        <Text style={[styles.secao, { color: cores.muted }]}>LEITURA</Text>
        <View style={[styles.grupo, { backgroundColor: cores.card, borderColor: cores.line }]}>
          <View style={styles.linha}>
            <Text style={[styles.rotulo, { color: cores.text }]}>Tamanho da letra</Text>
            <View style={styles.passos}>
              <TouchableOpacity
                style={[styles.passo, { backgroundColor: cores.chip, opacity: indice <= 0 ? 0.4 : 1 }]}
                onPress={() => mudarFonte(-1)}
                disabled={indice <= 0}
                accessibilityRole="button"
                accessibilityLabel="Diminuir letra"
              >
                <Ionicons name="remove" size={20} color={cores.text} />
              </TouchableOpacity>
              <Text style={[styles.valor, { color: cores.text }]}>{settings.fontSize}</Text>
              <TouchableOpacity
                style={[styles.passo, { backgroundColor: cores.chip, opacity: indice >= FONT_SIZES.length - 1 ? 0.4 : 1 }]}
                onPress={() => mudarFonte(1)}
                disabled={indice >= FONT_SIZES.length - 1}
                accessibilityRole="button"
                accessibilityLabel="Aumentar letra"
              >
                <Ionicons name="add" size={20} color={cores.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.previa, { backgroundColor: cores.bg, borderColor: cores.line }]}>
            {['Deus prometeu com certeza', 'Chuvas de graça mandar;'].map(verso => (
              <Text
                key={verso}
                style={{
                  color: cores.text,
                  fontSize: settings.fontSize,
                  lineHeight: Math.round(settings.fontSize * 1.6),
                  fontFamily,
                  textAlign: 'center',
                }}
              >
                {verso}
              </Text>
            ))}
          </View>

          <View style={[styles.linha, styles.linhaSwitch]}>
            <Text style={[styles.rotulo, styles.rotuloFlex, { color: cores.text }]}>
              Manter a tela ligada durante a leitura
            </Text>
            <Switch
              value={settings.manterTelaLigada}
              onValueChange={(manterTelaLigada) => atualizar({ manterTelaLigada })}
              trackColor={{ true: cores.accent, false: cores.line }}
              thumbColor="#FFF"
              accessibilityLabel="Manter a tela ligada durante a leitura"
            />
          </View>
        </View>

        <Text style={[styles.secao, { color: cores.muted }]}>SOBRE</Text>
        <View style={[styles.grupo, { backgroundColor: cores.card, borderColor: cores.line }]}>
          <View style={styles.linha}>
            <Text style={[styles.rotulo, { color: cores.text }]}>Versão</Text>
            <Text style={{ color: cores.muted, fontSize: 15 }}>{Constants.expoConfig?.version}</Text>
          </View>
          <TouchableOpacity
            style={[styles.linha, styles.linhaLink]}
            onPress={() => Linking.openURL(PRIVACIDADE_URL)}
            accessibilityRole="link"
          >
            <Text style={[styles.rotulo, { color: cores.text }]}>Política de privacidade</Text>
            <Ionicons name="open-outline" size={18} color={cores.muted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'serif',
    paddingTop: 12,
    marginBottom: 8,
  },
  secao: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
  },
  grupo: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  rotulo: {
    fontSize: 16,
    fontWeight: '500',
  },
  rotuloEspaco: {
    marginTop: 16,
  },
  rotuloFlex: {
    flex: 1,
    marginRight: 12,
  },
  segmentado: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginTop: 8,
  },
  segmento: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  segmentoTexto: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  linhaSwitch: {
    marginTop: 12,
  },
  linhaLink: {
    marginTop: 4,
  },
  passos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valor: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  previa: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
});
