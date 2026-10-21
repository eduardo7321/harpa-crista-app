import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { getHinoById, getHinoVizinho } from '../services/hinoService';
import { addToRecent } from '../services/favoriteService';
import { FONT_SIZES } from '../services/settingsService';
import { parseLetra } from '../utils/parseLetra';
import { useSettings, useTheme } from '../context/SettingsContext';
import { useLists } from '../context/ListsContext';
import SaveToListSheet from '../components/SaveToListSheet';

// Hooks não podem ser condicionais: o componente só é montado quando a opção está ativa
function ManterTelaLigada() {
  useKeepAwake();
  return null;
}

const HinoDetailScreen = ({ route, navigation }) => {
  const { hinoId } = route.params;
  const hino = getHinoById(hinoId);
  const { cores } = useTheme();
  const { settings, atualizar } = useSettings();
  const { listasDoHino } = useLists();
  const [salvando, setSalvando] = useState(false);
  const scrollRef = useRef(null);

  const blocos = useMemo(() => parseLetra(hino.letra), [hino]);
  const listas = listasDoHino(hino.id);
  const anterior = getHinoVizinho(hino.numero, -1);
  const proximo = getHinoVizinho(hino.numero, 1);

  useEffect(() => {
    addToRecent(hinoId);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [hinoId]);

  const indiceFonte = FONT_SIZES.indexOf(settings.fontSize);
  const mudarFonte = (delta) => {
    const novo = FONT_SIZES[indiceFonte + delta];
    if (novo) atualizar({ fontSize: novo });
  };

  const fontFamily = settings.fonte === 'serif' ? (Platform.OS === 'ios' ? 'Georgia' : 'serif') : undefined;
  const texto = {
    fontSize: settings.fontSize,
    lineHeight: Math.round(settings.fontSize * 1.6),
    fontFamily,
    color: cores.text,
  };

  return (
    <View style={[styles.container, { backgroundColor: cores.bg }]}>
      {settings.manterTelaLigada && <ManterTelaLigada />}

      <SafeAreaView edges={['top']} style={[styles.header, { borderBottomColor: cores.line }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconeBotao}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={26} color={cores.text} />
        </TouchableOpacity>
        <View style={styles.headerMeio}>
          <Text style={[styles.numero, { color: cores.muted }]}>HINO {hino.numero}</Text>
          <Text style={[styles.titulo, { color: cores.text }]} numberOfLines={2}>{hino.titulo}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setSalvando(true)}
          style={styles.iconeBotao}
          accessibilityRole="button"
          accessibilityLabel="Salvar em uma lista"
        >
          <Ionicons name={listas.length > 0 ? 'bookmark' : 'bookmark-outline'} size={24} color={cores.accent} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.conteudo}>
        {listas.length > 0 && (
          <View style={styles.tags}>
            {listas.map(lista => (
              <View key={lista.id} style={[styles.tag, { backgroundColor: cores.chip }]}>
                <Text style={[styles.tagTexto, { color: cores.accent }]}>
                  {lista.fixa ? '★ ' : ''}{lista.nome}
                </Text>
              </View>
            ))}
          </View>
        )}

        {blocos.map((bloco, i) =>
          bloco.tipo === 'coro' ? (
            <View key={i} style={[styles.coro, { backgroundColor: cores.chip, borderLeftColor: cores.accent }]}>
              <Text style={[styles.rotulo, { color: cores.accent }]}>CORO</Text>
              {bloco.linhas.map((linha, j) => (
                <Text key={j} style={[texto, styles.linha, styles.italico]}>{linha}</Text>
              ))}
            </View>
          ) : (
            <View key={i} style={styles.estrofe}>
              {bloco.numero && (
                <Text style={[styles.rotulo, { color: cores.accent }]}>{bloco.numero}</Text>
              )}
              {bloco.linhas.map((linha, j) => (
                <Text key={j} style={[texto, styles.linha]}>{linha}</Text>
              ))}
            </View>
          )
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={[styles.barra, { backgroundColor: cores.card, borderTopColor: cores.line }]}>
        <TouchableOpacity
          style={styles.navBotao}
          onPress={() => navigation.setParams({ hinoId: anterior.id })}
          accessibilityRole="button"
          accessibilityLabel={`Hino anterior, ${anterior.numero}`}
        >
          <Ionicons name="chevron-back" size={18} color={cores.muted} />
          <Text style={[styles.navTexto, { color: cores.muted }]}>Hino {anterior.numero}</Text>
        </TouchableOpacity>

        <View style={styles.fonte}>
          <TouchableOpacity
            style={styles.fonteBotao}
            onPress={() => mudarFonte(-1)}
            disabled={indiceFonte <= 0}
            accessibilityRole="button"
            accessibilityLabel="Diminuir letra"
          >
            <Text style={[styles.fonteTexto, { color: cores.text, opacity: indiceFonte <= 0 ? 0.3 : 1 }]}>A−</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fonteBotao}
            onPress={() => mudarFonte(1)}
            disabled={indiceFonte >= FONT_SIZES.length - 1}
            accessibilityRole="button"
            accessibilityLabel="Aumentar letra"
          >
            <Text style={[styles.fonteTexto, styles.fonteMaior, { color: cores.text, opacity: indiceFonte >= FONT_SIZES.length - 1 ? 0.3 : 1 }]}>A+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.navBotao, styles.navDireita]}
          onPress={() => navigation.setParams({ hinoId: proximo.id })}
          accessibilityRole="button"
          accessibilityLabel={`Próximo hino, ${proximo.numero}`}
        >
          <Text style={[styles.navTexto, { color: cores.muted }]}>Hino {proximo.numero}</Text>
          <Ionicons name="chevron-forward" size={18} color={cores.muted} />
        </TouchableOpacity>
      </SafeAreaView>

      <SaveToListSheet visible={salvando} hino={hino} onFechar={() => setSalvando(false)} />
    </View>
  );
};

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
  iconeBotao: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMeio: {
    flex: 1,
    alignItems: 'center',
  },
  numero: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  conteudo: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  estrofe: {
    marginTop: 16,
  },
  coro: {
    marginTop: 16,
    borderLeftWidth: 3,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rotulo: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  linha: {
    textAlign: 'center',
  },
  italico: {
    fontStyle: 'italic',
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    minWidth: 96,
    gap: 2,
  },
  navDireita: {
    justifyContent: 'flex-end',
  },
  navTexto: {
    fontSize: 14,
  },
  fonte: {
    flexDirection: 'row',
  },
  fonteBotao: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fonteTexto: {
    fontSize: 16,
    fontWeight: '700',
  },
  fonteMaior: {
    fontSize: 21,
  },
});

export default HinoDetailScreen;
