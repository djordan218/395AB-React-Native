import React, { useContext, useState, useEffect } from 'react';
import { View } from 'react-native-animatable';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import Home from './Home';
import FAQScreen from './FAQScreen';
import Profile from './Profile';
import NewsletterScreen from './NewsletterScreen';
import CommonLinks from './CommonLinks';
import CommonContacts from './CommonContacts';
import Roster from './Roster';
import Schedule from './Schedule';
import TaskManagement from './TaskManagement';
import Tasks from './Tasks';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Image } from 'react-native';
import UserContext from '../../hooks/UserContext';
import * as RankImage from '../components/RankImages';
import SoldierManagement from './SoldierManagement';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../hooks/supabase';
import { Session } from '@supabase/supabase-js';
import WebView from 'react-native-webview';

const Drawer = createDrawerNavigator();

function CustomDrawer(props) {
  const { userData, setSignedIn, userRankImage, displayName } =
    useContext(UserContext);
  const navigation = useNavigation();

  return (
    <DrawerContentScrollView {...props}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
        }}
      >
        <DrawerItem
          label=""
          style={{ color: 'black' }}
          icon={() => (
            <MaterialCommunityIcons
              name="account-edit"
              size={24}
              color="black"
            />
          )}
          onPress={() => navigation.navigate('Profile')}
        />
        {JSON.parse(userData).isAdmin ? (
          <View
            style={{
              color: 'black',
              flex: 1,
              alignItems: 'flex-end',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <MaterialCommunityIcons
              name="check-decagram"
              size={24}
              color="#d90532"
            />
          </View>
        ) : null}
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
          marginTop: -20,
        }}
      >
        <Image
          source={RankImage[`${userRankImage}`]}
          style={{ width: 125, height: 125, margin: 10 }}
          resizeMode="contain"
        />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 20,
            color: 'black',
            marginBottom: 10,
          }}
        >
          {displayName}
        </Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        labelStyle={{ color: 'black', fontWeight: 'bold' }}
        style={{ color: 'black' }}
        icon={() => (
          <MaterialCommunityIcons name="logout" size={24} color="black" />
        )}
        onPress={() => {
          Alert.alert('Log out', 'Are you sure you want to log out?', [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: () => {
                AsyncStorage.removeItem('395soldier');
                setSignedIn(false);
              },
            },
          ]);
        }}
      />
    </DrawerContentScrollView>
  );
}

const isAdmin = () => {
  const {
    homeWebViewValue,
    setHomeWebViewValue,
    scheduleWebViewValue,
    setScheduleWebViewValue,
    newsletterWebViewValue,
    setNewsletterWebViewValue,
  } = useContext(UserContext);
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerTintColor: 'black',
        drawerStyle: {
          backgroundColor: 'white',
          borderRightColor: 'black',
          borderRightWidth: StyleSheet.hairlineWidth,
        },
        drawerLabelStyle: {
          fontWeight: 'bold',
          color: 'black',
        },
        drawerActiveTintColor: '#554d07',
      }}
    >
      <Drawer.Screen
        name="395th Army Band"
        component={Home}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons name="home" size={24} color="black" />
          ),
          drawerLabel: 'Home',
          headerStyle: {
            height: 100,
          },
          headerTitle: '',
          headerRight: () => {
            return (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  setHomeWebViewValue(homeWebViewValue + 1);
                }}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Drawer.Screen
        name="My Tasks"
        component={Tasks}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'My Tasks',
          headerStyle: {
            height: 100,
          },
          headerTitle: '',
          headerRight: () => {
            return (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  setHomeWebViewValue(homeWebViewValue + 1);
                }}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Drawer.Screen
        name="Schedule"
        component={Schedule}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons name="calendar" size={24} color="black" />
          ),
          drawerLabel: 'Schedule',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
          headerRight: () => {
            return (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  setScheduleWebViewValue(scheduleWebViewValue + 1);
                }}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Drawer.Screen
        name="NewsletterScreen"
        component={NewsletterScreen}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="newspaper-variant-outline"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'Newsletter',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
          headerRight: () => {
            return (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  setNewsletterWebViewValue(newsletterWebViewValue + 1);
                }}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Drawer.Screen
        name="Roster"
        component={Roster}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons name="contacts" size={24} color="black" />
          ),
          drawerLabel: 'Unit Roster',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
        }}
      />
      <Drawer.Screen
        name="CommonLinks"
        component={CommonLinks}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="link-variant"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'Common Links',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
        }}
      />
      <Drawer.Screen
        name="CommonContacts"
        component={CommonContacts}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="card-account-phone"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'Common Contacts',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
        }}
      />
      <Drawer.Screen
        name="FAQScreen"
        component={FAQScreen}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="message-question-outline"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'FAQ',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          drawerItemStyle: { display: 'none' },
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="account-circle"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'Edit Profile',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
        }}
      />
      <Drawer.Screen
        name="Task Management"
        component={TaskManagement}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="clipboard-account-outline"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'Task Management',
          headerStyle: {
            height: 100,
          },
          headerTitle: '',
          headerRight: () => {
            return (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  setHomeWebViewValue(homeWebViewValue + 1);
                }}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Drawer.Screen
        name="Soldier Management"
        component={SoldierManagement}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons name="human-edit" size={24} color="black" />
          ),
          drawerLabel: 'Soldier Management',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
        }}
      />
    </Drawer.Navigator>
  );
};

const isNotAdmin = () => {
  const {
    homeWebViewValue,
    setHomeWebViewValue,
    scheduleWebViewValue,
    setScheduleWebViewValue,
    newsletterWebViewValue,
    setNewsletterWebViewValue,
  } = useContext(UserContext);

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerTintColor: 'black',
        drawerStyle: {
          backgroundColor: 'white',
          borderRightColor: 'black',
          borderRightWidth: StyleSheet.hairlineWidth,
        },
        drawerLabelStyle: {
          fontWeight: 'bold',
          color: 'black',
        },
        drawerActiveTintColor: '#554d07',
      }}
    >
      <Drawer.Screen
        name="395th Army Band"
        component={Home}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons name="home" size={24} color="black" />
          ),
          drawerLabel: 'Home',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
          headerRight: () => {
            return (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  setHomeWebViewValue(homeWebViewValue + 1);
                }}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Drawer.Screen
        name="Schedule"
        component={Schedule}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons name="calendar" size={24} color="black" />
          ),
          drawerLabel: 'Schedule',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
          headerRight: () => {
            return (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  setScheduleWebViewValue(scheduleWebViewValue + 1);
                }}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Drawer.Screen
        name="NewsletterScreen"
        component={NewsletterScreen}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="newspaper-variant-outline"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'Newsletter',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
          headerRight: () => {
            return (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  setNewsletterWebViewValue(newsletterWebViewValue + 1);
                }}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Drawer.Screen
        name="Roster"
        component={Roster}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons name="contacts" size={24} color="black" />
          ),
          drawerLabel: 'Unit Roster',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
        }}
      />
      <Drawer.Screen
        name="CommonLinks"
        component={CommonLinks}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="link-variant"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'Common Links',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
        }}
      />
      <Drawer.Screen
        name="CommonContacts"
        component={CommonContacts}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="card-account-phone"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'Common Contacts',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
        }}
      />
      <Drawer.Screen
        name="FAQScreen"
        component={FAQScreen}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="message-question-outline"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'FAQ',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          drawerItemStyle: { display: 'none' },
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="account-circle"
              size={24}
              color="black"
            />
          ),
          drawerLabel: 'Edit Profile',
          headerStyle: {
            height: 100,
            borderBottomWidth: 2,
          },
          headerTitle: '',
        }}
      />
    </Drawer.Navigator>
  );
};

export default function AppStack() {
  const { userData } = useContext(UserContext);
  const soldierData = JSON.parse(userData);

  if (soldierData.isAdmin) {
    return isAdmin();
  } else {
    return isNotAdmin();
  }
}
