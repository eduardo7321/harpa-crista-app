import { light, dark } from '../src/theme/colors';

const luminancia = (hex) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

test.each([['claro', light], ['escuro', dark]])('texto sobre destaque é legível no tema %s', (_, cores) => {
  expect(contraste(cores.onAccent, cores.accent)).toBeGreaterThanOrEqual(4.5);
});
