import React, { useEffect, useState, createContext, useContext } from 'react';
import { View, ActivityIndicator, StatusBar, Alert } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './src/screens/AuthStack';
import AppStack from './src/screens/AppStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserContext from './hooks/UserContext';
import { supabase } from './hooks/supabase';
import { Session } from '@supabase/supabase-js';
import SoldierManagement from './src/screens/SoldierManagement';
import 'react-native-gesture-handler';
import { checkPluginState } from 'react-native-reanimated/lib/reanimated2/core';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [userData, setUserData] = useState({
    id: '',
    civEmail: '',
    milEmail: '',
    password: '',
    rank: '',
    firstName: '',
    lastName: '',
    phone: '',
    dod_id: '',
    isAdmin: '',
    isLeader: '',
    pushToken: '',
  });
  const [expoPushToken, setExpoPushToken] = useState('');
  const [unitRoster, setUnitRoster] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [userRankImage, setUserRankImage] = useState('');
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [FAQData, setFAQData] = useState(null);
  const [emailRoster, setEmailRoster] = useState(null);
  const [commonContacts, setCommonContacts] = useState(null);
  const [session, setSession] = useState(null);
  const [homeWebViewValue, setHomeWebViewValue] = useState(1);
  const [scheduleWebViewValue, setScheduleWebViewValue] = useState(1);
  const [newsletterWebViewValue, setNewsletterWebViewValue] = useState(1);
  const [userTasks, setUserTasks] = useState('');
  const [userEbdls, setUserEbdls] = useState('');
  const [userRmas, setUserRmas] = useState('');
  const [userRsts, setUserRsts] = useState('');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // checking users table and saving all to state
  const saveRosterToState = async () => {
    await supabase
      .from('users')
      .select('*, tasks:tasks(*)')
      .order('lastName', { ascending: true })
      .order('id', { foreignTable: 'tasks', ascending: true })
      .then((response) => {
        setUnitRoster(response.data);
      });
  };

  // saves FAQ questions to state - from DB
  const saveFAQDataToState = async () => {
    await supabase
      .from('faq')
      .select()
      .order('category', { ascending: true })
      .then((response) => {
        setFAQData(response.data);
      });
  };

  // saves email roster to state - from DB
  const saveEmailRosterToState = async () => {
    await supabase
      .from('emailRoster')
      .select()
      .order('lastName', { ascending: true })
      .then((response) => {
        setEmailRoster(response.data);
      });
  };

  // saves email roster to state - from DB
  const saveCommonContactsToState = async () => {
    await supabase
      .from('common_contacts')
      .select()
      .order('contact', { ascending: true })
      .then((response) => {
        setCommonContacts(response.data);
      });
  };

  // formats display name "SFC Daniel Jordan"
  const formatDisplayName = (soldierData) => {
    const displayName =
      JSON.parse(soldierData).rank +
      ' ' +
      JSON.parse(soldierData).firstName +
      ' ' +
      JSON.parse(soldierData).lastName;
    setDisplayName(displayName);
  };

  // formats users rank for images in drawer & contact roster
  const formatUserRank = (soldierData) => {
    let userRank = JSON.parse(soldierData).rank;
    if (userRank == '1SG') {
      setUserRankImage('SG1');
    } else if (userRank == '1LT') {
      setUserRankImage('LT1');
    } else if (userRank == '2LT') {
      setUserRankImage('LT2');
    } else {
      setUserRankImage(userRank);
    }
  };

  // sets and loads session data from user.auth table
  // saves FAQ data & sets to state
  // saves email roster & sets to state
  useEffect(() => {
    console.log('authenticating session and loading non-user data');
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    saveRosterToState();
    saveFAQDataToState();
    saveEmailRosterToState();
    saveCommonContactsToState();
  }, []);

  // if '395soldier' is in AsyncStorage
  // formats display name & sets to state
  // formats user rank & sets to state
  // sets signed in = true
  const loadData = async () => {
    console.log('loading user data');
    setInfoLoaded(false);
    try {
      const soldierData = await AsyncStorage.getItem('395soldier');
      if (soldierData !== null || undefined || '') {
        try {
          formatDisplayName(soldierData);
          formatUserRank(soldierData);
          await supabase
            .from('users')
            .select('*, tasks:tasks(*), ebdl:ebdl(*), rma:rma(*), rst:rst(*)')
            .eq('civEmail', JSON.parse(soldierData).civEmail)
            .order('id', { foreignTable: 'tasks', ascending: true })
            .then((response) => {
              const soldier = JSON.stringify(response.data[0]);
              if (soldier !== undefined) {
                setUserData(soldier);
                setUserTasks(JSON.parse(soldier).tasks);
                setUserEbdls(JSON.parse(soldier).ebdl);
                setUserRmas(JSON.parse(soldier).rma);
                setUserRsts(JSON.parse(soldier).rst);
              } else {
                console.log('did not find the soldier..');
              }
            });
          setSignedIn(true);
        } catch (e) {
          console.log(e);
        }
      }
      if (soldierData == null) {
        AsyncStorage.clear();
        setUserData(null);
        console.log('no soldier data');
      }
    } catch (e) {
      console.log(e);
      AsyncStorage.clear();
      setUserData(null);
    }
    setInfoLoaded(true);
  };

  // runs data fetching if signedIn or userData state is changed
  useEffect(() => {
    loadData();
  }, [signedIn, userData]);

  // loading spinner
  if (!infoLoaded) {
    return (
      <PaperProvider>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator
            style={[{ backgroundColor: 'white' }]}
            color={'red'}
            size={'large'}
          />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <StatusBar animated={true} barStyle={'dark-content'} />
      <UserContext.Provider
        value={{
          infoLoaded,
          setInfoLoaded,
          userData,
          setUserData,
          setSignedIn,
          displayName,
          userRankImage,
          FAQData,
          setFAQData,
          emailRoster,
          setEmailRoster,
          commonContacts,
          setCommonContacts,
          unitRoster,
          setUnitRoster,
          loadData,
          homeWebViewValue,
          setHomeWebViewValue,
          scheduleWebViewValue,
          setScheduleWebViewValue,
          newsletterWebViewValue,
          setNewsletterWebViewValue,
          userTasks,
          setUserTasks,
          userEbdls,
          userRmas,
          userRsts,
          setUserEbdls,
          setUserRmas,
          setUserRsts,
          saveRosterToState,
          saveCommonContactsToState,
          saveEmailRosterToState,
          saveFAQDataToState,
          expoPushToken,
          setExpoPushToken,
        }}
      >
        <NavigationContainer>
          {!signedIn ? <AuthStack /> : <AppStack />}
        </NavigationContainer>
      </UserContext.Provider>
    </PaperProvider>
  );
}
