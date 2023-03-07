import React, { useContext, useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Text,
  Alert,
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
import { supabase } from '../../hooks/supabase';
import UserContext from '../../hooks/UserContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SoldierManagement() {
  const { emailRoster, setEmailRoster } = useContext(UserContext);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [modalData, setModalData] = useState('');
  const showModalAdd = () => setVisibleAdd(true);
  const hideModalAdd = () => setVisibleAdd(false);
  const showModalEdit = () => setVisibleEdit(true);
  const hideModalEdit = () => setVisibleEdit(false);

  const modalEditData = (data) => {
    setModalData(data);
  };

  const AddEmailsSchema = Yup.object().shape({
    milEmail: Yup.string()
      .email('Invalid email')
      .required('Military e-mail is required'),
    civEmail: Yup.string()
      .email('Invalid email')
      .required('Civilian e-mail is required'),
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
  });

  const EditRosterSchema = Yup.object().shape({
    milEmail: Yup.string()
      .email('Invalid email')
      .required('Military e-mail is required'),
    civEmail: Yup.string()
      .email('Invalid email')
      .required('Civilian e-mail is required'),
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
  });

  // pulls all emails from emailRoster table, saves to state
  const updateEmailRosterState = async (values) => {
    await supabase
      .from('emailRoster')
      .select(`id, civEmail, milEmail, firstName, lastName`)
      .order('lastName', { ascending: true })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        setEmailRoster(response.data);
      });
  };

  // inserting form data and submitting to DB
  // reloads and resets emailRoster state
  const addSoldierToEmailRoster = async (values) => {
    await supabase
      .from('emailRoster')
      .insert({
        civEmail: values.civEmail,
        milEmail: values.milEmail,
        firstName: values.firstName,
        lastName: values.lastName,
      })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateEmailRosterState();
        Alert.alert('Successfully added Soldier to email roster.');
      });
  };

  // deletes Soldier email from emailRoster table
  // resets emailRoster state
  const deleteSoldierFromEmailRoster = async (id) => {
    await supabase
      .from('emailRoster')
      .delete()
      .eq('id', id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateEmailRosterState();
        Alert.alert('Deleted. Gone forever. Goodbye.');
      });
  };

  // loads data from edit form, updates emailRoster table and reloads/saves to state
  const updateSoldierInEmailRoster = async (values) => {
    await supabase
      .from('emailRoster')
      .update({
        civEmail: values.civEmail,
        milEmail: values.milEmail,
        firstName: values.firstName,
        lastName: values.lastName,
      })
      .eq('id', values.id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateEmailRosterState();
        Alert.alert('Successfully updated Soldier data.');
      });
  };

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
          title="Soldier Management List"
          titleStyle={{
            fontWeight: 'bold',
            color: 'black',
            fontSize: 20,
            textAlign: 'center',
            backgroundColor: 'white',
            margin: -8,
          }}
        />
        <List.Subheader
          numberOfLines={100}
          style={{
            textAlign: 'center',
            backgroundColor: 'white',
            marginTop: -8,
            paddingTop: -10,
            color: 'black',
          }}
        >
          This is where you can add/edit e-mails for user registration or delete
          Soldiers from the roster when they transition out of the unit. If a
          Soldier goes to register and their e-mail is NOT on this list, they
          will not be able to access the app.
        </List.Subheader>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <IconButton
            icon="plus-circle-outline"
            iconColor={'#646c5c'}
            size={30}
            onPress={showModalAdd}
            style={{ marginTop: -18, marginBottom: -2 }}
          />
        </View>
        <Portal>
          <Modal
            visible={visibleAdd}
            onDismiss={hideModalAdd}
            contentContainerStyle={{
              backgroundColor: 'white',
              height: 350,
              flex: 1,
            }}
          >
            <Formik
              initialValues={{
                milEmail: '',
                civEmail: '',
                firstName: '',
                lastName: '',
              }}
              onSubmit={(values) => {
                addSoldierToEmailRoster(values);
                hideModalAdd();
              }}
              validationSchema={AddEmailsSchema}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ errors, handleChange, handleSubmit, values }) => (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <KeyboardAvoidingView
                    behavior="padding"
                    style={{
                      flex: 1,
                      backgroundColor: '#fff',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: -50,
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
                      Add Soldier to Roster
                    </Text>
                    <View>
                      <TextInput
                        style={{
                          width: 300,
                          backgroundColor: 'white',
                          color: 'black',
                        }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Soldier's military e-mail"
                        placeholder="Must end in .mil"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        value={values.milEmail}
                        onChangeText={handleChange('milEmail')}
                      />
                    </View>
                    {errors.milEmail && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.milEmail}
                      </Text>
                    )}
                    <View>
                      <TextInput
                        style={{
                          width: 300,
                          backgroundColor: 'white',
                          color: 'black',
                        }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Soldier's civilian e-mail"
                        placeholder="Can be whatever"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        value={values.civEmail}
                        onChangeText={handleChange('civEmail')}
                      />
                    </View>
                    {errors.civEmail && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.civEmail}
                      </Text>
                    )}
                    <View>
                      <TextInput
                        style={{
                          width: 300,
                          backgroundColor: 'white',
                          color: 'black',
                        }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Soldier's first name"
                        placeholder="Required"
                        placeholderTextColor="grey"
                        value={values.firstName}
                        onChangeText={handleChange('firstName')}
                      />
                    </View>
                    {errors.firstName && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.firstName}
                      </Text>
                    )}
                    <View>
                      <TextInput
                        style={{
                          width: 300,
                          backgroundColor: 'white',
                          color: 'black',
                        }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Soldier's last name"
                        placeholder="Required"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        value={values.lastName}
                        onChangeText={handleChange('lastName')}
                      />
                    </View>
                    {errors.lastName && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.lastName}
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
                      Add to roster
                    </Button>
                    <TouchableOpacity onPress={hideModalAdd}>
                      <MaterialCommunityIcons
                        style={{ marginTop: 20 }}
                        name="close-circle-outline"
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                  </KeyboardAvoidingView>
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
              height: 350,
              flex: 1,
            }}
          >
            <Formik
              initialValues={{
                id: modalData.id,
                milEmail: modalData.milEmail,
                civEmail: modalData.civEmail,
                firstName: modalData.firstName,
                lastName: modalData.lastName,
              }}
              onSubmit={(values) => {
                updateSoldierInEmailRoster(values);
                hideModalEdit();
              }}
              validationSchema={EditRosterSchema}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ errors, handleChange, handleSubmit, values }) => (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <KeyboardAvoidingView
                    behavior="padding"
                    style={{
                      flex: 1,
                      backgroundColor: '#fff',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: -50,
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
                      Update Soldier
                    </Text>
                    <View>
                      <TextInput
                        style={{
                          width: 300,
                          backgroundColor: 'white',
                          color: 'black',
                          textAlign: 'auto',
                        }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Soldier's military e-mail"
                        placeholder="Must end in .mil"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        value={values.milEmail}
                        onChangeText={handleChange('milEmail')}
                      />
                    </View>
                    {errors.milEmail && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.milEmail}
                      </Text>
                    )}
                    <View>
                      <TextInput
                        style={{
                          width: 300,
                          backgroundColor: 'white',
                          color: 'black',
                          textAlign: 'auto',
                        }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Soldier's civilian e-mail"
                        placeholder="Can be whatever"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        value={values.civEmail}
                        onChangeText={handleChange('civEmail')}
                      />
                    </View>
                    {errors.civEmail && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.civEmail}
                      </Text>
                    )}
                    <View>
                      <TextInput
                        style={{
                          width: 300,
                          backgroundColor: 'white',
                          color: 'black',
                          textAlign: 'auto',
                        }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Soldier's first name"
                        placeholder="Required"
                        placeholderTextColor="grey"
                        value={values.firstName}
                        onChangeText={handleChange('firstName')}
                      />
                    </View>
                    {errors.firstName && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.firstName}
                      </Text>
                    )}
                    <View>
                      <TextInput
                        style={{
                          width: 300,
                          backgroundColor: 'white',
                          color: 'black',
                          textAlign: 'auto',
                        }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Soldier's last name"
                        placeholder="Required"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        value={values.lastName}
                        onChangeText={handleChange('lastName')}
                      />
                    </View>
                    {errors.lastName && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.lastName}
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
                      Save Changes
                    </Button>
                    <TouchableOpacity onPress={hideModalEdit}>
                      <MaterialCommunityIcons
                        style={{ marginTop: 20 }}
                        name="close-circle-outline"
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                  </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
              )}
            </Formik>
          </Modal>
        </Portal>
        {emailRoster.map((s) => (
          <List.Accordion
            key={s.id}
            style={{
              borderColor: 'black',
              borderWidth: StyleSheet.hairlineWidth,
              backgroundColor: 'white',
            }}
            left={(props) => (
              <List.Icon {...props} icon="account-circle" color="black" />
            )}
            titleStyle={{ color: 'black', fontWeight: 500 }}
            title={s.lastName + ',' + ' ' + s.firstName}
          >
            <List.Item
              title={s.milEmail}
              titleStyle={{ fontWeight: '500', color: 'black' }}
              left={(props) => (
                <List.Icon {...props} icon="email" color="black" />
              )}
            />
            <List.Item
              title={s.civEmail}
              titleStyle={{ fontWeight: '500', color: 'black' }}
              left={(props) => (
                <List.Icon {...props} icon="email-outline" color="black" />
              )}
            />
            <List.Item
              title={''}
              titleStyle={{ fontWeight: '500', color: 'black' }}
              left={(props) => (
                <TouchableOpacity
                  style={{ marginLeft: 130 }}
                  onPress={() => {
                    Alert.alert(
                      'Delete Soldier from roster?',
                      'Are you sure? This will not allow a soldier to register for an account. This cannot be undone.',
                      [
                        {
                          text: 'Nevermind',
                          onPress: () => console.log('Cancel Pressed'),
                          style: 'cancel',
                        },
                        {
                          text: 'Delete',
                          onPress: () => {
                            deleteSoldierFromEmailRoster(s.id);
                          },
                        },
                      ]
                    );
                  }}
                >
                  <List.Icon {...props} icon="delete-outline" color="#d90532" />
                </TouchableOpacity>
              )}
              right={(props) => (
                <TouchableOpacity
                  style={{ marginRight: 130 }}
                  onPress={() => {
                    modalEditData(s);
                    showModalEdit();
                  }}
                >
                  <List.Icon
                    {...props}
                    icon="email-edit-outline"
                    color="#5e5601"
                  />
                </TouchableOpacity>
              )}
            />
          </List.Accordion>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
