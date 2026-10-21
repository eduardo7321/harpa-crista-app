// Normaliza texto para comparações: sem acentos, minúsculo e com espaços simples
export const normalize = (str) => {
  if (str == null) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};
