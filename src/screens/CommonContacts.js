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
} from 'react-native';
import {
  List,
  IconButton,
  Portal,
  Modal,
  TextInput,
  Button,
} from 'react-native-paper';
import UserContext from '../../hooks/UserContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../hooks/supabase';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function CommonContacts() {
  const {
    commonContacts,
    setCommonContacts,
    userData,
    saveCommonContactsToState,
  } = useContext(UserContext);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [modalData, setModalData] = useState('');
  const showModalAdd = () => setVisibleAdd(true);
  const hideModalAdd = () => setVisibleAdd(false);
  const showModalEdit = () => setVisibleEdit(true);
  const hideModalEdit = () => setVisibleEdit(false);
  const [refreshing, setRefreshing] = useState(false);

  // handles pull to refresh - queries database and updates CommonContacts state
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    saveCommonContactsToState();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // inserts common contact from add form
  const addCommonContactToDB = async (values) => {
    await supabase
      .from('common_contacts')
      .insert({
        contact: values.contact,
        description: values.description,
        website: values.website,
        email: values.email,
        phone: values.phone,
      })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateCommonContactState();
      });
    Alert.alert('Successfully added Common Contact. Thanks for contributing!');
  };

  // deletes common contact based by contact id
  const deleteCommonContactFromDB = async (id) => {
    await supabase
      .from('common_contacts')
      .delete()
      .eq('id', id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateCommonContactState();
      });
    Alert.alert('Common Contact deleted.');
  };

  // updates common contact from edit form
  // resets/reloads common contact state
  const updateCommonContactInDB = async (values) => {
    await supabase
      .from('common_contacts')
      .update({
        contact: values.contact,
        description: values.description,
        website: values.website,
        email: values.email,
        phone: values.phone,
      })
      .eq('id', values.id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        updateCommonContactState();
      });
    Alert.alert('Common Contact updated.');
  };

  const CommonContactSchema = Yup.object().shape({
    contact: Yup.string().required('A contact is required'),
    description: Yup.string().required('A description is required'),
    website: Yup.string(),
    email: Yup.string().email(),
    phone: Yup.string().matches(
      /^((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}$/,
      'Numbers only in xxx-xxx-xxxx format'
    ),
  });

  // used for loading textinputs with data when opening edit form
  const modalEditData = (data) => {
    setModalData(data);
  };

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
          title="Common Contacts"
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
          These are frequently used contacts. You can press the icons on the
          right to visit the website, send an email, or call.
        </List.Subheader>
        {JSON.parse(userData).isAdmin ? (
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
        ) : null}
        <Portal>
          <Modal
            visible={visibleAdd}
            onDismiss={hideModalAdd}
            dismissable={true}
            contentContainerStyle={{
              backgroundColor: 'white',
              height: 400,
              flex: 1,
            }}
          >
            <Formik
              initialValues={{
                contact: '',
                description: '',
                website: '',
                email: '',
                phone: '',
              }}
              onSubmit={(values) => {
                addCommonContactToDB(values);
                hideModalAdd();
              }}
              validationSchema={CommonContactSchema}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ errors, handleChange, handleSubmit, values }) => (
                <TouchableWithoutFeedback>
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
                    <Text
                      style={{
                        fontWeight: 'bold',
                        marginBottom: 10,
                        color: 'black',
                        fontSize: 18,
                      }}
                    >
                      Add Common Contact to List
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
                        label="Common Contact (required)"
                        placeholder="Include an acronym if appropriate"
                        placeholderTextColor="grey"
                        value={values.contact}
                        onChangeText={handleChange('contact')}
                      />
                    </View>
                    {errors.contact && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.contact}
                      </Text>
                    )}
                    <View>
                      <TextInput
                        multiline={true}
                        style={{
                          width: 300,
                          maxHeight: 100,
                          backgroundColor: 'white',
                          color: 'black',
                          textAlign: 'auto',
                        }}
                        contentStyle={{ color: 'black' }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Contact description (required)"
                        placeholder="Be as concise as possible"
                        placeholderTextColor="grey"
                        value={values.civEmail}
                        onChangeText={handleChange('description')}
                      />
                    </View>
                    {errors.description && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.description}
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
                        label="Contact website"
                        placeholder="Not required"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        value={values.website}
                        onChangeText={handleChange('website')}
                      />
                    </View>
                    {errors.website && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.website}
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
                        label="Contact e-mail"
                        placeholder="Make sure it is correct"
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
                        label="Contact phone"
                        placeholder="xxx-xxx-xxxx"
                        keyboardType="numbers-and-punctuation"
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
                    <Button
                      mode="outlined"
                      onPress={handleSubmit}
                      title="Submit"
                      labelStyle={{ fontWeight: 'bold', color: '#5e5601' }}
                      style={{
                        width: 250,
                        borderColor: '#5e5601',
                        borderWidth: 2,
                        marginTop: 10,
                      }}
                    >
                      Add Common Contact
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
            dismissable={true}
            contentContainerStyle={{
              backgroundColor: 'white',
              height: 400,
              flex: 1,
            }}
          >
            <Formik
              initialValues={{
                id: modalData.id,
                contact: modalData.contact,
                description: modalData.description,
                website: modalData.website || '',
                email: modalData.email || '',
                phone: modalData.phone || '',
              }}
              onSubmit={(values) => {
                updateCommonContactInDB(values);
                hideModalEdit();
              }}
              validationSchema={CommonContactSchema}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ errors, handleChange, handleSubmit, values }) => (
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
                  <Text
                    style={{
                      fontWeight: 'bold',
                      marginBottom: 10,
                      color: 'black',
                      fontSize: 18,
                    }}
                  >
                    Edit Common Contact
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
                      label="Common Contact"
                      placeholder="Include an acronym if appropriate"
                      placeholderTextColor="grey"
                      value={values.contact}
                      onChangeText={handleChange('contact')}
                    />
                  </View>
                  {errors.contact && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: 'red',
                        marginBottom: 2,
                        marginTop: 2,
                      }}
                    >
                      {errors.contact}
                    </Text>
                  )}
                  <View>
                    <TextInput
                      multiline={true}
                      style={{
                        width: 300,
                        maxHeight: 100,
                        backgroundColor: 'white',
                        color: 'black',
                        textAlign: 'auto',
                      }}
                      contentStyle={{ color: 'black' }}
                      mode="outlined"
                      outlineColor="black"
                      activeOutlineColor="#5e5601"
                      label="Contact description"
                      placeholder="Be as concise as possible"
                      placeholderTextColor="grey"
                      value={values.description}
                      onChangeText={handleChange('description')}
                    />
                  </View>
                  {errors.description && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: 'red',
                        marginBottom: 2,
                        marginTop: 2,
                      }}
                    >
                      {errors.description}
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
                      label="Contact website"
                      placeholder="Not required"
                      autoCapitalize="none"
                      placeholderTextColor="grey"
                      value={values.website}
                      onChangeText={handleChange('website')}
                    />
                  </View>
                  {errors.website && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: 'red',
                        marginBottom: 2,
                        marginTop: 2,
                      }}
                    >
                      {errors.website}
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
                      label="Contact e-mail"
                      placeholder="Make sure it is correct"
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
                      label="Contact phone"
                      placeholder="xxx-xxx-xxxx"
                      keyboardType="numbers-and-punctuation"
                      placeholderTextColor="grey"
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
                </KeyboardAwareScrollView>
              )}
            </Formik>
          </Modal>
        </Portal>
        {commonContacts.map((c) => (
          <List.Accordion
            key={c.id}
            style={{
              borderColor: 'black',
              borderWidth: StyleSheet.hairlineWidth,
              backgroundColor: 'white',
            }}
            titleStyle={{
              color: 'black',
              fontWeight: 500,
              textAlign: 'center',
            }}
            left={(props) => (
              <List.Icon {...props} icon="cellphone-link" color="black" />
            )}
            titleNumberOfLines={100}
            title={c.contact}
          >
            <List.Item
              description={c.description}
              descriptionStyle={{
                color: 'black',
                marginTop: -15,
                marginLeft: -60,
                textAlign: 'center',
              }}
              descriptionNumberOfLines={100}
            />
            {c.website == '' ? (
              ''
            ) : (
              <List.Item
                title={c.website}
                titleStyle={{
                  fontWeight: '500',
                  color: 'black',
                  textAlign: 'center',
                }}
                left={(props) => (
                  <List.Icon {...props} icon="web" color="black" />
                )}
                right={(props) => (
                  <TouchableOpacity
                    onPress={() => {
                      Linking.openURL(`http:${c.website}`);
                    }}
                  >
                    <List.Icon {...props} icon="search-web" color="black" />
                  </TouchableOpacity>
                )}
              />
            )}
            {c.email == '' ? (
              ''
            ) : (
              <List.Item
                title={c.email}
                titleStyle={{
                  fontWeight: '500',
                  color: 'black',
                  textAlign: 'center',
                }}
                left={(props) => (
                  <List.Icon {...props} icon="office-building" color="black" />
                )}
                right={(props) => (
                  <TouchableOpacity
                    onPress={() => {
                      Linking.openURL(`mailto:${c.email}`);
                    }}
                  >
                    <List.Icon {...props} icon="email-fast" color="black" />
                  </TouchableOpacity>
                )}
              />
            )}
            {c.phone == '' ? (
              ''
            ) : (
              <List.Item
                title={c.phone}
                titleStyle={{
                  fontWeight: '500',
                  color: 'black',
                  textAlign: 'center',
                }}
                left={(props) => (
                  <List.Icon {...props} icon="cellphone" color="black" />
                )}
                right={(props) => (
                  <TouchableOpacity
                    onPress={() => {
                      Linking.openURL(`tel:${c.phone}`);
                    }}
                  >
                    <List.Icon {...props} icon="phone" color="black" />
                  </TouchableOpacity>
                )}
              />
            )}

            {JSON.parse(userData).isAdmin ? (
              <List.Item
                title={''}
                titleStyle={{ fontWeight: '500', color: 'black' }}
                left={(props) => (
                  <TouchableOpacity
                    style={{ marginLeft: 130 }}
                    onPress={() => {
                      Alert.alert(
                        'Delete Common Contact from the list?',
                        'Are you sure? This will delete it forever. This cannot be undone.',
                        [
                          {
                            text: 'Nevermind',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel',
                          },
                          {
                            text: 'Delete',
                            onPress: () => {
                              deleteCommonContactFromDB(c.id);
                            },
                          },
                        ]
                      );
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
                      modalEditData(c);
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
