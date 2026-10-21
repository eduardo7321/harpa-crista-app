import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { carregarAjustes, salvarAjustes } from '../services/settingsService';
import { light, dark } from '../theme/colors';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    carregarAjustes().then(setSettings);
  }, []);

  const atualizar = useCallback((parcial) => {
    setSettings(atual => {
      const novo = { ...atual, ...parcial };
      salvarAjustes(novo);
      return novo;
    });
  }, []);

  const valor = useMemo(() => ({ settings, atualizar }), [settings, atualizar]);

  if (!settings) return null;

  return <SettingsContext.Provider value={valor}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);

export const useTheme = () => {
  const { settings } = useSettings();
  const sistema = useColorScheme();
  const escuro = settings.tema === 'escuro' || (settings.tema === 'sistema' && sistema === 'dark');
  return { cores: escuro ? dark : light, escuro };
};
