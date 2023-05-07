import React, { useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Modal, Portal, Snackbar } from 'react-native-paper';
import styles from '../../styles';
import UserContext from '../../hooks/UserContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DropDownPicker from 'react-native-dropdown-picker';
import { supabase } from '../../hooks/supabase';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Base64 } from 'js-base64';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export default function Profile() {
  const { userData, setUserData, loadData, expoPushToken, setExpoPushToken } =
    useContext(UserContext);
  const [snackbar, setSnackbar] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [passwordConfirmVisibility, setPasswordConfirmVisibility] =
    useState(true);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [ranks, setRanks] = useState([
    {
      label: 'ADMIN',
      value: 'ADMIN',
    },
    {
      label: 'PFC',
      value: 'PFC',
    },
    {
      label: 'SPC',
      value: 'SPC',
    },
    {
      label: 'SGT',
      value: 'SGT',
    },
    {
      label: 'SSG',
      value: 'SSG',
    },
    {
      label: 'SFC',
      value: 'SFC',
    },
    {
      label: 'MSG',
      value: 'MSG',
    },
    {
      label: '1SG',
      value: '1SG',
    },
    {
      label: 'SGM',
      value: 'SGM',
    },
    {
      label: 'W01',
      value: 'W01',
    },
    {
      label: 'CW2',
      value: 'CW2',
    },
    {
      label: 'CW3',
      value: 'CW3',
    },
    {
      label: 'CW4',
      value: 'CW4',
    },
    {
      label: 'CW5',
      value: 'CW5',
    },
    {
      label: '2LT',
      value: '2LT',
    },
    {
      label: '1LT',
      value: '1LT',
    },
    {
      label: 'CPT',
      value: 'CPT',
    },
    {
      label: 'MAJ',
      value: 'MAJ',
    },
    {
      label: 'LTC',
      value: 'LTC',
    },
    {
      label: 'COL',
      value: 'COL',
    },
  ]);
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  // updates user data in the users table in DB
  // saves data to asyncstorage
  const updateUserInDB = async (values) => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );
    await supabase
      .from('users')
      .update({
        civEmail: values.civEmail,
        milEmail: values.milEmail,
        rank: values.rank,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        dod_id: values.dod_id,
        isAdmin: values.isAdmin,
        isLeader: values.isLeader,
        push_token: expoPushToken,
      })
      .eq('id', JSON.parse(userData).id)
      .then((response) => {
        if (response.status > 299) {
          return Alert.alert(response.error.message);
        }
        saveToAsyncStorage(values);
      });
  };

  // updates user password in users table
  // this is used when a user updates their password in the user.auth table
  const updateUserTablePasswordInDB = async (password) => {
    await supabase
      .from('users')
      .update({
        password: password,
      })
      .eq('id', JSON.parse(userData).id)
      .then((response) => {
        if (response.status > 299) {
          return Alert.alert(response.error.message);
        }
      });
  };

  // saves form data to asyncstorage
  // this also reloads all of the data in the app
  const saveToAsyncStorage = async (values) => {
    try {
      const soldierData = {
        civEmail: values.civEmail,
        milEmail: values.milEmail,
        rank: values.rank,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        dod_id: values.dod_id,
        isAdmin: values.isAdmin,
        isLeader: values.isLeader,
        push_token: expoPushToken,
      };
      await AsyncStorage.setItem('395soldier', JSON.stringify(soldierData));
      loadData();
    } catch (err) {
      console.log(err);
    }
  };

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  }

  const PasswordSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required('Password is required'),
    passwordConfirm: Yup.string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required('Password is required'),
  });

  const ProfileEditSchema = Yup.object().shape({
    civEmail: Yup.string().email('Invalid email').required('Email is required'),
    milEmail: Yup.string().email('Invalid email'),
    rank: Yup.string().required('You must select a rank'),
    firstName: Yup.string().required('You must enter your first name'),
    lastName: Yup.string().required('You must enter your last name'),
    phone: Yup.string()
      .matches(
        /^((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}$/,
        'Numbers only in xxx-xxx-xxxx format'
      )
      .required('Phone number is required'),
    dod_id: Yup.string().required('You must provide your DoD ID #'),
  });

  return (
    <Formik
      initialValues={{
        id: JSON.parse(userData).id,
        civEmail: JSON.parse(userData).civEmail || '',
        milEmail: JSON.parse(userData).milEmail || '',
        rank: JSON.parse(userData).rank || '',
        firstName: JSON.parse(userData).firstName || '',
        lastName: JSON.parse(userData).lastName || '',
        phone: JSON.parse(userData).phone || '',
        dod_id: JSON.parse(userData).dod_id || '',
        isAdmin: JSON.parse(userData).isAdmin,
        isLeader: JSON.parse(userData).isLeader,
      }}
      onSubmit={(values) => {
        updateUserInDB(values);
        Alert.alert('Consider your profile edited.');
      }}
      validationSchema={ProfileEditSchema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ errors, handleChange, handleSubmit, values, setFieldValue }) => (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={100}
            style={{
              flex: 1,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -50,
            }}
          >
            <Image
              style={styles.imageSmall}
              source={require('../../assets/63rd.png')}
            />
            <Text style={styles.titleText}>Edit Profile</Text>
            <Text style={styles.descriptionText}>
              Want to make some changes?
            </Text>
            <View>
              <TextInput
                style={{ width: 300, backgroundColor: 'white', color: 'black' }}
                contentStyle={{ color: 'black' }}
                mode="outlined"
                outlineColor="black"
                activeOutlineColor="#5e5601"
                label="Enter your civilian e-mail"
                placeholder="E-mail must be on the unit roster"
                placeholderTextColor="grey"
                autoCapitalize="none"
                value={values.civEmail}
                onChangeText={handleChange('civEmail')}
              />
            </View>
            {errors.civEmail && (
              <Text style={styles.errorText}>{errors.civEmail}</Text>
            )}
            <View>
              <TextInput
                style={{ width: 300, backgroundColor: 'white', color: 'black' }}
                contentStyle={{ color: 'black' }}
                mode="outlined"
                outlineColor="black"
                activeOutlineColor="#5e5601"
                label="Enter your military e-mail"
                placeholder="Must be your current .mil e-mail"
                placeholderTextColor="grey"
                autoCapitalize="none"
                value={values.milEmail}
                onChangeText={handleChange('milEmail')}
              />
            </View>
            {errors.milEmail && (
              <Text style={styles.errorText}>{errors.milEmail}</Text>
            )}

            <View style={{ width: 300, backgroundColor: 'white', zIndex: 3 }}>
              <DropDownPicker
                open={open}
                value={value}
                items={ranks}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setRanks}
                placeholder={JSON.parse(userData).rank || ''}
                onSelectItem={(selectedItem) => {
                  setFieldValue('rank', selectedItem.value);
                }}
                style={{ marginTop: 5, borderRadius: 3 }}
                placeholderStyle={{ marginLeft: 5 }}
                selectedItemContainerStyle={{ marginLeft: 10 }}
                textStyle={{ marginLeft: 5, fontSize: 15 }}
                dropDownContainerStyle={{ position: 'relative', top: 0 }}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
              />
            </View>
            {errors.rank && <Text style={styles.errorText}>{errors.rank}</Text>}
            <View>
              <TextInput
                style={{ width: 300, backgroundColor: 'white' }}
                contentStyle={{ color: 'black' }}
                mode="outlined"
                outlineColor="black"
                activeOutlineColor="#5e5601"
                label="Enter your first name"
                placeholder="Enter your first name"
                placeholderTextColor="grey"
                autoCapitalize="none"
                value={values.firstName}
                onChangeText={handleChange('firstName')}
              />
            </View>
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
            <View>
              <TextInput
                style={{ width: 300, backgroundColor: 'white' }}
                contentStyle={{ color: 'black' }}
                mode="outlined"
                outlineColor="black"
                activeOutlineColor="#5e5601"
                label="Enter your last name"
                placeholder="Enter your last name"
                placeholderTextColor="grey"
                autoCapitalize="none"
                value={values.lastName}
                onChangeText={handleChange('lastName')}
              />
            </View>
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}
            <View>
              <TextInput
                style={{ width: 300, backgroundColor: 'white' }}
                contentStyle={{ color: 'black' }}
                keyboardType="numbers-and-punctuation"
                mode="outlined"
                outlineColor="black"
                activeOutlineColor="#5e5601"
                label="Phone xxx-xxx-xxxx"
                placeholder="xxx-xxx-xxxx"
                placeholderTextColor="grey"
                autoCapitalize="none"
                value={values.phone}
                onChangeText={handleChange('phone')}
              />
            </View>
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
            <View>
              <TextInput
                style={{ width: 300, backgroundColor: 'white' }}
                contentStyle={{ color: 'black' }}
                keyboardType="number-pad"
                mode="outlined"
                outlineColor="black"
                activeOutlineColor="#5e5601"
                label="DoD ID #"
                placeholder="DoD ID #"
                placeholderTextColor="grey"
                autoCapitalize="none"
                value={values.dod_id}
                onChangeText={handleChange('dod_id')}
              />
            </View>
            {errors.dod_id && (
              <Text style={styles.errorText}>{errors.dod_id}</Text>
            )}
            <Portal>
              <Modal
                visible={visible}
                onDismiss={hideModal}
                dismissable={true}
                contentContainerStyle={{
                  backgroundColor: 'white',
                  height: 400,
                  flex: 1,
                }}
              >
                <Formik
                  initialValues={{
                    password: '',
                    passwordConfirm: '',
                  }}
                  onSubmit={async (values) => {
                    if (values.password !== values.passwordConfirm) {
                      return Alert.alert('Your passwords do not match!');
                    } else {
                      const userTablePassword = Base64.encode(values.password);
                      updateUserTablePasswordInDB(userTablePassword);
                      const { data, error } = await supabase.auth.updateUser({
                        password: values.passwordConfirm,
                      });
                      Alert.alert('Password successfully updated.');
                      hideModal();
                    }
                  }}
                  validationSchema={PasswordSchema}
                  validateOnChange={false}
                  validateOnBlur={false}
                >
                  {({ errors, handleChange, handleSubmit, values }) => (
                    <TouchableWithoutFeedback>
                      <KeyboardAvoidingView
                        behavior="padding"
                        onPress={Keyboard.dismiss}
                        keyboardVerticalOffset={10}
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
                          Change Password
                        </Text>
                        <View>
                          <TextInput
                            style={{
                              width: 300,
                              backgroundColor: 'white',
                              color: 'black',
                              textAlign: 'auto',
                            }}
                            secureTextEntry={passwordVisibility}
                            contentStyle={{ color: 'black' }}
                            mode="outlined"
                            outlineColor="black"
                            activeOutlineColor="#5e5601"
                            label="Enter new password"
                            placeholder="Don't forget it"
                            placeholderTextColor="grey"
                            autoCapitalize="none"
                            value={values.password}
                            onChangeText={handleChange('password')}
                            right={
                              <TextInput.Icon
                                icon={passwordVisibility ? 'eye' : 'eye-off'}
                                iconColor={'black'}
                                onPress={() =>
                                  setPasswordVisibility(!passwordVisibility)
                                }
                              />
                            }
                          />
                        </View>
                        {errors.password && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: 'red',
                              marginBottom: 2,
                              marginTop: 2,
                            }}
                          >
                            {errors.password}
                          </Text>
                        )}
                        <View>
                          <TextInput
                            style={{
                              width: 300,
                              maxHeight: 100,
                              backgroundColor: 'white',
                              color: 'black',
                              textAlign: 'auto',
                            }}
                            secureTextEntry={passwordConfirmVisibility}
                            contentStyle={{ color: 'black' }}
                            mode="outlined"
                            outlineColor="black"
                            activeOutlineColor="#5e5601"
                            label="Confirm password"
                            placeholder="Seriously, don't forget it"
                            placeholderTextColor="grey"
                            autoCapitalize="none"
                            value={values.passwordConfirm}
                            onChangeText={handleChange('passwordConfirm')}
                            right={
                              <TextInput.Icon
                                icon={
                                  passwordConfirmVisibility ? 'eye' : 'eye-off'
                                }
                                iconColor={'black'}
                                onPress={() =>
                                  setPasswordConfirmVisibility(
                                    !passwordConfirmVisibility
                                  )
                                }
                              />
                            }
                          />
                        </View>
                        {errors.passwordConfirm && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: 'red',
                              marginBottom: 2,
                              marginTop: 2,
                            }}
                          >
                            {errors.passwordConfirm}
                          </Text>
                        )}
                        <Button
                          mode="outlined"
                          onPress={handleSubmit}
                          title="Submit"
                          labelStyle={{ fontWeight: 'bold', color: '#d90532' }}
                          style={{
                            width: 250,
                            borderColor: '#d90532',
                            borderWidth: 2,
                            marginTop: 10,
                          }}
                        >
                          Change Password
                        </Button>
                        <TouchableOpacity onPress={hideModal}>
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

            <Button
              mode="contained"
              onPress={() => {
                showModal();
                console.log('pressed');
              }}
              title="Submit"
              labelStyle={{ fontWeight: 'bold', color: 'black' }}
              style={{
                backgroundColor: 'white',
                width: 200,
                borderColor: 'black',
                borderWidth: 1,
                marginTop: 10,
              }}
            >
              Reset Password
            </Button>
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
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      )}
    </Formik>
  );
}
