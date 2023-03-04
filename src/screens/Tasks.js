import React, { useContext, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  SafeAreaView,
  Image,
  Text,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import {
  List,
  Portal,
  Modal,
  Button,
  TextInput,
  IconButton,
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import UserContext from '../../hooks/UserContext';
import { supabase } from '../../hooks/supabase';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Tasks() {
  const { userTasks, setUserTasks } = React.useContext(UserContext);
  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <Image
            source={require('../../assets/63rd.png')}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <List.Section
            title="My Tasks!"
            titleStyle={{
              fontWeight: 'bold',
              color: 'black',
              fontSize: 20,
              textAlign: 'center',
              backgroundColor: 'white',
              margin: -8,
            }}
          />
        </View>
        {userTasks.map((t) => (
          <List.Accordion
            key={t.task}
            style={{
              borderColor: 'black',
              borderWidth: StyleSheet.hairlineWidth,
              backgroundColor: 'white',
            }}
            titleStyle={{
              color: 'black',
              fontWeight: 500,
              textAlign: 'center',
            }}
            titleNumberOfLines={100}
            left={(props) => (
              <List.Icon
                {...props}
                icon="clipboard-check-outline"
                color="black"
              />
            )}
            title={t.task}
          >
            <List.Item
              description={t.description}
              descriptionStyle={{
                color: 'black',
                marginTop: -15,
                marginLeft: -60,
                textAlign: 'center',
              }}
              descriptionNumberOfLines={100}
            />
            <TouchableOpacity
              style={{
                flex: 1,
                marginLeft: -60,
                marginBottom: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => console.log('pressed')}
            >
              <Button
                mode="contained"
                title="Submit"
                labelStyle={{ fontWeight: 'bold', color: 'white' }}
                style={{
                  backgroundColor: '#5e5601',
                  width: 200,
                }}
              >
                Mark as Complete
              </Button>
            </TouchableOpacity>
          </List.Accordion>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
