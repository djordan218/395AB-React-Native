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
  StyleSheet,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import UserContext from '../../hooks/UserContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DropDownPicker from 'react-native-dropdown-picker';
import { supabase } from '../../hooks/supabase';
import { Base64 } from 'js-base64';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native';

// user register form, sends data to backend
// if user's email is in database, then registration continues
export default function RegisterForm({ navigation }) {
  const { setUserData } = useContext(UserContext);
  const [passwordVisibility, setPasswordVisibility] = useState(true);
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

  // series of ref that handles going to next textInput when user presses "next"
  const ref_milEmail = useRef();
  const ref_password = useRef();
  const ref_firstName = useRef();
  const ref_lastName = useRef();
  const ref_phone = useRef();
  const ref_dod_id = useRef();

  // checks emailRoster table for civilian OR mil email
  // encodes password and inserts register form data into users table
  // saves data to asyncstorage
  const checkEmailRosterAndRegister = async (values) => {
    const civilianEmail = values.civEmail.toLowerCase();
    const militaryEmail = values.milEmail.toLowerCase();
    // checking for civilian email
    const civEmailCheck = await supabase
      .from('emailRoster')
      .select(`civEmail`)
      .eq('civEmail', civilianEmail);

    const milEmailCheck = await supabase
      .from('emailRoster')
      .select(`milEmail`)
      .eq('milEmail', militaryEmail);

    if (civEmailCheck.data[0] || milEmailCheck.data[0]) {
      console.log('passed email check');
      const { data, error } = await supabase.auth.signUp({
        email: civilianEmail,
        password: values.password,
      });
      if (error) return Alert.alert(error.message);

      await supabase
        .from('users')
        .insert({
          id: data.user.id,
          civEmail: civilianEmail,
          milEmail: militaryEmail,
          password: Base64.encode(values.password),
          rank: values.rank,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          dod_id: values.dod_id,
          isLeader: values.isLeader,
          isAdmin: values.isAdmin,
        })
        .then((response) => {
          if (response.status >= 300) {
            Alert.alert(response.statusText);
          }
          saveToLocalStorage(values, data.user.id);
        });
    } else {
      return Alert.alert(
        'You are not in the e-mail roster. Please get with your first line leader to add your e-mail to the database.'
      );
    }
  };

  // saves register form data to asyncstorage after email cross check
  // then saves same data to userData state
  const saveToLocalStorage = async (values, id) => {
    const soldierData = {
      id: id,
      civEmail: values.civEmail,
      milEmail: values.milEmail,
      password: values.password,
      rank: values.rank,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      dod_id: values.dod_id,
      isLeader: values.isLeader,
      isAdmin: values.isAdmin,
    };
    try {
      await AsyncStorage.setItem('395soldier', JSON.stringify(soldierData));
      setUserData(JSON.stringify(soldierData));
    } catch (err) {
      console.log(err);
    }
  };

  const RegisterSchema = Yup.object().shape({
    civEmail: Yup.string()
      .email('Invalid email - no empty spaces')
      .lowercase('Must be all lowercase letters')
      .required('Email is required'),
    milEmail: Yup.string()
      .lowercase('Must be all lowercase letters')
      .email('Invalid email - no empty spaces'),
    password: Yup.string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required('Password is required'),
    rank: Yup.string().required('You must select a rank'),
    firstName: Yup.string().required('You must enter your first name'),
    lastName: Yup.string().required('You must enter your last name'),
    dod_id: Yup.string()
      .matches(/^[0-9]+$/, 'Must be only digits')
      .min(10, 'Must be exactly 10 digits')
      .max(10, 'Must be exactly 10 digits'),
    phone: Yup.string()
      .matches(
        /^((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}$/,
        'Numbers only in xxx-xxx-xxxx format'
      )
      .required('Phone number is required'),
  });

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      <Formik
        initialValues={{
          civEmail: '',
          milEmail: '',
          password: '',
          rank: '',
          firstName: '',
          lastName: '',
          phone: '',
          dod_id: '',
          isLeader: false,
          isAdmin: false,
        }}
        onSubmit={(values) => {
          console.log(values);
          checkEmailRosterAndRegister(values);
        }}
        validationSchema={RegisterSchema}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          setFieldValue,
        }) => (
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
                paddingBottom: 40,
              }}
            >
              <Image
                style={styles.imageSmall}
                source={require('../../assets/63rd.png')}
              />
              <Text style={styles.titleText}>Register Here!</Text>
              <Text style={styles.descriptionText}>
                Your e-mail must be in the roster in order to pass registration.
              </Text>
              <View style={{ padding: 3, justifyContent: 'flex-end' }}>
                <TextInput
                  style={styles.formTextInput}
                  contentStyle={{ color: 'black' }}
                  mode="outlined"
                  outlineColor="black"
                  activeOutlineColor="#5e5601"
                  label="Enter your civilian e-mail"
                  placeholder="E-mail must be on the unit roster"
                  placeholderTextColor="#808080"
                  autoCapitalize="none"
                  autoCompleteType="off"
                  value={values.civEmail}
                  onChangeText={handleChange('civEmail')}
                  returnKeyType="next"
                  onSubmitEditing={() => ref_milEmail.current.focus()}
                />
              </View>
              {errors.civEmail && (
                <Text style={styles.errorText}>{errors.civEmail}</Text>
              )}
              <View style={{ padding: 3, justifyContent: 'flex-end' }}>
                <TextInput
                  style={styles.formTextInput}
                  contentStyle={{ color: 'black' }}
                  mode="outlined"
                  outlineColor="black"
                  activeOutlineColor="#5e5601"
                  label="Enter your military e-mail"
                  placeholder="This is not required for registration"
                  placeholderTextColor="#808080"
                  autoCapitalize="none"
                  autoCompleteType="off"
                  value={values.email}
                  onChangeText={handleChange('milEmail')}
                  ref={ref_milEmail}
                  returnKeyType="next"
                  onSubmitEditing={() => ref_password.current.focus()}
                />
              </View>
              {errors.milEmail && (
                <Text style={styles.errorText}>{errors.milEmail}</Text>
              )}
              <View style={{ padding: 3, justifyContent: 'flex-end' }}>
                <TextInput
                  style={styles.formTextInput}
                  contentStyle={{ color: 'black' }}
                  secureTextEntry={passwordVisibility}
                  mode="outlined"
                  outlineColor="black"
                  activeOutlineColor="#5e5601"
                  label="Enter your password"
                  placeholder="Super secret password"
                  placeholderTextColor="#808080"
                  autoCapitalize="none"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  ref={ref_password}
                  returnKeyType="next"
                  right={
                    <TextInput.Icon
                      icon={passwordVisibility ? 'eye' : 'eye-off'}
                      iconColor="black"
                      onPress={() => setPasswordVisibility(!passwordVisibility)}
                    />
                  }
                />
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <View
                style={{
                  width: 306,
                  backgroundColor: 'white',
                  zIndex: 300,
                  padding: 3,
                }}
              >
                <DropDownPicker
                  open={open}
                  value={value}
                  items={ranks}
                  setOpen={setOpen}
                  setValue={setValue}
                  setItems={setRanks}
                  placeholder="Please select a rank"
                  onSelectItem={(selectedItem) => {
                    setFieldValue('rank', selectedItem.value);
                  }}
                  style={{ marginTop: 5, borderRadius: 5 }}
                  placeholderStyle={{
                    marginLeft: 5,
                    color: 'rgb(75, 75, 75)',
                  }}
                  selectedItemContainerStyle={{ marginLeft: 10 }}
                  textStyle={{ marginLeft: 5, fontSize: 15, color: 'black' }}
                  dropDownContainerStyle={{ position: 'relative', top: 0 }}
                  listMode="MODAL"
                  scrollViewProps={{
                    nestedScrollEnabled: true,
                  }}
                />
              </View>
              {errors.rank && (
                <Text style={styles.errorText}>{errors.rank}</Text>
              )}
              <View style={{ padding: 3, justifyContent: 'flex-end' }}>
                <TextInput
                  style={styles.formTextInput}
                  contentStyle={{ color: 'black' }}
                  mode="outlined"
                  outlineColor="black"
                  activeOutlineColor="#5e5601"
                  label="Enter your first name"
                  placeholder="Enter your first name"
                  placeholderTextColor="#808080"
                  value={values.firstName}
                  onChangeText={handleChange('firstName')}
                  ref={ref_firstName}
                  returnKeyType="next"
                  onSubmitEditing={() => ref_lastName.current.focus()}
                />
              </View>
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
              <View style={{ padding: 3, justifyContent: 'flex-end' }}>
                <TextInput
                  style={styles.formTextInput}
                  contentStyle={{ color: 'black' }}
                  mode="outlined"
                  outlineColor="black"
                  activeOutlineColor="#5e5601"
                  label="Enter your last name"
                  placeholder="Enter your last name"
                  placeholderTextColor="#808080"
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  ref={ref_lastName}
                  returnKeyType="next"
                  onSubmitEditing={() => ref_phone.current.focus()}
                />
              </View>
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
              <View style={{ padding: 3, justifyContent: 'flex-end' }}>
                <TextInput
                  style={styles.formTextInput}
                  keyboardType="numbers-and-punctuation"
                  contentStyle={{ color: 'black' }}
                  mode="outlined"
                  outlineColor="black"
                  activeOutlineColor="#5e5601"
                  label="Phone xxx-xxx-xxxx"
                  placeholder="xxx-xxx-xxxx"
                  placeholderTextColor="#808080"
                  autoCapitalize="none"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  ref={ref_phone}
                  returnKeyType="next"
                />
              </View>
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
              <View style={{ padding: 3, justifyContent: 'flex-end' }}>
                <TextInput
                  style={styles.formTextInput}
                  keyboardType="number-pad"
                  contentStyle={{ color: 'black' }}
                  mode="outlined"
                  outlineColor="black"
                  activeOutlineColor="#5e5601"
                  label="DoD ID #"
                  placeholder="10 digits"
                  placeholderTextColor="#808080"
                  autoCapitalize="none"
                  value={values.dod_id}
                  onChangeText={handleChange('dod_id')}
                  ref={ref_dod_id}
                  returnKeyType="done"
                />
              </View>
              {errors.dod_id && (
                <Text style={styles.errorText}>{errors.dod_id}</Text>
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
                Register
              </Button>
            </KeyboardAwareScrollView>
          </TouchableWithoutFeedback>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imageSmall: {
    resizeMode: 'contain',
    height: 100,
    width: 100,
  },
  titleText: {
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 25,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  descriptionText: {
    marginBottom: 10,
    marginTop: -8,
    fontSize: 15,
    textAlign: 'center',
  },
  formTextInput: {
    width: 300,
    backgroundColor: 'white',
    textAlign: 'auto',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginBottom: 2,
    marginTop: 2,
  },
});
