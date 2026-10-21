import { normalize } from '../src/utils/normalize';

test('remove acentos, caixa e espaços extras', () => {
  expect(normalize('  Chuvas de GRAÇA ')).toBe('chuvas de graca');
  expect(normalize('Ó  Desce   Fogo')).toBe('o desce fogo');
  expect(normalize(undefined)).toBe('');
});
