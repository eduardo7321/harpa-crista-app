import { parseLetra } from '../src/utils/parseLetra';
import { getHinoById, getAllHinos } from '../src/services/hinoService';

test('hino 1: estrofe, coro, estrofe', () => {
  const b = parseLetra(getHinoById(1).letra);
  expect(b[0]).toEqual({
    tipo: 'estrofe',
    numero: '1',
    linhas: ['Deus prometeu com certeza', 'Chuvas de graça mandar;', 'Ele nos dá fortaleza,', 'E ricas bênçãos sem par'],
  });
  expect(b[1].tipo).toBe('coro');
  expect(b[1].linhas[0]).toBe('Chuvas de graça,');
  expect(b[1].linhas[3]).toBe('Chuvas do Consolador.');
  expect(b[2].numero).toBe('2');
});

test('** não fechado vira coro até o fim', () => {
  expect(parseLetra('1\nA\n**B\nC')).toEqual([
    { tipo: 'estrofe', numero: '1', linhas: ['A'] },
    { tipo: 'coro', linhas: ['B', 'C'] },
  ]);
});

test('coro na mesma linha', () => {
  expect(parseLetra('**Só coro**')).toEqual([{ tipo: 'coro', linhas: ['Só coro'] }]);
});

test('linhas antes do primeiro número ficam numa estrofe sem número', () => {
  expect(parseLetra('Intro\n1\nA')).toEqual([
    { tipo: 'estrofe', numero: null, linhas: ['Intro'] },
    { tipo: 'estrofe', numero: '1', linhas: ['A'] },
  ]);
});

test('todos os 640 hinos parseiam sem perder texto', () => {
  for (const h of getAllHinos()) {
    const b = parseLetra(h.letra);
    expect(b.length).toBeGreaterThan(0);
    const texto = b.flatMap(x => x.linhas).join('');
    const original = h.letra.replace(/\*\*/g, '').split('\n').map(l => l.trim()).filter(l => l && !/^\d+$/.test(l)).join('');
    expect(texto).toBe(original);
  }
});
