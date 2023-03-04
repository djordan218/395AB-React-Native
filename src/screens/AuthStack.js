import React, {useEffect, useState, createContext} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthScreen from './AuthScreen';
import {StatusBar} from 'react-native';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <>
      <Stack.Navigator>
        <Stack.Screen
          name="AuthScreen"
          component={AuthScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </>
  );
}
