import React, { useContext, useState } from 'react';
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
import { List, Portal, Modal, TextInput, Button } from 'react-native-paper';
import UserContext from '../../hooks/UserContext';
import * as All from '../components/RankImages';
import DropDownPicker from 'react-native-dropdown-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../hooks/supabase';
import { Session } from '@supabase/supabase-js';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Roster() {
  const { unitRoster, setUnitRoster, userData } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [openAdmin, setOpenAdmin] = useState(false);
  const [valueAdmin, setValueAdmin] = useState(null);
  const [adminValue, setAdminValue] = useState([
    {
      label: 'User is an admin.',
      value: true,
    },
    {
      label: 'User is NOT an admin',
      value: false,
    },
  ]);
  const [ranks, setRanks] = useState([
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
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [modalData, setModalData] = useState('');
  const showModalEdit = () => setVisibleEdit(true);
  const hideModalEdit = () => setVisibleEdit(false);

  const modalEditData = (data) => {
    setValue(data.rank);
    setValueAdmin(data.isAdmin);
    setModalData(data);
  };

  const updateRosterInState = async (values) => {
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

  const deleteUser = async (id) => {
    await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .then((response) => {
        console.log(response);
        updateRosterInState();
      });
    const { data, error } = await supabase.auth.admin.deleteUser(id);
    Alert.alert('User is gone forever.');
  };

  const updateUser = async (values) => {
    console.log('updating user');
    console.log(values);
    await supabase
      .from('users')
      .update({
        civEmail: values.civEmail,
        milEmail: values.milEmail,
        rank: values.rank,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        isAdmin: values.isAdmin,
      })
      .eq('id', values.id)
      .then((response) => {
        updateRosterInState();
        Alert.alert('Successfully edited Soldier data.');
      });
  };

  const roster = [
    {
      id: 1,
      rank: 'CW2',
      firstName: 'Jordan',
      lastName: 'Kinsey',
      milEmail: 'jordan.e.kinsey.mil@army.mil',
      civEmail: 'jekinsey22@gmail.com',
      phone: '847-602-1481',
      isAdmin: true,
    },
    {
      id: 2,
      rank: '1SG',
      firstName: 'Chip',
      lastName: 'Brewster',
      milEmail: 'george.w.brewster6.mil@army.mil',
      civEmail: 'chip.brewster@gmail.com',
      phone: '847-602-1481',
      isAdmin: true,
    },
    {
      id: 3,
      rank: 'SFC',
      firstName: 'Daniel',
      lastName: 'Jordan',
      milEmail: 'daniel.m.jordan.mil@mail.mil',
      civEmail: 'djordan218@gmail.com',
      phone: '918-814-4039',
      isAdmin: true,
    },
    {
      id: 4,
      rank: 'SFC',
      firstName: 'Stephanie',
      lastName: 'Osbourne',
      milEmail: 'stephanie.m.osbourne.mil@mail.mil',
      civEmail: 'stephanie.osbourne@gmail.com',
      phone: '940-782-3187',
      isAdmin: true,
    },
    {
      id: 5,
      rank: 'SFC',
      firstName: 'Jamie',
      lastName: 'Dubose',
      milEmail: 'jamie.a.dubose.mil@army.mil',
      civEmail: 'jsallen1985@gmail.com',
      phone: '205-531-7031',
      isAdmin: true,
    },
    {
      id: 6,
      rank: 'SFC',
      firstName: 'Steve',
      lastName: 'Sharp',
      milEmail: 'steven.r.sharp16.mil@army.mil',
      civEmail: 'ssharp@bethanyschools.com',
      phone: '405-602-4997',
      isAdmin: true,
    },
    {
      id: 7,
      rank: 'SSG',
      firstName: 'Robert',
      lastName: 'Lawson',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 8,
      rank: 'SSG',
      firstName: 'Richard',
      lastName: 'Murrow',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 9,
      rank: 'SSG',
      firstName: 'Jenny',
      lastName: 'Stewart',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 10,
      rank: 'SSG',
      firstName: 'Ryan',
      lastName: 'Neighbors',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 11,
      rank: 'SSG',
      firstName: 'Jarod',
      lastName: 'Willard',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 13,
      rank: 'SSG',
      firstName: 'Patrick',
      lastName: 'Faircloth',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 14,
      rank: 'SSG',
      firstName: 'Aaron',
      lastName: 'Skinner',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 15,
      rank: 'SSG',
      firstName: 'Richard',
      lastName: 'Rivera',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 16,
      rank: 'SSG',
      firstName: 'Mickey',
      lastName: 'Bertelsen',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 17,
      rank: 'SSG',
      firstName: 'Sam',
      lastName: 'Carroll',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 18,
      rank: 'SGT',
      firstName: 'Vanessa',
      lastName: 'Delgado',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 19,
      rank: 'SGT',
      firstName: 'Tyler',
      lastName: 'Tashdjian',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 20,
      rank: 'SGT',
      firstName: 'Christina',
      lastName: 'Calkins',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 21,
      rank: 'SGT',
      firstName: 'Bryan',
      lastName: 'Coager',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 22,
      rank: 'SGT',
      firstName: 'Philip',
      lastName: 'Flick',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 23,
      rank: 'SGT',
      firstName: 'Kenny',
      lastName: 'James',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 24,
      rank: 'SPC',
      firstName: 'Charlie',
      lastName: 'Blomgren',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 25,
      rank: 'SPC',
      firstName: 'Daniel',
      lastName: 'Moreira',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 26,
      rank: 'SPC',
      firstName: 'Tlaloc',
      lastName: 'Perales',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 27,
      rank: 'SPC',
      firstName: 'Evan',
      lastName: 'Wells',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 28,
      rank: 'SPC',
      firstName: 'Tatiana',
      lastName: 'Flores',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 29,
      rank: 'SPC',
      firstName: 'Ian',
      lastName: 'Massey',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 30,
      rank: 'SPC',
      firstName: 'Isodoro',
      lastName: 'Ramos',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 31,
      rank: 'SPC',
      firstName: 'Kevin',
      lastName: 'Cantu',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 32,
      rank: 'SPC',
      firstName: 'Chloe',
      lastName: 'Sutton',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 33,
      rank: 'SPC',
      firstName: 'Manchusa',
      lastName: 'Loungsangroong',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
    {
      id: 34,
      rank: 'SPC',
      firstName: 'Nathaniel',
      lastName: 'Schoenbaum',
      milEmail: '',
      civEmail: '',
      phone: '',
      isAdmin: false,
    },
  ];

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

  const userSchema = Yup.object().shape({
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
    isAdmin: Yup.boolean().required(
      'Must determine if user is an admin or not'
    ),
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
          title="Unit Roster"
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
            color: 'black',
            backgroundColor: 'white',
            textAlign: 'center',
            marginTop: -15,
          }}
        >
          This is the unit roster. Use this to reach out to Soldiers if you have
          questions, but also remember to follow the chain of command and use
          the appropriate channels.
        </List.Subheader>
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
                id: modalData.id,
                civEmail: modalData.civEmail,
                milEmail: modalData.milEmail,
                rank: modalData.rank,
                firstName: modalData.firstName,
                lastName: modalData.lastName,
                phone: modalData.phone,
                isAdmin: modalData.isAdmin,
              }}
              onSubmit={(values) => {
                updateUser(values);
                hideModalEdit();
              }}
              validationSchema={userSchema}
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
                      Edit User
                    </Text>

                    <View>
                      <TextInput
                        style={{ width: 300, backgroundColor: 'white' }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Enter your civilian e-mail"
                        placeholder="E-mail must be on the unit roster"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        autoCompleteType="off"
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
                        style={{ width: 300, backgroundColor: 'white' }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Enter your military e-mail"
                        placeholder="This is not required for registration"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        autoCompleteType="off"
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
                    <View
                      style={{
                        width: 300,
                        backgroundColor: 'white',
                        zIndex: 300,
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
                    {errors.rank && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.rank}
                      </Text>
                    )}
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
                    <View>
                      <TextInput
                        style={{ width: 300, backgroundColor: 'white' }}
                        keyboardType="numbers-and-punctuation"
                        contentStyle={{ color: 'black' }}
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
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.phone}
                      </Text>
                    )}
                    <View
                      style={{
                        width: 300,
                        backgroundColor: 'white',
                        zIndex: 300,
                      }}
                    >
                      <DropDownPicker
                        listMode="SCROLLVIEW"
                        open={openAdmin}
                        value={valueAdmin}
                        items={adminValue}
                        setOpen={setOpenAdmin}
                        setValue={setValueAdmin}
                        setItems={setAdminValue}
                        placeholder="Is user an admin?"
                        onSelectItem={(selectedItem) => {
                          setFieldValue('isAdmin', selectedItem.value);
                        }}
                        style={{ marginTop: 5, borderRadius: 3 }}
                        placeholderStyle={{ marginLeft: 5, color: 'grey' }}
                        selectedItemContainerStyle={{ marginLeft: 10 }}
                        textStyle={{ marginLeft: 5, fontSize: 15 }}
                      />
                    </View>
                    {errors.isAdmin && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.isAdmin}
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
                      Edit User
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
            titleStyle={{ color: 'black', fontWeight: 500 }}
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
            title={s.rank + ' ' + s.firstName + ' ' + s.lastName}
          >
            <List.Item
              title={s.civEmail}
              titleStyle={{ fontWeight: '500', color: 'black' }}
              left={(props) => (
                <List.Icon {...props} icon="home" color="black" />
              )}
              right={(props) => (
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(`mailto:${s.civEmail}`);
                  }}
                >
                  <List.Icon {...props} icon="email-outline" color="black" />
                </TouchableOpacity>
              )}
            />
            <List.Item
              title={s.milEmail}
              titleStyle={{ fontWeight: '500', color: 'black' }}
              left={(props) => (
                <List.Icon {...props} icon="office-building" color="black" />
              )}
              right={(props) => (
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(`mailto:${s.milEmail}`);
                  }}
                >
                  <List.Icon {...props} icon="email-outline" color="black" />
                </TouchableOpacity>
              )}
            />
            <List.Item
              title={s.phone}
              titleStyle={{ fontWeight: '500', color: 'black' }}
              left={(props) => (
                <List.Icon {...props} icon="cellphone" color="black" />
              )}
              right={(props) => (
                <TouchableOpacity
                  onPress={() => {
                    console.log('sending text!');
                    Linking.openURL(`sms:+1${s.phone}`);
                  }}
                >
                  <List.Icon {...props} icon="send" color="black" />
                </TouchableOpacity>
              )}
            />
            {JSON.parse(userData).isAdmin ? (
              <List.Item
                title={''}
                titleStyle={{ fontWeight: '500', color: 'black' }}
                left={(props) => (
                  <TouchableOpacity
                    style={{ marginLeft: 130 }}
                    onPress={() => {
                      if (s.id == JSON.parse(userData).id) {
                        return Alert.alert(
                          'You cannot delete yourself! You must finish this journey. I believe in you.'
                        );
                      } else {
                        Alert.alert(
                          'Delete user from the app?',
                          'Are you sure? This will delete it forever and this user will no longer be in the database. This cannot be undone.',
                          [
                            {
                              text: 'Nevermind',
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel',
                            },
                            {
                              text: 'Delete',
                              onPress: () => {
                                deleteUser(s.id);
                              },
                            },
                          ]
                        );
                      }
                    }}
                  >
                    <List.Icon
                      {...props}
                      icon="delete-outline"
                      color="#d90532"
                    />
                  </TouchableOpacity>
                )}
                right={(props) => (
                  <TouchableOpacity
                    style={{ marginRight: 130 }}
                    onPress={() => {
                      if (s.id === JSON.parse(userData).id) {
                        return Alert.alert(
                          'Whoa! This ain`t no fancy schmancy app. If you want to edit your own profile, you have to do it by pressing the link in the side menu.'
                        );
                      }
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
            ) : null}
          </List.Accordion>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
