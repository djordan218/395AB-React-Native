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
    isAdmin: '',
  });
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

  // checking users table and saving all to state
  const saveRosterToState = async () => {
    await supabase
      .from('users')
      .select(
        `id, civEmail, milEmail, rank, firstName, lastName, phone, isAdmin`
      )
      .order('lastName', { ascending: true })
      .then((response) => {
        setUnitRoster(response.data);
      });
  };

  // saves FAQ questions to state - from DB
  const saveFAQDataToState = async () => {
    await supabase
      .from('faq')
      .select(`id, question, answer, category`)
      .order('category', { ascending: true })
      .then((response) => {
        setFAQData(response.data);
      });
  };

  // saves email roster to state - from DB
  const saveEmailRosterToState = async () => {
    await supabase
      .from('emailRoster')
      .select(`id, civEmail, milEmail, firstName, lastName`)
      .order('lastName', { ascending: true })
      .then((response) => {
        setEmailRoster(response.data);
      });
  };

  // saves email roster to state - from DB
  const saveCommonContactsToState = async () => {
    await supabase
      .from('common_contacts')
      .select(`id, contact, description, website, email, phone`)
      .order('contact', { ascending: true })
      .then((response) => {
        setCommonContacts(response.data);
      });
  };

  // saves tasks assigned to user to state - from DB
  // const saveTasksToState = async (soldier) => {
  //   const id = JSON.parse(soldier).id;
  //   await supabase
  //     .from('tasks')
  //     .select(`task, description, status, created_at`)
  //     .eq('soldier_id', id)
  //     .then((response) => {
  //       setUserTasks(response.data);
  //     });
  // };

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

  useEffect(() => {
    console.log('running session useEffect');
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // if '395soldier' is in AsyncStorage
  // saves FAQ data & sets to state
  // saves email roster & sets to state
  // formats display name & sets to state
  // formats user rank & sets to state
  // sets signed in = true
  const loadData = async () => {
    console.log('running useeffect');
    setInfoLoaded(false);
    try {
      const soldierData = await AsyncStorage.getItem('395soldier');
      if (soldierData !== null || undefined || '') {
        try {
          console.log('running with soldier data');
          saveRosterToState();
          saveFAQDataToState();
          saveEmailRosterToState();
          saveCommonContactsToState();
          formatDisplayName(soldierData);
          formatUserRank(soldierData);
          await supabase
            .from('users')
            .select()
            .eq('civEmail', JSON.parse(soldierData).civEmail)
            .then((response) => {
              const soldier = JSON.stringify(response.data[0]);
              if (soldier !== undefined) {
                setUserData(soldier);
                // saveTasksToState(soldier);
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
        setUserData(null);
        console.log('no soldier data');
      }
    } catch (e) {
      console.log(e);
    }
    setInfoLoaded(true);
  };

  useEffect(() => {
    loadData();
  }, [signedIn, userData]);

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
          ></ActivityIndicator>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <StatusBar animated={true} barStyle={'dark-content'} />
      <UserContext.Provider
        value={{
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
        }}
      >
        <NavigationContainer>
          {!signedIn ? <AuthStack /> : <AppStack />}
        </NavigationContainer>
      </UserContext.Provider>
    </PaperProvider>
  );
}
