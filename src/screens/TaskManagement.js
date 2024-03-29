import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Linking,
  KeyboardAvoidingView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import qs from 'qs';
import {
  List,
  Portal,
  Modal,
  TextInput,
  Button,
  Badge,
  IconButton,
} from 'react-native-paper';
import UserContext from '../../hooks/UserContext';
import * as All from '../components/RankImages';
import DropDownPicker from 'react-native-dropdown-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../hooks/supabase';
import { Session } from '@supabase/supabase-js';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { clockRunning, useInterpolateConfig } from 'react-native-reanimated';
import LoadingScreen from './LoadingScreen';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export default function TaskManagement() {
  const {
    unitRoster,
    setUnitRoster,
    userData,
    setUserData,
    userTasks,
    setUserTasks,
    displayName,
    saveRosterToState,
  } = useContext(UserContext);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const showModalAdd = () => setVisibleAdd(true);
  const hideModalAdd = () => setVisibleAdd(false);
  const showModalEdit = () => setVisibleEdit(true);
  const hideModalEdit = () => setVisibleEdit(false);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [visibleSelectAdd, setVisibleSelectAdd] = useState(false);
  const showModalSelectAdd = () => setVisibleSelectAdd(true);
  const hideModalSelectAdd = () => setVisibleSelectAdd(false);
  const [dropdownValues, setDropdownValues] = useState(
    unitRoster.map((s) => {
      return {
        label: s.rank + ' ' + s.firstName + ' ' + s.lastName,
        value: s.id,
      };
    })
  );

  const [modalData, setModalData] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // pull to refresh functionality
  const onRefresh = useCallback(() => {
    setLoading(true);
    setRefreshing(true);
    saveRosterToState();

    setTimeout(() => {
      setRefreshing(false);
      setLoading(false);
    }, 1000);
  }, []);

  // this saves data to state to load into edit form
  const saveToModalData = (data) => {
    setModalData(data);
  };

  async function sendPushNotification(expoPushToken, task) {
    console.log(
      `sending push notification to ${expoPushToken} for ${task.task}`
    );
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'New 395th task assigned!',
      body: `${task.task} by ${task.added_by}`,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }

  // adds the task to the DB - tasks table
  // reloads the unit roster state
  // reloads user's task in case they added a task to themselves
  const addTaskToSoldier = async (values, data) => {
    let userPushToken;
    await supabase
      .from('users')
      .select()
      .eq('id', data)
      .then((response) => {
        userPushToken = JSON.stringify(response.data[0].push_token);
      });
    await supabase
      .from('tasks')
      .insert({
        task: values.task,
        status: values.status,
        created_at: values.created_at,
        soldier_id: data,
        added_by: values.added_by,
        added_by_soldier_id: values.added_by_soldier_id,
        added_by_push_token: values.added_by_push_token,
      })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
      });
    sendPushNotification(JSON.parse(userPushToken), values);
  };

  const addTaskToSelectedSoldiers = async (values, data) => {
    await values.recipients.map((s) => {
      addTaskToSoldier(values, s);
    });
  };

  const refreshUserTasks = async () => {
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
  };

  // updates the task to either true or false
  // reloads the unit roster state
  // reloads user tasks in case they updated their own task
  async function updateTask(task) {
    await supabase
      .from('tasks')
      .update({
        status: !task.status,
        completed_on: new Date().toLocaleDateString(),
        completed_by: displayName,
        soldier_response: '',
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
      .order('lastName', { ascending: true })
      .order('id', { foreignTable: 'tasks', ascending: true })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        setUnitRoster(response.data);
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
  }

  // deletes the task, updates roster and userTask state
  const deleteTask = async (id) => {
    setLoading(true);
    await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
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
    setLoading(false);
  };

  // edits task info
  // resets unit roster state
  // reloads userTask in case their edited their own task
  const editTask = async (task, id) => {
    await supabase
      .from('tasks')
      .update({
        task: task.task,
        status: task.status,
      })
      .eq('id', id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
      });
  };

  // pulls up user's native email client with pre-populated data with task
  const sendTaskEmailToSoldier = async (to, subject, body) => {
    let url = `mailto:${to}`;

    // Create email link query
    const query = qs.stringify({
      subject: subject,
      body: body,
    });

    if (query.length) {
      url += `?${query}`;
    }

    // check if we can use this link
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      throw new Error('Provided URL can not be handled');
    }

    return Linking.openURL(url);
  };

  // sets the user rank image that is left of their name
  const setImg = (rank) => {
    if (rank == '1SG') {
      return All[`SG1`];
    } else if (rank == '1LT') {
      return All[`LT1`];
    } else if (rank == '2LT') {
      return All[`LT2`];
    } else {
      return All[`${rank}`];
    }
  };

  // formats date from YYYY-MM-DD to MM/DD/YYYY
  // displayed underneath each task
  function formatDate(d) {
    const date = new Date(d).toLocaleDateString('en-US', { timeZone: 'UTC' });
    return date;
  }

  const addTaskSchema = Yup.object().shape({
    task: Yup.string().required('Task is required'),
    description: Yup.string(),
  });

  return (
    <SafeAreaView style={{ backgroundColor: 'white' }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
        <List.Section
          title="Task Management"
          titleStyle={{
            fontWeight: 'bold',
            color: 'black',
            fontSize: 20,
            textAlign: 'center',
            backgroundColor: 'white',
            marginTop: -10,
          }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignSelf: 'center',
            backgroundColor: 'white',
          }}
        >
          <IconButton
            icon="plus-circle-outline"
            iconColor={'#646c5c'}
            size={30}
            onPress={showModalSelectAdd}
            style={{ marginTop: -25, marginBottom: 5 }}
          />
        </View>
        <List.Accordion
          style={{
            borderTopColor: 'black',
            borderTopWidth: StyleSheet.hairlineWidth,
            backgroundColor: 'white',
            marginTop: -8,
            height: 50,
          }}
          titleStyle={{
            color: 'black',
            fontWeight: 700,
            textAlign: 'center',
            marginRight: -45,
          }}
          title="INSTRUCTIONS"
        >
          <List.Item
            style={{ backgroundColor: 'white', padding: 10, marginTop: -12 }}
            title={() => {
              return (
                <View style={{ backgroundColor: 'white' }}>
                  <Text
                    style={{
                      color: 'black',
                      backgroundColor: 'white',
                      textAlign: 'center',
                    }}
                  >
                    Here you can add and update tasks for individual Soldiers.
                    This will show up in their "My Tasks" section in their
                    profile. You can add a task by pressing the{' '}
                    <MaterialCommunityIcons
                      name="plus-circle"
                      size={15}
                      color="#554d07"
                    />{' '}
                    underneath their name.
                    {'\n'}
                    {'\n'}
                    You can also add a task to more than one Soldier by using a
                    dropdown menu when pressing the{' '}
                    <MaterialCommunityIcons
                      name="plus-circle-outline"
                      size={15}
                      color="#554d07"
                    />{' '}
                    above.
                    {'\n'}
                    {'\n'}Once a soldier has marked the task complete - the{' '}
                    <MaterialCommunityIcons
                      name="clipboard-remove"
                      size={15}
                      color="#d90532"
                    />{' '}
                    will turn{' '}
                    <MaterialCommunityIcons
                      name="clipboard-check"
                      size={15}
                      color="#554d07"
                    />{' '}
                    and display when it was completed and who marked it
                    complete. You will also receive a notification. {'\n'}
                    {'\n'}You can delete the task from their list at any time by
                    pressing on the{' '}
                    <MaterialCommunityIcons
                      name="trash-can"
                      size={15}
                      color="#d90532"
                    />
                    .{'\n'}
                    {'\n'}You can edit the task by clicking on the text and
                    pressing on the "Edit Task" button.{'\n'}
                    Once a task has been completed by the Soldier and no further
                    action is required, please delete the task to avoid
                    excessive clutter.
                  </Text>
                </View>
              );
            }}
          />
        </List.Accordion>
        <Portal>
          <Modal
            visible={visibleAdd}
            onDismiss={hideModalAdd}
            contentContainerStyle={{
              backgroundColor: 'white',
              height: 500,
              flex: 1,
            }}
          >
            <Formik
              initialValues={{
                task: '',
                status: false,
                added_by: displayName,
                added_by_soldier_id: JSON.parse(userData).id,
                added_by_push_token: JSON.parse(userData).push_token,
                created_at: new Date().toLocaleDateString(),
              }}
              onSubmit={async (values) => {
                hideModalAdd();
                setLoading(true);
                const soldierId = modalData.id;
                await addTaskToSoldier(values, soldierId);
                await refreshUserTasks();
                await saveRosterToState();
                setLoading(false);
              }}
              validationSchema={addTaskSchema}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ errors, handleChange, handleSubmit, values }) => (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    extraScrollHeight={80}
                    keyboardOpeningTime={0}
                    contentContainerStyle={{
                      flex: 1,
                      backgroundColor: '#fff',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                      Add Task
                    </Text>

                    <View>
                      <TextInput
                        multiline={true}
                        style={{
                          width: 300,
                          maxHeight: 200,
                          backgroundColor: 'white',
                          color: 'black',
                          textAlign: 'auto',
                        }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Enter Soldier task"
                        placeholder="Required"
                        placeholderTextColor="grey"
                        autoCompleteType="off"
                        value={values.task}
                        onChangeText={handleChange('task')}
                      />
                    </View>
                    {errors.task && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.task}
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
                      Add Task
                    </Button>
                    <TouchableOpacity onPress={hideModalAdd}>
                      <MaterialCommunityIcons
                        style={{ marginTop: 20 }}
                        name="close-circle-outline"
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                  </KeyboardAwareScrollView>
                </TouchableWithoutFeedback>
              )}
            </Formik>
          </Modal>
        </Portal>
        <Portal>
          <Modal
            visible={visibleEdit}
            onDismiss={hideModalEdit}
            contentContainerStyle={{
              backgroundColor: 'white',
              height: 500,
              flex: 1,
            }}
          >
            <Formik
              initialValues={{
                task: modalData.task,
                status: modalData.status,
              }}
              onSubmit={async (values) => {
                setLoading(true);
                hideModalEdit();
                await editTask(values, modalData.id);
                await refreshUserTasks();
                await saveRosterToState();
                setLoading(false);
              }}
              validationSchema={addTaskSchema}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ errors, handleChange, handleSubmit, values }) => (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    extraScrollHeight={80}
                    keyboardOpeningTime={0}
                    contentContainerStyle={{
                      flex: 1,
                      backgroundColor: '#fff',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                      Edit Task
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
                        label="Enter Soldier task"
                        placeholder="Required"
                        placeholderTextColor="grey"
                        autoCompleteType="off"
                        value={values.task}
                        onChangeText={handleChange('task')}
                      />
                    </View>
                    {errors.task && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.task}
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
                      Edit Task
                    </Button>
                    <TouchableOpacity onPress={hideModalEdit}>
                      <MaterialCommunityIcons
                        style={{ marginTop: 20 }}
                        name="close-circle-outline"
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                  </KeyboardAwareScrollView>
                </TouchableWithoutFeedback>
              )}
            </Formik>
          </Modal>
        </Portal>
        <Portal>
          <Modal
            visible={visibleSelectAdd}
            onDismiss={hideModalSelectAdd}
            contentContainerStyle={{
              backgroundColor: 'white',
              height: 500,
              flex: 1,
            }}
          >
            <Formik
              initialValues={{
                task: '',
                status: false,
                added_by: displayName,
                added_by_soldier_id: JSON.parse(userData).id,
                added_by_push_token: JSON.parse(userData).push_token,
                created_at: new Date().toLocaleDateString(),
                recipients: dropdownValues.map((s) => {
                  return s.value;
                }),
              }}
              onSubmit={async (values) => {
                try {
                  hideModalSelectAdd();
                  const soldierId = modalData.id;
                  setLoading(true);
                  await addTaskToSelectedSoldiers(values, soldierId);
                  setTimeout(async () => {
                    await refreshUserTasks();
                    await saveRosterToState();
                  }, 2000);
                  setValue(null);
                  setLoading(false);
                  Alert.alert('Tasks assigned.');
                } catch {
                  setLoading(false);
                }
              }}
              validationSchema={addTaskSchema}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({
                errors,
                handleChange,
                handleSubmit,
                values,
                setFieldValue,
              }) => (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    extraScrollHeight={40}
                    keyboardOpeningTime={0}
                    contentContainerStyle={{
                      flex: 1,
                      backgroundColor: '#fff',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                      Add Task
                    </Text>

                    <View>
                      <TextInput
                        multiline={true}
                        style={{
                          width: 300,
                          maxHeight: 200,
                          backgroundColor: 'white',
                          color: 'black',
                          textAlign: 'auto',
                        }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Enter Soldier task"
                        placeholder="Required"
                        placeholderTextColor="grey"
                        autoCompleteType="off"
                        value={values.task}
                        onChangeText={handleChange('task')}
                      />
                    </View>
                    {errors.task && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.task}
                      </Text>
                    )}
                    <View
                      style={{
                        width: 300,
                        backgroundColor: 'white',
                        zIndex: 300,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          textAlign: 'center',
                          marginTop: 5,
                        }}
                      >
                        Select Soldiers to add task to.{`\n`} If none are
                        selected, all are tasked.
                      </Text>
                      <DropDownPicker
                        open={open}
                        value={value}
                        items={dropdownValues}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setDropdownValues}
                        multiple={true}
                        multipleText={value && `${value.length} tasked`}
                        placeholder="Select Soldiers to assign task"
                        onSelectItem={(selectedItem) => {
                          if (selectedItem.length == 0) {
                            setFieldValue(
                              'recipients',
                              dropdownValues.map((s) => {
                                return s.value;
                              })
                            );
                          } else {
                            setFieldValue(
                              'recipients',
                              selectedItem.map((s) => {
                                return s.value;
                              })
                            );
                          }
                        }}
                        style={{ marginTop: 5, borderRadius: 3 }}
                        placeholderStyle={{ marginLeft: 5, color: 'grey' }}
                        selectedItemContainerStyle={{ marginLeft: 10 }}
                        textStyle={{ marginLeft: 5, fontSize: 15 }}
                        dropDownContainerStyle={{
                          position: 'relative',
                          top: 0,
                        }}
                        listMode="SCROLLVIEW"
                        scrollViewProps={{
                          nestedScrollEnabled: true,
                        }}
                      />
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => {
                        handleSubmit();
                      }}
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
                      Send Task & Notify
                    </Button>
                    <TouchableOpacity onPress={hideModalSelectAdd}>
                      <MaterialCommunityIcons
                        style={{ marginTop: 20 }}
                        name="close-circle-outline"
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                  </KeyboardAwareScrollView>
                </TouchableWithoutFeedback>
              )}
            </Formik>
          </Modal>
        </Portal>
        {unitRoster.map((s) => (
          <List.Accordion
            key={s.id}
            style={{
              borderColor: 'black',
              borderWidth: StyleSheet.hairlineWidth,
              backgroundColor: 'white',
            }}
            titleStyle={{
              color: 'black',
              fontWeight: 500,
            }}
            left={() => (
              <Image
                source={setImg(s.rank)}
                style={{
                  resizeMode: 'contain',
                  width: 40,
                  height: 40,
                }}
              />
            )}
            right={() => {
              if (s.tasks.length > 0) {
                return (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                    }}
                  >
                    <Badge
                      size={25}
                      style={{
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: 15,
                        backgroundColor: '#554d07',
                        marginRight: 8,
                      }}
                    >
                      {
                        s.tasks.filter((x, i) => {
                          return x.status;
                        }).length
                      }
                    </Badge>
                    <Badge
                      size={25}
                      style={{
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: 15,
                        backgroundColor: '#d90532',
                      }}
                    >
                      {
                        s.tasks.filter((x, i) => {
                          return !x.status;
                        }).length
                      }
                    </Badge>
                  </View>
                );
              } else {
                return (
                  <MaterialCommunityIcons
                    name="checkbox-marked-circle-outline"
                    size={25}
                    color="#554d07"
                  />
                );
              }
            }}
            title={s.rank + ' ' + s.firstName + ' ' + s.lastName}
          >
            {s.tasks.map((t) => {
              return (
                <List.Item
                  description={() => {
                    return (
                      <View>
                        <TouchableOpacity
                          onPress={() => {
                            saveToModalData(t);
                            showModalEdit();
                          }}
                        >
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
                              Complete by {t.completed_by || 'Soldier'} on{' '}
                              {formatDate(t.completed_on) || 'unknown'}
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
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                  key={t.id}
                  style={{
                    borderBottomColor: 'black',
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  }}
                  title={() => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          saveToModalData(t);
                          showModalEdit();
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: '500',
                            color: 'black',
                            fontSize: 15,
                            textAlign: 'left',
                          }}
                        >
                          {t.task}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                  titleNumberOfLines={100}
                  left={(props) => (
                    <TouchableOpacity
                      style={{ justifyContent: 'center' }}
                      onPress={() => {
                        Alert.alert(
                          'Update task?',
                          'Are you sure you want to update this task?',
                          [
                            {
                              text: 'Cancel',
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel',
                            },
                            {
                              text: 'Update task',
                              onPress: async () => {
                                updateTask(t);
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <List.Icon
                        {...props}
                        icon={t.status ? 'clipboard-check' : 'clipboard-remove'}
                        color={t.status ? '#554d07' : '#d90532'}
                      />
                    </TouchableOpacity>
                  )}
                  right={(props) => (
                    <TouchableOpacity
                      style={{ justifyContent: 'center' }}
                      onPress={() => {
                        Alert.alert(
                          'Delete task?',
                          'Are you sure you want to delete this task?',
                          [
                            {
                              text: 'Cancel',
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel',
                            },
                            {
                              text: 'Delete task',
                              onPress: async () => {
                                deleteTask(t.id);
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <List.Icon {...props} icon="trash-can" color="#d90532" />
                    </TouchableOpacity>
                  )}
                />
              );
            })}
            <List.Item
              title={''}
              right={(props) => (
                <TouchableOpacity
                  style={{ marginRight: 160 }}
                  onPress={() => {
                    saveToModalData(s);
                    showModalAdd();
                  }}
                >
                  <List.Icon {...props} icon="plus-circle" color="#554d07" />
                </TouchableOpacity>
              )}
            />
          </List.Accordion>
        ))}
      </ScrollView>
      {loading ? <LoadingScreen /> : null}
    </SafeAreaView>
  );
}
