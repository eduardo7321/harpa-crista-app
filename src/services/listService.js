import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAVORITES_KEY } from './favoriteService';
import { LIST_COLORS } from '../theme/colors';
import { normalize } from '../utils/normalize';

export const LISTS_KEY = '@harpa_lists';
export const FAVORITOS_ID = 'favoritos';
export const LISTAS_SUGERIDAS = ['Pregação', 'Sangue', 'Oração', 'Consagração'];

const ERRO_NOME_VAZIO = 'Dê um nome para a lista.';
const ERRO_NOME_DUPLICADO = 'Já existe uma lista com esse nome.';

// Lança erro só se a leitura falhar; valor ausente ou JSON inválido viram null
const lerJSON = async (chave) => {
  const valor = await AsyncStorage.getItem(chave);
  if (!valor) return null;
  try {
    return JSON.parse(valor);
  } catch (error) {
    return null;
  }
};

const novoId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const toggleHino = (listas, listaId, hinoId) =>
  listas.map(lista => {
    if (lista.id !== listaId) return lista;
    const hinos = lista.hinos.includes(hinoId)
      ? lista.hinos.filter(id => id !== hinoId)
      : [...lista.hinos, hinoId];
    return { ...lista, hinos };
  });

export const listasDoHino = (listas, hinoId) =>
  listas.filter(lista => lista.hinos.includes(hinoId));

export const validarNome = (listas, nome, ignorarId) => {
  const chave = normalize(nome);
  if (!chave) return ERRO_NOME_VAZIO;
  const existe = listas.some(lista => lista.id !== ignorarId && normalize(lista.nome) === chave);
  return existe ? ERRO_NOME_DUPLICADO : null;
};

export const criarLista = (listas, { nome, cor, hinos = [] }) => {
  const erro = validarNome(listas, nome);
  if (erro) throw new Error(erro);
  const lista = { id: novoId(), nome: nome.trim(), cor, hinos: [...hinos], fixa: false };
  return { listas: [...listas, lista], lista };
};

export const editarLista = (listas, id, { nome, cor }) => {
  const alvo = listas.find(lista => lista.id === id);
  if (!alvo) return listas;
  if (nome !== undefined) {
    if (alvo.fixa) throw new Error('Esta lista não pode ser renomeada.');
    const erro = validarNome(listas, nome, id);
    if (erro) throw new Error(erro);
  }
  return listas.map(lista => {
    if (lista.id !== id) return lista;
    return {
      ...lista,
      ...(nome !== undefined && { nome: nome.trim() }),
      ...(cor !== undefined && { cor }),
    };
  });
};

export const excluirLista = (listas, id) =>
  listas.filter(lista => lista.id !== id || lista.fixa);

const favoritosVazios = () => (
  { id: FAVORITOS_ID, nome: 'Favoritos', cor: LIST_COLORS[0], hinos: [], fixa: true }
);

// Mantém só listas bem formadas, com hinos válidos e sem repetição; garante Favoritos
const sanear = (salvas, hinoIdsValidos) => {
  const listas = salvas
    .filter(l => l && typeof l === 'object' && typeof l.id === 'string'
      && typeof l.nome === 'string' && Array.isArray(l.hinos))
    .map(l => ({
      id: l.id,
      nome: l.nome,
      cor: typeof l.cor === 'string' ? l.cor : LIST_COLORS[0],
      hinos: [...new Set(l.hinos)].filter(id => hinoIdsValidos.has(id)),
      fixa: l.id === FAVORITOS_ID,
    }));
  const favoritos = listas.find(l => l.id === FAVORITOS_ID) ?? favoritosVazios();
  return [favoritos, ...listas.filter(l => l.id !== FAVORITOS_ID)];
};

const listasIniciais = async (hinoIdsValidos) => {
  let antigos = null;
  try {
    antigos = await lerJSON(FAVORITES_KEY);
  } catch (error) {
    antigos = null;
  }
  const favoritos = Array.isArray(antigos)
    ? [...new Set(antigos)].filter(id => hinoIdsValidos.has(id))
    : [];
  return [
    { ...favoritosVazios(), hinos: favoritos },
    ...LISTAS_SUGERIDAS.map((nome, i) => ({
      id: `sugerida-${i + 1}`,
      nome,
      cor: LIST_COLORS[i],
      hinos: [],
      fixa: false,
    })),
  ];
};

export const salvarListas = async (listas) => {
  try {
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(listas));
  } catch (error) {
    console.error('Erro ao salvar listas:', error);
  }
};

// Na primeira execução migra os favoritos antigos e cria as listas sugeridas
export const carregarListas = async (hinoIdsValidos) => {
  let salvas;
  try {
    salvas = await lerJSON(LISTS_KEY);
  } catch (error) {
    // Falha de leitura: usa o padrão nesta sessão, sem sobrescrever o que está salvo
    console.error('Erro ao carregar listas:', error);
    return listasIniciais(hinoIdsValidos);
  }
  if (Array.isArray(salvas)) return sanear(salvas, hinoIdsValidos);
  const listas = await listasIniciais(hinoIdsValidos);
  await salvarListas(listas);
  return listas;
};
