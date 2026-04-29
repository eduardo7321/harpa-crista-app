import hinosData from '../data/hinos.json';

export const getAllHinos = () => {
  return hinosData;
};

export const getHinoByNumero = (numero) => {
  const num = parseInt(numero);
  return hinosData.find(hino => hino.numero === num);
};

export const searchHinos = (query) => {
  if (!query) return hinosData;
  const lowerQuery = query.toLowerCase();
  return hinosData.filter(hino => 
    hino.titulo.toLowerCase().includes(lowerQuery) ||
    hino.numero.toString().includes(lowerQuery)
  );
};