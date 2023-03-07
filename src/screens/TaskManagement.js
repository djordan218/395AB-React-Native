import React, { useContext, useState, useEffect } from 'react';
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
} from 'react-native';
import {
  List,
  Portal,
  Modal,
  TextInput,
  Button,
  Badge,
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
import { useInterpolateConfig } from 'react-native-reanimated';

export default function TaskManagement() {
  const {
    unitRoster,
    setUnitRoster,
    userData,
    setUserData,
    userTasks,
    setUserTasks,
  } = useContext(UserContext);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const showModalAdd = () => setVisibleAdd(true);
  const hideModalAdd = () => setVisibleAdd(false);
  const showModalEdit = () => setVisibleEdit(true);
  const hideModalEdit = () => setVisibleEdit(false);
  const [modalData, setModalData] = useState('');

  // this saves data to state to load into edit form
  const saveToModalData = (data) => {
    setModalData(data);
  };

  // adds the task to the DB - tasks table
  // reloads the unit roster state
  // reloads user's task in case they added a task to themselves
  const addTaskToSoldier = async (values, data) => {
    await supabase
      .from('tasks')
      .insert({
        task: values.task,
        status: values.status,
        created_at: values.created_at,
        soldier_id: data,
      })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        hideModalAdd();
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
  };

  // updates the task to either true or false
  // reloads the unit roster state
  // reloads user tasks in case they updated their own task
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
        console.log(response);
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
    return `Task added on ` + date;
  }

  const addTaskSchema = Yup.object().shape({
    task: Yup.string().required('Task is required'),
    description: Yup.string(),
  });

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
        <List.Subheader
          numberOfLines={100}
          style={{
            color: 'black',
            backgroundColor: 'white',
            textAlign: 'center',
            marginTop: -15,
          }}
        >
          Here you can add and update tasks for individual Soldiers. This will
          show up in their "My Tasks" section in their profile.
          {'\n'}
          {'\n'}Once a soldier has marked the task complete - the check will
          turn green.{'\n'}
          {'\n'}You can delete the task from their list at any time by pressing
          on the trashcan. This will remove the task.
          {'\n'}
          {'\n'}You can edit the task by clicking on the text and submitting the
          edit.
        </List.Subheader>
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
                created_at: new Date().toLocaleDateString(),
              }}
              onSubmit={(values) => {
                const soldierId = modalData;
                addTaskToSoldier(values, soldierId);
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
                status: false,
              }}
              onSubmit={(values) => {
                editTask(values, modalData.id);
                hideModalEdit();
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
                  <Badge
                    size={25}
                    style={{
                      fontWeight: 'bold',
                      color: 'white',
                      fontSize: 15,
                      backgroundColor: '#d90532',
                    }}
                  >
                    {s.tasks.length}
                  </Badge>
                );
              } else {
                return (
                  <Badge
                    size={25}
                    style={{
                      fontWeight: 'bold',
                      color: 'white',
                      fontSize: 15,
                      backgroundColor: '#554d07',
                    }}
                  >
                    {s.tasks.length}
                  </Badge>
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
                            textAlign: 'center',
                          }}
                        >
                          {formatDate(t.created_at)}
                        </Text>
                      </TouchableOpacity>
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
                            textAlign: 'center',
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
                        icon="clipboard-check"
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
                    saveToModalData(s.id);
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
    </SafeAreaView>
  );
}
