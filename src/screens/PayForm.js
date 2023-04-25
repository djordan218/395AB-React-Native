import React, { useContext, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Linking,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  TouchableWithoutFeedback,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import {
  List,
  IconButton,
  Portal,
  Modal,
  TextInput,
  Button,
  Badge,
  Chip,
  RadioButton,
} from 'react-native-paper';
import qs from 'qs';
import UserContext from '../../hooks/UserContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../hooks/supabase';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SearchBar from 'react-native-dynamic-search-bar';
import * as ebdls from '../helpers/ebdls';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';

export default function PayForm() {
  const {
    userData,
    displayName,
    userEbdls,
    setUserEbdls,
    userRmas,
    setUserRmas,
    userRsts,
    setUserRsts,
  } = useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false);
  const [spinnerVisibility, setSpinnerVisibility] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredText, setFilteredText] = useState('');
  const [ebdlList, setEbdlList] = useState([]);
  const [ebdlTotal, setEbdlTotal] = useState(null);
  const [rmaList, setRmaList] = useState([]);
  const [rmaTotal, setRmaTotal] = useState(null);
  const [rstDatePickerShow, setRstDatePickerShow] = useState(false);
  const [rstMissedPickerShow, setRstMissedPickerShow] = useState(false);
  const [rstDate, setRstDate] = useState(new Date(Date.now()));
  const [rstDateMissed, setRstDateMissed] = useState(new Date(Date.now()));
  const [checked, setChecked] = useState('first');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [rstValues, setRstValues] = useState([
    {
      label: 'Full Day',
      value: 8,
    },
    {
      label: 'Half Day',
      value: 4,
    },
  ]);

  const onChangeRstDate = (event, value) => {
    setRstDate(value);
    if (Platform.OS === 'android') {
      setRstDatePickerShow(false);
    }
  };

  const onChangeRstMissed = (event, value) => {
    setRstDateMissed(value);
    if (Platform.OS === 'android') {
      setRstMissedPickerShow(false);
    }
  };

  const userEbdlHours =
    userEbdls.map((e) => e.ebdl_hours).reduce((a, b) => a + b, 0) / 2;

  const userRmaHours = userRmas
    .map((r) => r.rma_hours)
    .reduce((a, b) => a + b, 0);

  const userRstHours = userRsts
    .map((r) => r.rst_hours)
    .reduce((a, b) => a + b, 0);

  const updateUserEbdls = async () => {
    await supabase
      .from('users')
      .select('*, tasks:tasks(*), ebdl:ebdl(*)')
      .eq('civEmail', JSON.parse(userData).civEmail)
      .order('id', { foreignTable: 'tasks', ascending: true })
      .then((response) => {
        const soldier = JSON.stringify(response.data[0]);
        setUserEbdls(JSON.parse(soldier).ebdl);
      });
  };

  // inserts EBDL into ebdl table linked to soldier via soldier_id
  const addEbdlToSoldier = async (ebdl, userId) => {
    if (userEbdls.filter((e) => e.ebdl_name == ebdl.name).length > 0) {
      return Alert.alert('You already have that one!');
    }
    await supabase
      .from('ebdl')
      .insert({
        ebdl_name: ebdl.name,
        ebdl_hours: ebdl.hours,
        soldier_id: userId,
      })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateUserEbdls();
      });
    Alert.alert('EBDL added. Thanks for knocking that out.');
  };

  const deleteEbdl = async (ebdl) => {
    await supabase
      .from('ebdl')
      .delete()
      .eq('id', ebdl.id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateUserEbdls();
      });
    Alert.alert('EBDL deleted.');
  };

  const handleOnChangeText = (text) => {
    if (text.length >= 1) {
      setSpinnerVisibility(true);
    } else {
      setSpinnerVisibility(false);
    }
    setSearchText(text);
    filterText(text);
  };

  const filterText = (text) => {
    text = text.toUpperCase();
    if (text.length >= 2) {
      const filteredData = ebdls.ebdls.filter((t) => {
        const itemData = t.name;
        return itemData.indexOf(text) > -1;
      });
      setEbdlList(filteredData);
    } else {
      setEbdlList([]);
    }
  };

  const handleCancel = () => {
    setSpinnerVisibility(false);
    setEbdlList([]);
  };

  const handleEBDLSubmit = () => {
    if (userEbdlHours < 4) {
      return Alert.alert('You must have 4+ hours in order to process pay.');
    } else if (userEbdlHours > 3 && userEbdlHours % 4 !== 0) {
      return Alert.alert(
        'You must have a total that is an increment of 4 in order to process pay.',
        'Once you have a number that is divisible by 4 in the "HOURS TO BE PAID" block, you can submit for pay.'
      );
    } else {
      sendEmail(
        'jordan.e.kinsey.mil@army.mil',
        `${displayName} - EBDL 1380 Process for Pay`,
        `I am requesting pay for completed EBDLs, listed below:\n\n${listEbdls(
          userEbdls
        )}
            \n\n You can respond to this email or text/call at ${
              JSON.parse(userData).phone
            } if you have any questions.`,
        `elizabeth.b.mccauley.civ@army.mil`
      );
    }
  };

  function listEbdls(ebdls) {
    let result = '';
    ebdls.map((e) => {
      result += `${e.ebdl_name} - ${e.ebdl_hours} hours\n\n`;
    });
    return result;
  }

  const updateUserRmas = async () => {
    await supabase
      .from('users')
      .select('*, tasks:tasks(*), ebdl:ebdl(*), rma:rma(*)')
      .eq('civEmail', JSON.parse(userData).civEmail)
      .order('id', { foreignTable: 'rma', ascending: true })
      .then((response) => {
        const soldier = JSON.stringify(response.data[0]);
        setUserRmas(JSON.parse(soldier).rma);
      });
  };

  const addRma = async (rma, userId) => {
    await supabase
      .from('rma')
      .insert({
        rma_name: rma.rma_name,
        rma_hours: rma.rma_hours,
        soldier_id: userId,
      })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateUserRmas();
      });
    Alert.alert('RMA added to your list.');
  };

  const addHourToRma = async (rma, rmaHour, userId) => {
    console.log(rma);
    await supabase
      .from('rma')
      .update({
        rma_name: rma.rma_name,
        rma_hours: rma.rma_hours,
      })
      .eq('id', rma.id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateUserRmas();
      });
  };

  const deleteRma = async (rma) => {
    await supabase
      .from('rma')
      .delete()
      .eq('id', rma.id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateUserRmas();
      });
  };

  const handleRMASubmit = () => {
    if (userRmaHours < 4) {
      return Alert.alert('You must have 4+ hours in order to process pay.');
    } else if (userRmaHours > 3 && userRmaHours % 4 !== 0) {
      const remainder = userRmaHours % 4;
      return Alert.alert(
        'You must have a total that is an increment of 4 in order to process pay.',
        `Once you have a number that is divisible by 4 in the "HOURS TO BE PAID" block, you can submit for pay.\n\nYou need to remove ${remainder} hour(s) OR add ${
          4 - remainder
        } hour(s) in order to process pay.`
      );
    } else {
      sendEmail(
        'jordan.e.kinsey.mil@army.mil',
        `${displayName} - RMA 1380 Process for Pay`,
        `I am requesting pay for completed RMAs, listed below:\n\n${listRmas(
          userRmas
        )}
                \n\n You can respond to this email or text/call at ${
                  JSON.parse(userData).phone
                } if you have any questions.`,
        `elizabeth.b.mccauley.civ@army.mil`
      );
    }
  };

  function listRmas(rmas) {
    let result = '';
    rmas.map((r) => {
      result += `${r.rma_name} - ${r.rma_hours} hours\n\n`;
    });
    return result;
  }

  const updateUserRsts = async () => {
    await supabase
      .from('users')
      .select('*, tasks:tasks(*), ebdl:ebdl(*), rst:rst(*)')
      .eq('civEmail', JSON.parse(userData).civEmail)
      .order('id', { foreignTable: 'rst', ascending: true })
      .then((response) => {
        const soldier = JSON.stringify(response.data[0]);
        setUserRsts(JSON.parse(soldier).rst);
      });
  };

  const addRst = async (hours, userId) => {
    await supabase
      .from('rst')
      .insert({
        rst_date_completed: rstDate,
        rst_date_missed: rstDateMissed,
        rst_hours: hours,
        soldier_id: userId,
      })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.error.message);
        }
        updateUserRsts();
      });
    Alert.alert('RST added.');
  };

  const deleteRst = async (rst) => {
    await supabase
      .from('rst')
      .delete()
      .eq('id', rst.id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateUserRsts();
      });
    Alert.alert('RST deleted.');
  };

  const handleRSTSubmit = () => {
    if (userRmaHours < 4) {
      return Alert.alert('You must have 4+ hours in order to process pay.');
    } else {
      sendEmail(
        'jordan.e.kinsey.mil@army.mil',
        `${displayName} - RST 1380 Process for Pay`,
        `I am requesting pay for completed RST(s), listed below:\n\n${listRsts(
          userRsts
        )}
                    \n\n You can respond to this email or text/call at ${
                      JSON.parse(userData).phone
                    } if you have any questions.`,
        `elizabeth.b.mccauley.civ@army.mil`
      );
    }
  };

  function listRsts(rsts) {
    let result = '';
    rsts.map((r) => {
      result += `RST completed on ${r.rst_date_completed}\n in lieu of absence on ${r.rst_date_missed}\n for a total of ${r.rst_hours} hours\n\n`;
    });
    return result;
  }

  const rmaSchema = Yup.object().shape({
    rma_name: Yup.string().required('You must fill this out.'),
    rma_hours: Yup.number().required('Number of hours required'),
  });

  const rstSchema = Yup.object().shape({
    hours: Yup.string().required('You must pick one.'),
  });

  // pulls up user's native email client with pre-populated data with task
  const sendEmail = async (to, subject, body, cc) => {
    let url = `mailto:${to}`;

    // Create email link query
    const query = qs.stringify({
      subject: subject,
      body: body,
      cc: cc,
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

  return (
    <SafeAreaView style={{ backgroundColor: 'white' }}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={80}
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{
          backgroundColor: '#fff',
        }}
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
          title="Your Current 1380s"
          titleStyle={{
            fontWeight: 'bold',
            color: 'black',
            fontSize: 20,
            textAlign: 'center',
            backgroundColor: 'white',
            marginTop: -10,
          }}
        />
        <List.Accordion
          style={{
            borderTopColor: 'black',
            borderTopWidth: StyleSheet.hairlineWidth,
            backgroundColor: 'white',
            marginTop: -8,
            marginBottom: 8,
            height: 80,
            justifyContent: 'center',
          }}
          titleStyle={{
            color: 'black',
            fontWeight: 700,
            textAlign: 'center',
            marginRight: -45,
          }}
          title="EBDL 1380"
        >
          <List.Item
            style={{
              backgroundColor: 'white',
              padding: 10,
              marginTop: -12,
            }}
            title={() => {
              return (
                <View
                  style={{
                    backgroundColor: 'white',
                  }}
                >
                  <Text
                    style={{
                      color: 'black',
                      backgroundColor: 'white',
                      textAlign: 'center',
                    }}
                  >
                    Here you can track your EBDL 1380 and submit when you have
                    an appropriate amount of hours accrued. In order for pay to
                    be processed, it must be AT LEAST 4 hours complete and the
                    total must be an increment of 4.{'\n'}
                    {'\n'} This will send an e-mail to the commander as well as
                    our adminstrative staff to notify them of your need for pay
                    and what you have done.{'\n'}
                    {'\n'}They will then process your 1380 and notify you when
                    pay is submitted.
                  </Text>
                  <SearchBar
                    placeholder="Search for EBDLs"
                    spinnerVisibility={spinnerVisibility}
                    onClearPress={handleCancel}
                    onChangeText={handleOnChangeText}
                    style={{ marginTop: 20, marginBottom: 2 }}
                  />
                  {ebdlList.length > 0 ? (
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled={true}
                      style={{
                        maxHeight: 150,
                        padding: 5,
                        backgroundColor: 'white',
                        zIndex: 5,
                        borderColor: 'black',
                        borderWidth: StyleSheet.hairlineWidth,
                        borderRadius: 8,
                      }}
                    >
                      {ebdlList.map((e) => (
                        <View
                          key={e.id}
                          style={{
                            backgroundColor: 'white',
                            paddingLeft: 10,
                            paddingRight: 10,
                            zIndex: 2,
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              paddingBottom: 12,
                              paddingTop: 12,
                              borderColor: 'black',
                              borderBottomWidth: StyleSheet.hairlineWidth,
                            }}
                            onPress={() => {
                              Alert.alert(
                                'Add EBDL to completed list?',
                                `Are you sure you want to add "${e.name}" to your completed list? Make sure you have the certificate of completion.`,
                                [
                                  {
                                    text: 'Cancel',
                                    onPress: () =>
                                      console.log('Cancel Pressed'),
                                    style: 'cancel',
                                  },
                                  {
                                    text: 'Add EBDL',
                                    onPress: async () => {
                                      const userId = JSON.parse(userData).id;
                                      addEbdlToSoldier(e, userId);
                                      Keyboard.dismiss();
                                    },
                                  },
                                ]
                              );
                            }}
                          >
                            <View
                              style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <List.Icon icon="arrow-right-thin" />
                              <Text
                                style={{
                                  textAlign: 'center',
                                  width: '100%',
                                }}
                              >
                                {e.name}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  ) : null}
                  {userEbdls.map((e) => (
                    <List.Item
                      key={e.id}
                      title={() => {
                        return (
                          <Text
                            style={{
                              fontWeight: '400',
                              color: 'black',
                              fontSize: 14,
                              textAlign: 'center',
                            }}
                          >
                            {e.ebdl_name}
                          </Text>
                        );
                      }}
                      titleNumberOfLines={5}
                      left={(props) => (
                        <Chip mode="outlined">{e.ebdl_hours}</Chip>
                      )}
                      right={(props) => (
                        <TouchableOpacity
                          style={{ justifyContent: 'center' }}
                          onPress={() => {
                            Alert.alert(
                              'Delete EBDL?',
                              'Are you sure you want to delete this EBDL?',
                              [
                                {
                                  text: 'Cancel',
                                  onPress: () => console.log('Cancel Pressed'),
                                  style: 'cancel',
                                },
                                {
                                  text: 'Delete EBDL',
                                  onPress: async () => {
                                    deleteEbdl(e);
                                  },
                                },
                              ]
                            );
                          }}
                        >
                          <List.Icon
                            {...props}
                            icon="trash-can"
                            color="#d90532"
                          />
                        </TouchableOpacity>
                      )}
                    />
                  ))}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}
                  >
                    <Chip
                      mode="outlined"
                      style={{
                        alignItems: 'flex-start',
                      }}
                    >
                      {userEbdlHours}
                    </Chip>
                    <Text
                      style={{
                        fontWeight: '500',
                        color: 'black',
                        fontSize: 16,
                        marginLeft: 20,
                      }}
                    >
                      HOURS TO BE PAID
                    </Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={handleEBDLSubmit}
                    title="Submit"
                    labelStyle={{ fontWeight: 'bold', color: 'white' }}
                    style={{
                      backgroundColor: '#5e5601',
                      width: 250,
                      borderColor: 'black',
                      borderWidth: 1,
                      marginTop: 20,
                      marginBottom: 20,
                      alignSelf: 'center',
                    }}
                  >
                    Submit EBDLs for Pay
                  </Button>
                </View>
              );
            }}
          />
        </List.Accordion>
        <List.Accordion
          style={{
            borderTopColor: 'black',
            borderTopWidth: StyleSheet.hairlineWidth,
            backgroundColor: 'white',
            marginTop: -8,
            marginBottom: 8,
            height: 80,
            justifyContent: 'center',
          }}
          titleStyle={{
            color: 'black',
            fontWeight: 700,
            textAlign: 'center',
            marginRight: -45,
          }}
          title="RMA 1380"
        >
          <List.Item
            style={{ backgroundColor: 'white', padding: 10, marginTop: -12 }}
            title={() => {
              return (
                <View
                  style={{
                    backgroundColor: 'white',
                  }}
                >
                  <Text
                    style={{
                      color: 'black',
                      backgroundColor: 'white',
                      textAlign: 'center',
                    }}
                  >
                    Here you can track your current RMA 1380 and submit when you
                    have an appropriate amount of hours accrued. {'\n'}
                    {'\n'}This is where you can keep track of things you do
                    outside of BA or AT{' '}
                    <Text style={{ fontStyle: 'italic' }}>
                      (ex. section tasks, platoon tasks, working on army things
                      in general)
                    </Text>{' '}
                    that you can be reimbursed for.{' '}
                    <Text style={{ fontWeight: '500' }}>
                      The Army does not want you working for free.
                    </Text>
                    {'\n'}
                    {'\n'} Once completed and you submit for pay, this will send
                    an e-mail to the commander as well as our adminstrative
                    staff to notify them of your need for pay and what you have
                    done.{'\n'}
                    {'\n'}They will then process your 1380 and notify you when
                    pay is submitted.
                  </Text>

                  <Formik
                    initialValues={{ rma_name: '', rma_hours: '' }}
                    validateOnChange={false}
                    validateOnBlur={false}
                    validationSchema={rmaSchema}
                    onSubmit={(values) => {
                      const userId = JSON.parse(userData).id;
                      addRma(values, userId);
                      values.rma_name = null;
                      values.rma_hours = null;
                    }}
                  >
                    {({
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      values,
                      errors,
                    }) => (
                      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView
                          enableOnAndroid={true}
                          keyboardOpeningTime={0}
                          keyboardShouldPersistTaps="always"
                          contentContainerStyle={{
                            flex: 1,
                            backgroundColor: '#fff',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <View>
                            <TextInput
                              style={{
                                width: 300,
                                backgroundColor: 'white',
                                textAlign: 'center',
                              }}
                              contentStyle={{ color: 'black' }}
                              mode="outlined"
                              outlineColor="black"
                              activeOutlineColor="#5e5601"
                              label="Add RMA"
                              placeholder="Must be an army-related task"
                              placeholderTextColor="grey"
                              value={values.rma_name}
                              onChangeText={handleChange('rma_name')}
                              returnKeyType="next"
                              onSubmitEditing={() => this.rmaHoursText.focus()}
                            />
                          </View>
                          {errors.rma_name && (
                            <Text
                              style={{
                                fontSize: 12,
                                color: 'red',
                                marginBottom: 2,
                                marginTop: 2,
                              }}
                            >
                              {errors.rma_name}
                            </Text>
                          )}
                          <View>
                            <TextInput
                              style={{
                                width: 300,
                                backgroundColor: 'white',
                                textAlign: 'center',
                              }}
                              contentStyle={{ color: 'black' }}
                              keyboardType="number-pad"
                              mode="outlined"
                              outlineColor="black"
                              activeOutlineColor="#5e5601"
                              label="# of hours"
                              placeholder="# of hours"
                              placeholderTextColor="grey"
                              value={values.rma_hours}
                              onChangeText={handleChange('rma_hours')}
                              ref={(input) => {
                                this.rmaHoursText = input;
                              }}
                              returnKeyType="done"
                            />
                          </View>
                          {errors.rma_hours && (
                            <Text
                              style={{
                                fontSize: 12,
                                color: 'red',
                                marginBottom: 2,
                                marginTop: 2,
                              }}
                            >
                              {errors.rma_hours}
                            </Text>
                          )}
                          <View
                            style={{
                              flexDirection: 'row',
                              gap: 20,
                              marginTop: 10,
                            }}
                          >
                            <Button
                              mode="outline"
                              onPress={handleSubmit}
                              title="Submit"
                              labelStyle={{
                                fontWeight: 'bold',
                                color: '#5e5601',
                              }}
                              style={{
                                backgroundColor: 'white',
                                borderColor: '#5e5601',
                                borderWidth: 1,
                              }}
                            >
                              +
                            </Button>
                          </View>
                        </ScrollView>
                      </TouchableWithoutFeedback>
                    )}
                  </Formik>

                  {userRmas.map((r) => (
                    <List.Item
                      key={r.id}
                      style={{
                        borderBottomColor: 'black',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      }}
                      title={() => {
                        return (
                          <Text
                            style={{
                              fontWeight: '400',
                              color: 'black',
                              fontSize: 14,
                              textAlign: 'center',
                              marginLeft: -80,
                              marginRight: -8,
                            }}
                          >
                            {r.rma_name}
                          </Text>
                        );
                      }}
                      titleNumberOfLines={5}
                      left={(props) => (
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <Chip
                            compact={true}
                            mode="outlined"
                            style={{ marginRight: -12 }}
                          >
                            {r.rma_hours}
                          </Chip>
                          <TouchableOpacity
                            onPress={() => {
                              const userId = JSON.parse(userData).id;
                              const rmaHour = r.rma_hours++;
                              addHourToRma(r, rmaHour, userId);
                            }}
                          >
                            <List.Icon
                              icon="plus"
                              color="black"
                              style={{ marginLeft: 15 }}
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                      right={(props) => (
                        <TouchableOpacity
                          style={{ justifyContent: 'center' }}
                          onPress={() => {
                            Alert.alert(
                              'Delete RMA?',
                              'Are you sure you want to delete this RMA?',
                              [
                                {
                                  text: 'Cancel',
                                  onPress: () => console.log('Cancel Pressed'),
                                  style: 'cancel',
                                },
                                {
                                  text: 'Delete RMA',
                                  onPress: async () => {
                                    deleteRma(r);
                                  },
                                },
                              ]
                            );
                          }}
                        >
                          <List.Icon
                            {...props}
                            icon="trash-can"
                            color="#d90532"
                          />
                        </TouchableOpacity>
                      )}
                    />
                  ))}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginTop: 20,
                    }}
                  >
                    <Chip
                      mode="outlined"
                      style={{
                        alignItems: 'flex-start',
                      }}
                    >
                      {userRmaHours}
                    </Chip>

                    <Text
                      style={{
                        fontWeight: '500',
                        color: 'black',
                        fontSize: 16,
                        marginLeft: 20,
                      }}
                    >
                      HOURS TO BE PAID
                    </Text>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleRMASubmit}
                    title="Submit"
                    labelStyle={{ fontWeight: 'bold', color: 'white' }}
                    style={{
                      backgroundColor: '#5e5601',
                      width: 200,
                      borderColor: 'black',
                      borderWidth: 1,
                      marginTop: 20,
                      marginBottom: 20,
                      alignSelf: 'center',
                    }}
                  >
                    Submit RMAs for Pay
                  </Button>
                </View>
              );
            }}
          />
        </List.Accordion>
        <List.Accordion
          style={{
            borderTopColor: 'black',
            borderTopWidth: StyleSheet.hairlineWidth,
            backgroundColor: 'white',
            marginTop: -8,
            marginBottom: 8,
            height: 80,
            justifyContent: 'center',
          }}
          titleStyle={{
            color: 'black',
            fontWeight: 700,
            textAlign: 'center',
            marginRight: -45,
          }}
          title="RST 1380"
        >
          <List.Item
            style={{ backgroundColor: 'white', padding: 10, marginTop: -12 }}
            title={() => {
              return (
                <View
                  style={{
                    backgroundColor: 'white',
                  }}
                >
                  <Text
                    style={{
                      color: 'black',
                      backgroundColor: 'white',
                      textAlign: 'center',
                    }}
                  >
                    Here you can add and submit your RST days COMPLETED and send
                    to the command team and administrative staff. {'\n'}
                    {'\n'}{' '}
                    <Text style={{ fontWeight: '500' }}>
                      Please include all information and submit AFTER you
                      complete the RST days.
                    </Text>
                    {'\n'}
                    {'\n'} Once completed and you submit for pay, this will send
                    an e-mail to the commander as well as our adminstrative
                    staff to notify them of your need for pay and what you have
                    done.{'\n'}
                    {'\n'}They will then process your 1380 and notify you when
                    pay is submitted.
                  </Text>

                  <Formik
                    initialValues={{
                      date_completed: rstDate,
                      date_missed: rstDateMissed,
                      hours: '',
                    }}
                    validateOnChange={false}
                    validateOnBlur={false}
                    validationSchema={rstSchema}
                    onSubmit={(values) => {
                      const userId = JSON.parse(userData).id;
                      addRst(values.hours, userId);
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
                        <ScrollView
                          enableOnAndroid={true}
                          keyboardOpeningTime={0}
                          keyboardShouldPersistTaps="always"
                          contentContainerStyle={{
                            flex: 1,
                            backgroundColor: '#fff',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <View>
                            {/* The date picker */}
                            {rstMissedPickerShow && (
                              <View>
                                <DateTimePicker
                                  value={rstDateMissed}
                                  mode={'date'}
                                  display={
                                    Platform.OS === 'ios'
                                      ? 'spinner'
                                      : 'default'
                                  }
                                  onChange={onChangeRstMissed}
                                />
                                <Button
                                  mode="outlined"
                                  onPress={() => setRstMissedPickerShow(false)}
                                >
                                  X
                                </Button>
                              </View>
                            )}
                          </View>
                          {/* Display the RST Missed Datepicker */}
                          <View
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginTop: 10,
                            }}
                          >
                            <Text style={{ fontSize: 18, fontWeight: 600 }}>
                              Date Missed:{' '}
                            </Text>
                            <TouchableOpacity
                              onPress={() => setRstMissedPickerShow(true)}
                              style={{
                                borderColor: 'black',
                                borderWidth: StyleSheet.hairlineWidth,
                                borderRadius: 8,
                                padding: 8,
                              }}
                            >
                              <Text style={{ fontSize: 18, fontWeight: 600 }}>
                                {rstDateMissed.toLocaleDateString()}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          <View>
                            {/* The date picker */}
                            {rstDatePickerShow && (
                              <View>
                                <DateTimePicker
                                  value={rstDate}
                                  mode={'date'}
                                  display={
                                    Platform.OS === 'ios'
                                      ? 'spinner'
                                      : 'default'
                                  }
                                  onChange={onChangeRstDate}
                                />
                                <Button
                                  mode="outlined"
                                  onPress={() => setRstDatePickerShow(false)}
                                >
                                  X
                                </Button>
                              </View>
                            )}
                          </View>
                          {/* Display the RST datepicker */}
                          <View
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginTop: 10,
                              marginBottom: 6,
                            }}
                          >
                            <Text style={{ fontSize: 18, fontWeight: 600 }}>
                              RST Date:{' '}
                            </Text>
                            <TouchableOpacity
                              onPress={() => setRstDatePickerShow(true)}
                              style={{
                                borderColor: 'black',
                                borderWidth: StyleSheet.hairlineWidth,
                                borderRadius: 8,
                                padding: 8,
                              }}
                            >
                              <Text style={{ fontSize: 18, fontWeight: 600 }}>
                                {rstDate.toLocaleDateString()}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          <View
                            style={{
                              backgroundColor: 'white',
                              zIndex: 300,
                            }}
                          >
                            <Text style={{ textAlign: 'center', fontSize: 10 }}>
                              Select one.
                            </Text>
                            <DropDownPicker
                              open={open}
                              value={value}
                              items={rstValues}
                              setOpen={setOpen}
                              setValue={setValue}
                              setItems={setRstValues}
                              placeholder="Select One"
                              onSelectItem={(selectedItem) => {
                                setFieldValue('hours', selectedItem.value);
                              }}
                              style={{
                                marginTop: 5,
                                borderRadius: 3,
                                maxWidth: 180,
                              }}
                              placeholderStyle={{
                                marginLeft: 5,
                                color: 'grey',
                              }}
                              selectedItemContainerStyle={{ marginLeft: 10 }}
                              textStyle={{ marginLeft: 5, fontSize: 15 }}
                              dropDownContainerStyle={{
                                position: 'relative',
                                top: 0,
                                width: 180,
                              }}
                              listMode="SCROLLVIEW"
                              scrollViewProps={{
                                nestedScrollEnabled: true,
                              }}
                            />
                          </View>
                          {errors.hours && (
                            <Text
                              style={{
                                fontSize: 12,
                                color: 'red',
                                marginBottom: 2,
                                marginTop: 2,
                              }}
                            >
                              {errors.hours}
                            </Text>
                          )}
                          <View
                            style={{
                              flexDirection: 'row',
                              gap: 20,
                              marginTop: 10,
                            }}
                          >
                            <Button
                              mode="outline"
                              onPress={handleSubmit}
                              title="Submit"
                              labelStyle={{
                                fontWeight: 'bold',
                                color: '#5e5601',
                              }}
                              style={{
                                backgroundColor: 'white',
                                borderColor: '#5e5601',
                                borderWidth: 1,
                              }}
                            >
                              +
                            </Button>
                          </View>
                        </ScrollView>
                      </TouchableWithoutFeedback>
                    )}
                  </Formik>

                  {userRsts.map((r) => (
                    <List.Item
                      key={r.id}
                      style={{
                        borderBottomColor: 'black',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      }}
                      title={() => {
                        return (
                          <View>
                            <Text
                              style={{
                                fontWeight: '400',
                                color: 'black',
                                fontSize: 12,
                                marginLeft: -50,
                              }}
                            >
                              Date Missed: {r.rst_date_missed}
                            </Text>
                            <Text
                              style={{
                                fontWeight: '400',
                                color: 'black',
                                fontSize: 12,
                                marginLeft: -50,
                              }}
                            >
                              RST Completed: {r.rst_date_completed}
                            </Text>
                          </View>
                        );
                      }}
                      titleNumberOfLines={5}
                      left={(props) => (
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <Chip
                            compact={true}
                            mode="outlined"
                            style={{ marginRight: -12 }}
                          >
                            {r.rst_hours} hours
                          </Chip>
                        </View>
                      )}
                      right={(props) => (
                        <TouchableOpacity
                          style={{ alignSelf: 'center' }}
                          onPress={() => {
                            Alert.alert(
                              'Delete RST?',
                              'Are you sure you want to delete this RST?',
                              [
                                {
                                  text: 'Cancel',
                                  onPress: () => console.log('Cancel Pressed'),
                                  style: 'cancel',
                                },
                                {
                                  text: 'Delete RST?',
                                  onPress: async () => {
                                    deleteRst(r);
                                  },
                                },
                              ]
                            );
                          }}
                        >
                          <List.Icon
                            {...props}
                            icon="trash-can"
                            color="#d90532"
                          />
                        </TouchableOpacity>
                      )}
                    />
                  ))}

                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginTop: 20,
                    }}
                  >
                    <Chip
                      mode="outlined"
                      style={{
                        alignItems: 'flex-start',
                      }}
                    >
                      {userRstHours}
                    </Chip>

                    <Text
                      style={{
                        fontWeight: '500',
                        color: 'black',
                        fontSize: 16,
                        marginLeft: 20,
                      }}
                    >
                      RST HOURS TO BE PAID
                    </Text>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleRSTSubmit}
                    title="Submit"
                    labelStyle={{ fontWeight: 'bold', color: 'white' }}
                    style={{
                      backgroundColor: '#5e5601',
                      width: 200,
                      borderColor: 'black',
                      borderWidth: 1,
                      marginTop: 20,
                      marginBottom: 20,
                      alignSelf: 'center',
                    }}
                  >
                    Submit RSTs for Pay
                  </Button>
                </View>
              );
            }}
          />
        </List.Accordion>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
