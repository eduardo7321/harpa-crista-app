// App.js
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider, useTheme } from './src/context/SettingsContext';
import { ListsProvider } from './src/context/ListsContext';
import AppNavigator from './src/navigation/AppNavigator';

function ThemedStatusBar() {
  const { escuro } = useTheme();
  return <StatusBar style={escuro ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ListsProvider>
          <ThemedStatusBar />
          <AppNavigator />
        </ListsProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
