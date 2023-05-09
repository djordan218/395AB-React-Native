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
import DropDownPicker from 'react-native-dropdown-picker';
import RegisterForm from './RegisterForm';

export default function SendNotification() {
  const { setUserData, unitRoster } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [dropdownValues, setDropdownValues] = useState(
    unitRoster.map((s) => {
      return {
        label: s.rank + ' ' + s.firstName + ' ' + s.lastName,
        value: s.push_token,
      };
    })
  );

  // handling logic when a user presses "send announcement" button
  async function processAnnouncement(announcement) {
    announcement.recipients.map((s) => {
      sendPushNotification(s, announcement);
    });
    setValue(null);
    Alert.alert('Soldiers have been notified!');
  }

  // sending push notification
  async function sendPushNotification(expoPushToken, announcement) {
    console.log(`sending ${announcement.title} to ${expoPushToken}`);
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: `395th Announcement`,
      body: `${announcement.details}`,
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

  const AnnouncementSchema = Yup.object().shape({
    details: Yup.string().required('You must provide some details'),
  });

  return (
    <Formik
      initialValues={{
        details: '',
        recipients: dropdownValues.map((s) => {
          return s.value;
        }),
      }}
      validationSchema={AnnouncementSchema}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={async (values) => {
        await processAnnouncement(values);
        setValue(null);
        values.recipients = dropdownValues.map((s) => {
          return s.value;
        });
      }}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        setFieldValue,
      }) => (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            enableOnAndroid={true}
            keyboardOpeningTime={0}
            style={{ backgroundColor: 'white' }}
            contentContainerStyle={{
              backgroundColor: '#fff',
              alignItems: 'center',
            }}
          >
            <Image
              style={{
                resizeMode: 'contain',
                height: 200,
                width: 200,
              }}
              source={require('../../assets/63rd.png')}
            />
            <Text style={styles.titleText}>Unit Notifications</Text>
            <View>
              <TextInput
                style={{ width: 300, backgroundColor: 'white' }}
                contentStyle={{ color: 'black' }}
                mode="outlined"
                outlineColor="black"
                multiline={true}
                activeOutlineColor="#5e5601"
                label="Announcement"
                placeholder="Keep it as short as possible, please!"
                placeholderTextColor="grey"
                ref={(input) => {
                  this.textInput = input;
                }}
                value={values.details}
                onChangeText={handleChange('details')}
                returnKeyType="next"
              />
            </View>
            {errors.details && (
              <Text style={styles.errorText}>{errors.details}</Text>
            )}
            <View
              style={{
                width: 300,
                backgroundColor: 'white',
                zIndex: 300,
              }}
            >
              <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 5 }}>
                Select Soldiers to notify.{`\n`} If none are selected, all are
                notified.
              </Text>
              <DropDownPicker
                open={open}
                value={value}
                items={dropdownValues}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setDropdownValues}
                multiple={true}
                multipleText={value && `${value.length} selected`}
                placeholder="Select Soldiers to notify"
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
            {errors.recipients && (
              <Text
                style={{
                  fontSize: 12,
                  color: 'red',
                  marginBottom: 2,
                  marginTop: 2,
                }}
              >
                {errors.recipients}
              </Text>
            )}

            <View>
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  title="Send Announcement"
                  labelStyle={{ fontWeight: 'bold', color: 'white' }}
                  style={{
                    backgroundColor: '#5e5601',
                    width: 200,
                    borderColor: 'black',
                    borderWidth: 1,
                    marginBottom: 20,
                  }}
                >
                  Send Announcement
                </Button>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      )}
    </Formik>
  );
}
