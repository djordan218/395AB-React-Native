import React, { useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StatusBar } from 'react-native';

const Drawer = createDrawerNavigator();

// login and register forms
export default function AuthScreen() {
  return (
    <>
      <Drawer.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerTintColor: 'black',
          drawerStyle: {
            backgroundColor: 'white',
          },
          drawerLabelStyle: {
            fontWeight: 'bold',
          },
          drawerActiveTintColor: 'black',
        }}
      >
        <Drawer.Screen
          name="Login"
          options={{
            headerTitle: '',
            drawerIcon: () => (
              <MaterialCommunityIcons name="login" size={24} color="black" />
            ),
          }}
          component={LoginForm}
        />
        <Drawer.Screen
          name="Register"
          options={{
            headerTitle: '',
            drawerIcon: () => (
              <MaterialCommunityIcons name="trumpet" size={24} color="black" />
            ),
          }}
          component={RegisterForm}
        />
      </Drawer.Navigator>
    </>
  );
}
