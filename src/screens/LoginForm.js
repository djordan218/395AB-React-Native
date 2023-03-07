import React, { useState, useContext, useRef } from 'react';
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
import { TextInput, Button, Modal, Portal } from 'react-native-paper';
import styles from '../../styles';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../hooks/supabase';
import UserContext from '../../hooks/UserContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LoginForm() {
  const { setUserData } = useContext(UserContext);
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const ref_password = useRef();
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required('Password is required'),
  });

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
  });

  // check email in database for authentication
  // selecting user in 'users' table
  // setting user values to asyncstorage
  async function signInWithEmail(values) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      return Alert.alert(error.message);
    }

    await supabase
      .from('users')
      .select()
      .eq('civEmail', values.email)
      .then((response) => {
        console.log(response);
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        const registeredSoldier = response.data[0];
        saveToLocalStorage(registeredSoldier);
      });
  }

  // if a user passes auth, it pulls that data from users table and saves it to asyncstorage
  const saveToLocalStorage = async (values) => {
    const soldierData = {
      civEmail: values.civEmail,
      milEmail: values.milEmail,
      password: values.password,
      rank: values.rank,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      isAdmin: values.isAdmin,
    };
    try {
      await AsyncStorage.setItem('395soldier', JSON.stringify(soldierData));
      setUserData(soldierData);
      console.log('profile registered, logging in, saving to asyncstorage');
    } catch (err) {
      Alert.alert(err);
    }
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={LoginSchema}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={(values) => signInWithEmail(values)}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            enableOnAndroid={true}
            keyboardOpeningTime={0}
            contentContainerStyle={{
              flex: 1,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              style={styles.image}
              source={require('../../assets/63rd.png')}
            />
            <Text style={styles.titleText}>395th Army Band</Text>
            <View>
              <TextInput
                style={{ width: 300, backgroundColor: 'white' }}
                contentStyle={{ color: 'black' }}
                mode="outlined"
                outlineColor="black"
                activeOutlineColor="#5e5601"
                label="Enter your e-mail"
                placeholder="E-mail must be on the unit roster"
                placeholderTextColor="grey"
                autoCapitalize="none"
                value={values.email}
                onChangeText={handleChange('email')}
                returnKeyType="next"
                onSubmitEditing={() => ref_password.current.focus()}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            <View>
              <TextInput
                style={{ width: 300, backgroundColor: 'white' }}
                contentStyle={{ color: 'black' }}
                secureTextEntry={passwordVisibility}
                mode="outlined"
                outlineColor="black"
                activeOutlineColor="#5e5601"
                label="Enter your password"
                placeholder="Super secret password"
                placeholderTextColor="grey"
                autoCapitalize="none"
                value={values.password}
                onChangeText={handleChange('password')}
                ref={ref_password}
                returnKeyType="done"
                right={
                  <TextInput.Icon
                    icon={passwordVisibility ? 'eye' : 'eye-off'}
                    iconColor={'black'}
                    onPress={() => setPasswordVisibility(!passwordVisibility)}
                  />
                }
              />
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <View>
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
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
                  }}
                >
                  Login
                </Button>
              </View>
              <Portal>
                <Modal
                  visible={visible}
                  onDismiss={hideModal}
                  contentContainerStyle={{
                    backgroundColor: 'white',
                    height: 350,
                    flex: 1,
                  }}
                >
                  <Formik
                    initialValues={{
                      email: '',
                    }}
                    onSubmit={async (values) => {
                      const civEmailCheck = await supabase
                        .from('emailRoster')
                        .select(`civEmail`)
                        .eq('civEmail', values.email);
                      if (civEmailCheck.data[0]) {
                        return Alert.alert(
                          'Unfortunately, the only way to do this securely is for an admin to delete you from the app and have you re-register. Please get with the app manager so you can re-register your account.'
                        );
                      } else {
                        Alert.alert(
                          'This e-mail is not in the unit roster. Please get with a senior NCO to add you to the roster.'
                        );
                      }
                      hideModal();
                    }}
                    validationSchema={ForgotPasswordSchema}
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
                            So you forgot your password, eh?
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
                              label="What is your email?"
                              placeholder="You must already be registered"
                              placeholderTextColor="grey"
                              autoCapitalize="none"
                              value={values.email}
                              onChangeText={handleChange('email')}
                            />
                          </View>
                          {errors.email && (
                            <Text
                              style={{
                                fontSize: 12,
                                color: 'red',
                                marginBottom: 2,
                                marginTop: 2,
                              }}
                            >
                              {errors.email}
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
                            I forgot. Help me.
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
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
                <Button
                  mode="contained"
                  onPress={showModal}
                  title="Submit"
                  labelStyle={{ fontWeight: 'bold', color: 'black' }}
                  style={{
                    backgroundColor: 'white',
                    width: 200,
                  }}
                >
                  Forgot Password
                </Button>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      )}
    </Formik>
  );
}
