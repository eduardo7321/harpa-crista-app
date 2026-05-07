// App.js
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
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false // ← ISSO ESCONDE TODOS OS HEADERS DO NAVIGATOR
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
        <Stack.Screen 
          name="HinoDetail" 
          component={HinoDetailScreen} 
        />
        <Stack.Screen 
          name="Favoritos" 
          component={FavoritosScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 