// Converte a letra do hino em blocos de estrofe e coro.
// Formato: uma linha só com dígitos inicia a estrofe; o coro fica entre **...**
export const parseLetra = (letra) => {
  const blocos = [];
  let atual = null;
  let dentroCoro = false;

  const abrir = (bloco) => {
    atual = bloco;
    blocos.push(bloco);
  };

  const adicionar = (texto, coro) => {
    const linha = texto.trim();
    if (!linha) return;
    if (coro) {
      if (atual?.tipo !== 'coro') abrir({ tipo: 'coro', linhas: [] });
    } else if (!atual || atual.tipo === 'coro') {
      abrir({ tipo: 'estrofe', numero: null, linhas: [] });
    }
    atual.linhas.push(linha);
  };

  for (const bruta of (letra || '').split('\n')) {
    const linha = bruta.trim();
    if (!linha) continue;

    if (!dentroCoro && /^\d+$/.test(linha)) {
      abrir({ tipo: 'estrofe', numero: linha, linhas: [] });
      continue;
    }

    const partes = linha.split('**');
    partes.forEach((parte, i) => {
      if (i > 0) dentroCoro = !dentroCoro;
      adicionar(parte, dentroCoro);
    });
  }

  return blocos.filter(bloco => bloco.linhas.length > 0);
};
