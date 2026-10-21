import { searchHinos, getHinoVizinho, getAllHinos, getHinoById } from '../src/services/hinoService';

test('número exato vem primeiro', () => {
  const r = searchHinos('15');
  expect(r[0].numero).toBe(15);
  expect(r.slice(1).every(h => String(h.numero).includes('15'))).toBe(true);
});

test('ignora acento e espaços', () => {
  expect(searchHinos('  graca ').map(h => h.numero)).toEqual(searchHinos('GRAÇA').map(h => h.numero));
  expect(searchHinos('graca')[0].titulo).toMatch(/Graça/);
});

test('título antes de letra, sem duplicados', () => {
  const r = searchHinos('consolador');
  const ids = r.map(h => h.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(r.some(h => h.numero === 1)).toBe(true); // "Consolador" aparece só na letra do hino 1
});

test('vazio retorna todos', () => {
  expect(searchHinos('   ').length).toBe(getAllHinos().length);
});

test('vizinho dá a volta', () => {
  expect(getHinoVizinho(640, 1).numero).toBe(1);
  expect(getHinoVizinho(1, -1).numero).toBe(640);
  expect(getHinoVizinho(10, 1).numero).toBe(11);
});

test('getHinoById', () => {
  expect(getHinoById(1).titulo).toBe('Chuvas de Graça');
});
