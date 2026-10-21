import hinosData from '../data/hinos.json';
import { normalize } from '../utils/normalize';

// Hinos em ordem numérica, com título e letra já normalizados para a busca
const hinos = [...hinosData].sort((a, b) => a.numero - b.numero);
const indice = hinos.map(hino => ({
  hino,
  numero: String(hino.numero),
  titulo: normalize(hino.titulo),
  letra: normalize(hino.letra?.replace(/\*\*/g, '')),
}));
const porId = new Map(hinos.map(hino => [hino.id, hino]));

export const getAllHinos = () => {
  return hinos;
};

export const getHinoById = (id) => {
  return porId.get(id);
};

export const getHinoByNumero = (numero) => {
  const num = parseInt(numero);
  return hinos.find(hino => hino.numero === num);
};

// Hino anterior (-1) ou próximo (1), dando a volta no fim e no começo
export const getHinoVizinho = (numero, delta) => {
  const pos = hinos.findIndex(hino => hino.numero === numero);
  return hinos[(pos + delta + hinos.length) % hinos.length];
};

// Ordem: número exato, números que contêm o texto, título, e por último a letra
export const searchHinos = (query) => {
  const q = normalize(query);
  if (!q) return hinos;

  const exato = [];
  const numero = [];
  const titulo = [];
  const letra = [];
  const soDigitos = /^\d+$/.test(q);

  for (const item of indice) {
    if (soDigitos && item.numero === q) exato.push(item.hino);
    else if (item.numero.includes(q)) numero.push(item.hino);
    else if (item.titulo.includes(q)) titulo.push(item.hino);
    else if (item.letra.includes(q)) letra.push(item.hino);
  }

  return [...exato, ...numero, ...titulo, ...letra];
};
