import React, { useContext, useEffect, useState, useCallback } from 'react';
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
  RefreshControl,
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
import Dialog from 'react-native-dialog';

export default function Tasks() {
  const {
    userData,
    setUserData,
    userTasks,
    setUserTasks,
    setUnitRoster,
    displayName,
  } = React.useContext(UserContext);
  const [visibleTask, setVisibleTask] = useState(false);
  const showModalTask = () => setVisibleTask(true);
  const hideModalTask = () => setVisibleTask(false);
  const [modalData, setModalData] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // queries database, updates user tasks
  const refreshTasks = async () => {
    await supabase
      .from('users')
      .select('*, tasks:tasks(*)')
      .eq('civEmail', JSON.parse(userData).civEmail)
      .order('id', { foreignTable: 'tasks', ascending: true })
      .then((response) => {
        const soldier = JSON.stringify(response.data[0]);
        setUserTasks(JSON.parse(soldier).tasks);
      });
  };

  // handles pull to refresh - updates user tasks
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshTasks();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleDelete = () => {
    console.log('deleted');
    // The user has pressed the "Delete" button, so here you can do your own logic.
    // ...Your logic
    setVisible(false);
  };

  // this updates a task
  // queries and edits the userTask state in case the user edited their own task
  // then queries and edits Unit Roster state to update the roster with completed task
  async function updateTask(task) {
    await supabase
      .from('tasks')
      .update({
        status: !task.status,
        completed_on: new Date().toLocaleDateString(),
        completed_by: displayName,
        soldier_response: task.response,
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

  // this updates a task as INCOMPLETE, marks other columns as null
  // queries and edits the userTask state in case the user edited their own task
  // then queries and edits Unit Roster state to update the roster with completed task
  async function incompleteTask(task) {
    await supabase
      .from('tasks')
      .update({
        status: !task.status,
        completed_on: null,
        completed_by: null,
        soldier_response: null,
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

  const TaskResponseSchema = Yup.object().shape({
    response: Yup.string().required('Response is required'),
  });

  return (
    <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Portal>
          <Modal
            visible={visibleTask}
            onDismiss={hideModalTask}
            contentContainerStyle={{
              height: 300,
            }}
          >
            <Formik
              initialValues={{
                id: modalData.id,
                task: modalData.task,
                status: modalData.status,
                response: '',
              }}
              onSubmit={(values) => {
                updateTask(values);
                hideModalTask();
              }}
              validationSchema={TaskResponseSchema}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ errors, handleChange, handleSubmit, values }) => (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <ScrollView
                    enableOnAndroid={true}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 'bold',
                        marginBottom: 10,
                        color: 'black',
                        fontSize: 18,
                      }}
                    >
                      Respond to Task
                    </Text>
                    <Text
                      style={{
                        color: 'black',
                        fontSize: 15,
                      }}
                    >
                      {modalData.task}
                    </Text>

                    <View>
                      <TextInput
                        style={{
                          width: 300,
                          maxHeight: 200,
                          backgroundColor: 'white',
                          color: 'black',
                          textAlign: 'auto',
                        }}
                        multiline={true}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Response"
                        placeholder="required"
                        placeholderTextColor="grey"
                        value={values.response}
                        onChangeText={handleChange('response')}
                      />
                    </View>
                    {errors.response && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.response}
                      </Text>
                    )}
                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      title="Submit"
                      labelStyle={{ fontWeight: 'bold', color: 'white' }}
                      style={{
                        backgroundColor: '#5e5601',
                        width: 200,
                        borderColor: 'black',
                        borderWidth: 1,
                        marginTop: 10,
                      }}
                    >
                      Complete Task
                    </Button>
                    <TouchableOpacity onPress={hideModalTask}>
                      <MaterialCommunityIcons
                        style={{ marginTop: 20 }}
                        name="close-circle-outline"
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                  </ScrollView>
                </TouchableWithoutFeedback>
              )}
            </Formik>
          </Modal>
        </Portal>
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
            When you have completed the task, press on the task to change the{' '}
            <MaterialCommunityIcons
              name="clipboard-remove"
              size={15}
              color="#d90532"
            />{' '}
            to{' '}
            <MaterialCommunityIcons
              name="clipboard-check"
              size={15}
              color="#554d07"
            />{' '}
            to let your leaders know it has been completed.
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
            <View style={{ flexDirection: 'row', gap: -10 }}>
              <MaterialCommunityIcons
                size={50}
                name={'music-note'}
                color="#554d07"
              />
              <MaterialCommunityIcons
                size={50}
                name={'music'}
                color="#d90532"
              />
              <MaterialCommunityIcons
                size={50}
                name={'music-note'}
                color="#ffcf2d"
              />
            </View>
            <Text
              style={{ fontSize: 20, fontWeight: 'bold', marginBottom: '120%' }}
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
                    'Do you want to leave a response?',
                    'This will display under your task once marked complete.',
                    [
                      {
                        text: 'No',
                        onPress: () => updateTask(t),
                        style: 'cancel',
                      },
                      {
                        text: 'Leave response',
                        onPress: async () => {
                          setModalData(t);
                          showModalTask();
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
                          incompleteTask(t);
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
                  textAlign: 'left',
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
                          textAlign: 'left',
                        }}
                      >
                        Added by {t.added_by || 'unknown'} on{' '}
                        {formatDate(t.created_at)}
                      </Text>
                      {t.status ? (
                        <Text
                          style={{
                            color: '#554d07',
                            fontWeight: 300,
                            fontSize: 12,
                            marginTop: 5,
                            textAlign: 'left',
                          }}
                        >
                          Completed by {t.completed_by} on{' '}
                          {formatDate(t.completed_on)}
                        </Text>
                      ) : null}
                      {t.soldier_response ? (
                        <Text
                          style={{
                            color: 'black',
                            fontWeight: 300,
                            fontSize: 12,
                            marginTop: 5,
                            textAlign: 'left',
                          }}
                        >
                          Response: "{t.soldier_response}"
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
                          setModalData(t);
                          showModalTask();
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
                                  incompleteTask(t);
                                },
                              },
                            ]
                          );
                        }
                      }}
                    >
                      <List.Icon
                        icon={t.status ? 'clipboard-check' : 'clipboard-remove'}
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
