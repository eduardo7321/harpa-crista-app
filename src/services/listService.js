import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAVORITES_KEY } from './favoriteService';
import { LIST_COLORS } from '../theme/colors';
import { normalize } from '../utils/normalize';

export const LISTS_KEY = '@harpa_lists';
export const FAVORITOS_ID = 'favoritos';
export const LISTAS_SUGERIDAS = ['Pregação', 'Sangue', 'Oração', 'Consagração'];

const ERRO_NOME_VAZIO = 'Dê um nome para a lista.';
const ERRO_NOME_DUPLICADO = 'Já existe uma lista com esse nome.';

const lerJSON = async (chave) => {
  try {
    const valor = await AsyncStorage.getItem(chave);
    return valor ? JSON.parse(valor) : null;
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

export const criarLista = (listas, { nome, cor }) => {
  const erro = validarNome(listas, nome);
  if (erro) throw new Error(erro);
  const lista = { id: novoId(), nome: nome.trim(), cor, hinos: [], fixa: false };
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

const listasIniciais = async (hinoIdsValidos) => {
  const antigos = await lerJSON(FAVORITES_KEY);
  const favoritos = Array.isArray(antigos)
    ? [...new Set(antigos)].filter(id => hinoIdsValidos.has(id))
    : [];
  return [
    { id: FAVORITOS_ID, nome: 'Favoritos', cor: LIST_COLORS[0], hinos: favoritos, fixa: true },
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
  const salvas = await lerJSON(LISTS_KEY);
  if (Array.isArray(salvas)) return salvas;
  const listas = await listasIniciais(hinoIdsValidos);
  await salvarListas(listas);
  return listas;
};
