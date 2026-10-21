import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAllHinos } from '../services/hinoService';
import {
  carregarListas, salvarListas, toggleHino as toggle, criarLista, editarLista, excluirLista,
  listasDoHino as doHino, FAVORITOS_ID,
} from '../services/listService';

const ListsContext = createContext(null);

export function ListsProvider({ children }) {
  const [listas, setListas] = useState(null);

  useEffect(() => {
    const ids = new Set(getAllHinos().map(hino => hino.id));
    carregarListas(ids).then(setListas);
  }, []);

  // Aplica a mudança, guarda no estado e persiste
  const aplicar = useCallback((novas) => {
    setListas(novas);
    salvarListas(novas);
  }, []);

  const valor = useMemo(() => {
    if (!listas) return null;
    return {
      listas,
      toggleHino: (listaId, hinoId) => aplicar(toggle(listas, listaId, hinoId)),
      criar: (dados) => {
        const { listas: novas, lista } = criarLista(listas, dados);
        aplicar(novas);
        return lista;
      },
      editar: (id, patch) => aplicar(editarLista(listas, id, patch)),
      excluir: (id) => aplicar(excluirLista(listas, id)),
      listasDoHino: (hinoId) => doHino(listas, hinoId),
      isFavorito: (hinoId) => listas.find(l => l.id === FAVORITOS_ID)?.hinos.includes(hinoId) ?? false,
    };
  }, [listas, aplicar]);

  if (!valor) return null;

  return <ListsContext.Provider value={valor}>{children}</ListsContext.Provider>;
}

export const useLists = () => useContext(ListsContext);
