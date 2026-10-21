import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/SettingsContext';
import HomeScreen from '../screens/HomeScreen';
import HinoDetailScreen from '../screens/HinoDetailScreen';
import ListasScreen from '../screens/ListasScreen';
import ListaDetailScreen from '../screens/ListaDetailScreen';
import AjustesScreen from '../screens/AjustesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ICONES = {
  Hinos: 'book-outline',
  Listas: 'bookmarks-outline',
  Ajustes: 'settings-outline',
};

function Tabs() {
  const { cores } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: cores.accent,
        tabBarInactiveTintColor: cores.muted,
        tabBarStyle: { backgroundColor: cores.card, borderTopColor: cores.line },
        tabBarIcon: ({ color, size }) => <Ionicons name={ICONES[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Hinos" component={HomeScreen} options={{ tabBarLabel: 'Hinos' }} />
      <Tab.Screen name="Listas" component={ListasScreen} options={{ tabBarLabel: 'Minhas listas' }} />
      <Tab.Screen name="Ajustes" component={AjustesScreen} options={{ tabBarLabel: 'Ajustes' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { cores, escuro } = useTheme();
  const base = escuro ? DarkTheme : DefaultTheme;
  const tema = {
    ...base,
    colors: {
      ...base.colors,
      primary: cores.accent,
      background: cores.bg,
      card: cores.card,
      text: cores.text,
      border: cores.line,
    },
  };

  return (
    <NavigationContainer theme={tema}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="HinoDetail" component={HinoDetailScreen} />
        <Stack.Screen name="ListaDetail" component={ListaDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
