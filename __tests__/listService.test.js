import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  carregarListas, salvarListas, toggleHino, listasDoHino, validarNome,
  criarLista, editarLista, excluirLista, LISTS_KEY, FAVORITOS_ID, LISTAS_SUGERIDAS,
} from '../src/services/listService';
import { FAVORITES_KEY } from '../src/services/favoriteService';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const VALIDOS = new Set([1, 2, 3, 4, 5]);

beforeEach(() => AsyncStorage.clear());

test('primeiro uso migra favoritos sem duplicados e cria listas sugeridas vazias', async () => {
  await AsyncStorage.setItem(FAVORITES_KEY, '[3,3,1,9999]');
  const listas = await carregarListas(VALIDOS);
  expect(listas[0]).toMatchObject({ id: FAVORITOS_ID, nome: 'Favoritos', fixa: true, hinos: [3, 1] });
  expect(listas.slice(1).map(l => l.nome)).toEqual(LISTAS_SUGERIDAS);
  expect(LISTAS_SUGERIDAS).toEqual(['Pregação', 'Sangue', 'Oração', 'Consagração']);
  expect(listas.slice(1).every(l => l.hinos.length === 0 && !l.fixa)).toBe(true);
  expect(JSON.parse(await AsyncStorage.getItem(LISTS_KEY))).toEqual(listas);
});

test('lista sugerida excluída não volta', async () => {
  const listas = await carregarListas(VALIDOS);
  await salvarListas(excluirLista(listas, listas[2].id));
  const denovo = await carregarListas(VALIDOS);
  expect(denovo.map(l => l.nome)).toEqual(['Favoritos', 'Pregação', 'Oração', 'Consagração']);
});

test('JSON corrompido não quebra e usa o padrão', async () => {
  await AsyncStorage.setItem(FAVORITES_KEY, '{quebrado');
  await AsyncStorage.setItem(LISTS_KEY, 'nao é json');
  const listas = await carregarListas(VALIDOS);
  expect(listas).toHaveLength(5);
  expect(listas[0].hinos).toEqual([]);
});

test('toggleHino adiciona e remove sem mutar', () => {
  const base = [{ id: 'a', nome: 'A', cor: '#000', hinos: [1], fixa: false }];
  const com = toggleHino(base, 'a', 2);
  expect(com[0].hinos).toEqual([1, 2]);
  expect(base[0].hinos).toEqual([1]);
  expect(toggleHino(com, 'a', 1)[0].hinos).toEqual([2]);
});

test('listasDoHino', () => {
  const base = [
    { id: 'a', nome: 'A', cor: '#000', hinos: [1], fixa: false },
    { id: 'b', nome: 'B', cor: '#000', hinos: [2], fixa: false },
  ];
  expect(listasDoHino(base, 2).map(l => l.id)).toEqual(['b']);
});

test('validarNome rejeita vazio e duplicado sem acento', async () => {
  const listas = await carregarListas(VALIDOS);
  expect(validarNome(listas, '  ')).toBe('Dê um nome para a lista.');
  expect(validarNome(listas, 'oracao')).toBe('Já existe uma lista com esse nome.');
  expect(validarNome(listas, 'Oração', listas[3].id)).toBeNull();
  expect(validarNome(listas, 'Natal')).toBeNull();
});

test('criarLista apara o nome e rejeita inválido', async () => {
  const listas = await carregarListas(VALIDOS);
  const { listas: novas, lista } = criarLista(listas, { nome: '  Natal ', cor: '#123456' });
  expect(lista).toMatchObject({ nome: 'Natal', cor: '#123456', hinos: [], fixa: false });
  expect(novas).toHaveLength(6);
  expect(() => criarLista(novas, { nome: 'natal', cor: '#000' })).toThrow('Já existe uma lista com esse nome.');
});

test('Favoritos não pode ser excluída nem renomeada', async () => {
  const listas = await carregarListas(VALIDOS);
  expect(excluirLista(listas, FAVORITOS_ID)).toEqual(listas);
  expect(() => editarLista(listas, FAVORITOS_ID, { nome: 'Outra' })).toThrow();
  expect(editarLista(listas, listas[1].id, { cor: '#ABCDEF' })[1].cor).toBe('#ABCDEF');
});

test('criarLista aceita hinos iniciais', async () => {
  const listas = await carregarListas(VALIDOS);
  const { lista } = criarLista(listas, { nome: 'Ceia', cor: '#000', hinos: [5] });
  expect(lista.hinos).toEqual([5]);
});

test('listas salvas com formato inválido são saneadas e Favoritos volta', async () => {
  await AsyncStorage.setItem(LISTS_KEY, JSON.stringify([
    null, 1, { id: 'x' },
    { id: 'ok', nome: 'Ok', cor: '#000', hinos: [2, 2, 9999, 'a'], fixa: false },
  ]));
  const listas = await carregarListas(VALIDOS);
  expect(listas.map(l => l.id)).toEqual([FAVORITOS_ID, 'ok']);
  expect(listas[0]).toMatchObject({ nome: 'Favoritos', fixa: true, hinos: [] });
  expect(listas[1].hinos).toEqual([2]);
});

test('lista vazia salva ainda tem Favoritos', async () => {
  await AsyncStorage.setItem(LISTS_KEY, '[]');
  const listas = await carregarListas(VALIDOS);
  expect(listas.map(l => l.id)).toEqual([FAVORITOS_ID]);
});

test('falha ao ler o armazenamento não sobrescreve os dados salvos', async () => {
  const salvas = [{ id: FAVORITOS_ID, nome: 'Favoritos', cor: '#000', hinos: [1], fixa: true }];
  await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(salvas));
  jest.spyOn(console, 'error').mockImplementationOnce(() => {});
  AsyncStorage.getItem.mockImplementationOnce(() => Promise.reject(new Error('Row too big')));
  const listas = await carregarListas(VALIDOS);
  expect(listas[0].id).toBe(FAVORITOS_ID);
  expect(JSON.parse(await AsyncStorage.getItem(LISTS_KEY))).toEqual(salvas);
});
