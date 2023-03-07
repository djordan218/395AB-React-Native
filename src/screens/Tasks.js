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
  Dimensions,
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
  const { userData, setUserData, userTasks, setUserTasks, setUnitRoster } =
    React.useContext(UserContext);

  // this updates a task
  // queries and edits the userTask state in case the user edited their own task
  // then queries and edits Unit Roster state to update the roster with completed task
  async function updateTask(task) {
    await supabase
      .from('tasks')
      .update({
        status: !task.status,
      })
      .eq('id', task.id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
      });
    await supabase
      .from('users')
      .select('*, tasks:tasks(*)')
      .eq('id', JSON.parse(userData).id)
      .order('id', { foreignTable: 'tasks', ascending: true })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        const soldier = JSON.stringify(response.data[0]);
        setUserTasks(JSON.parse(soldier).tasks);
      });
    await supabase
      .from('users')
      .select('*, tasks:tasks(*)')
      .order('lastName', { ascending: true })
      .order('id', { foreignTable: 'tasks', ascending: true })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        setUnitRoster(response.data);
      });
  }

  // formatting date from YYYY-MM-DD to MM/DD/YYYY
  function formatDate(d) {
    const date = new Date(d).toLocaleDateString('en-US', { timeZone: 'UTC' });
    return date;
  }

  // needed this to set the height of window for ternary operator when a user doesn't have a task it displays text info
  const { width, height } = Dimensions.get('window');

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
              backgroundColor: 'white',
              margin: -8,
            }}
          />
          <List.Subheader
            numberOfLines={100}
            style={{
              color: 'black',
              backgroundColor: 'white',
              textAlign: 'center',
              marginTop: -15,
            }}
          >
            When you have completed the task, press the checkbox (it will turn
            green) to let your leaders know it has been completed.
          </List.Subheader>
        </View>

        {userTasks == 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
              height: height,
            }}
          >
            <MaterialCommunityIcons
              size={50}
              name={'music-note'}
              color="#554d07"
            />
            <Text
              style={{ fontSize: 20, fontWeight: 'bold', marginBottom: '100%' }}
            >
              You have no tasks! Good job!
            </Text>
          </View>
        ) : (
          userTasks.map((t) => (
            <TouchableOpacity
              key={t.task}
              onPress={() => {
                if (t.status === false) {
                  Alert.alert(
                    'Update task as completed?',
                    'Are you sure you want to update this task as completed?',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {
                        text: 'Mark Complete',
                        onPress: async () => {
                          updateTask(t);
                        },
                      },
                    ]
                  );
                } else {
                  Alert.alert(
                    'Mark as incomplete?',
                    'Are you sure you want to update this task to incomplete?',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {
                        text: 'Mark Incomplete',
                        onPress: async () => {
                          updateTask(t);
                        },
                      },
                    ]
                  );
                }
              }}
            >
              <List.Item
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
                description={() => {
                  return (
                    <View>
                      <Text
                        style={{
                          color: 'grey',
                          fontWeight: 300,
                          fontSize: 12,
                          marginTop: 5,
                          textAlign: 'center',
                        }}
                      >
                        Task added on {formatDate(t.created_at)} by{' '}
                        {t.added_by || 'unknown'}
                      </Text>
                      {t.status ? (
                        <Text
                          style={{
                            color: '#554d07',
                            fontWeight: 300,
                            fontSize: 12,
                            marginTop: 5,
                            textAlign: 'center',
                          }}
                        >
                          Marked complete on {formatDate(t.completed_on)}
                        </Text>
                      ) : null}
                    </View>
                  );
                }}
                left={() => {
                  return (
                    <TouchableOpacity
                      style={{
                        justifyContent: 'center',
                        padding: 5,
                        marginLeft: 5,
                      }}
                      onPress={() => {
                        if (t.status === false) {
                          Alert.alert(
                            'Update task as completed?',
                            'Are you sure you want to update this task as completed?',
                            [
                              {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                              },
                              {
                                text: 'Mark Complete',
                                onPress: async () => {
                                  updateTask(t);
                                },
                              },
                            ]
                          );
                        } else {
                          Alert.alert(
                            'Mark as incomplete?',
                            'Are you sure you want to update this task to incomplete?',
                            [
                              {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                              },
                              {
                                text: 'Mark Incomplete',
                                onPress: async () => {
                                  updateTask(t);
                                },
                              },
                            ]
                          );
                        }
                      }}
                    >
                      <List.Icon
                        icon="clipboard-check"
                        color={t.status ? '#554d07' : '#d90532'}
                      />
                    </TouchableOpacity>
                  );
                }}
                title={t.task}
              ></List.Item>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  completeTask: {
    backgroundColor: '#5e5601',
    width: 200,
    marginTop: 10,
  },
  incompleteTask: {
    backgroundColor: 'gray',
    width: 200,
    marginTop: 10,
  },
});
