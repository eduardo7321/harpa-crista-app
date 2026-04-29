import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import HinoDetailScreen from './src/screens/HinoDetailScreen';
import FavoritosScreen from './src/screens/FavoritosScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Harpa Cristã' }}
        />
        <Stack.Screen 
          name="HinoDetail" 
          component={HinoDetailScreen} 
          options={{ title: 'Letra do Hino' }}
        />
        <Stack.Screen 
          name="Favoritos" 
          component={FavoritosScreen} 
          options={{ title: 'Meus Favoritos' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}