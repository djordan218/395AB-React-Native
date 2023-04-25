import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  SafeAreaView,
  Image,
  Text,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  RefreshControl,
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
import UserContext from '../../hooks/UserContext';
import { supabase } from '../../hooks/supabase';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DropDownPicker from 'react-native-dropdown-picker';

const App = () => {
  const { FAQData, setFAQData, userData, saveFAQDataToState } =
    useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [valueEdit, setValueEdit] = useState(null);
  const [category, setCategory] = useState([
    {
      label: 'General',
      value: 'general',
    },
    {
      label: 'Admin & HR',
      value: 'admin',
    },
    {
      label: 'Safety & Security',
      value: 'security',
    },
    {
      label: 'Training',
      value: 'training',
    },
    {
      label: 'Operations',
      value: 'operations',
    },
    {
      label: 'Logistics & Supplies',
      value: 'logistics',
    },
  ]);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [modalData, setModalData] = useState('');
  const showModalAdd = () => setVisibleAdd(true);
  const hideModalAdd = () => setVisibleAdd(false);
  const showModalEdit = () => setVisibleEdit(true);
  const hideModalEdit = () => setVisibleEdit(false);

  const modalEditData = (data) => {
    setValueEdit(data.category);
    setModalData(data);
  };

  const [refreshing, setRefreshing] = useState(false);

  // handles pull to refresh - queries database and updates FAQ state
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    saveFAQDataToState();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // adds FAQ question to DB from add form
  const addQuestionToDB = async (values) => {
    await supabase
      .from('faq')
      .insert({
        question: values.question,
        answer: values.answer,
        category: values.category,
      })
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        saveFAQDataToState();
      });
    Alert.alert('Successfully added question to the FAQ.');
  };

  // deletes FAQ from FAQ table based on question id
  const deleteQuestionFromDB = async (id) => {
    await supabase
      .from('faq')
      .delete()
      .eq('id', id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        saveFAQDataToState();
      });
    Alert.alert('Successfully deleted. RIP.');
  };

  // updates FAQ question from edit form
  // following update, resets FAQ table to state
  const updateQuestionInDB = async (values) => {
    await supabase
      .from('faq')
      .update({
        question: values.question,
        answer: values.answer,
        category: values.category,
      })
      .eq('id', values.id)
      .then((response) => {
        if (response.status >= 300) {
          Alert.alert(response.statusText);
        }
        saveFAQDataToState();
      });
    Alert.alert('FAQ updated.');
  };

  const AddToFAQSchema = Yup.object().shape({
    question: Yup.string().required('Question is required'),
    answer: Yup.string().required('Answer is required'),
    category: Yup.string().required('You must categorize the FAQ question!'),
  });
  return (
    <SafeAreaView style={{ backgroundColor: 'white' }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                question: '',
                answer: '',
                category: '',
              }}
              onSubmit={(values) => {
                addQuestionToDB(values);
                hideModalAdd();
              }}
              validationSchema={AddToFAQSchema}
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
                      Add Question to FAQ
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
                        label="What is the common question?"
                        placeholder="Must be a question"
                        placeholderTextColor="grey"
                        value={values.question}
                        onChangeText={handleChange('question')}
                      />
                    </View>
                    {errors.question && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.question}
                      </Text>
                    )}
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
                        multiline={true}
                        contentStyle={{
                          color: 'black',
                          textAlignVertical: 'auto',
                        }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="Enter an answer"
                        placeholder="Required"
                        placeholderTextColor="grey"
                        value={values.answer}
                        onChangeText={handleChange('answer')}
                      />
                    </View>
                    {errors.answer && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.answer}
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
                        items={category}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setCategory}
                        placeholder="Please select a cateogry"
                        onSelectItem={(selectedItem) => {
                          setFieldValue('category', selectedItem.value);
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
                      Add to FAQ
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
              height: 350,
              flex: 1,
            }}
          >
            <Formik
              initialValues={{
                id: modalData.id,
                question: modalData.question,
                answer: modalData.answer,
                category: modalData.category,
              }}
              onSubmit={(values) => {
                updateQuestionInDB(values);
                hideModalEdit();
              }}
              validationSchema={AddToFAQSchema}
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
                      Edit Question in FAQ
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
                        label="What is the common question?"
                        placeholder="Must be a question"
                        placeholderTextColor="grey"
                        value={values.question}
                        onChangeText={handleChange('question')}
                      />
                    </View>
                    {errors.question && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.question}
                      </Text>
                    )}
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
                        contentStyle={{
                          color: 'black',
                          textAlignVertical: 'auto',
                        }}
                        mode="outlined"
                        outlineColor="black"
                        activeOutlineColor="#5e5601"
                        label="What's the answer"
                        placeholder="Required"
                        placeholderTextColor="grey"
                        value={values.answer}
                        onChangeText={handleChange('answer')}
                      />
                    </View>
                    {errors.answer && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'red',
                          marginBottom: 2,
                          marginTop: 2,
                        }}
                      >
                        {errors.answer}
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
                        open={openEdit}
                        value={valueEdit}
                        items={category}
                        setOpen={setOpenEdit}
                        setValue={setValueEdit}
                        setItems={setCategory}
                        placeholder="Please select a cateogry"
                        onSelectItem={(selectedItem) => {
                          setFieldValue('category', selectedItem.value);
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
                      Edit
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
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <List.Section
            title="Frequently Asked Questions"
            titleStyle={{
              fontWeight: 'bold',
              color: 'black',
              fontSize: 20,
              textAlign: 'center',
              backgroundColor: 'white',
              margin: -8,
              paddingRight: -15,
            }}
          />
          {JSON.parse(userData).isAdmin ? (
            <IconButton
              icon="plus-circle-outline"
              iconColor={'#646c5c'}
              size={30}
              onPress={showModalAdd}
              style={{ marginTop: -15, marginBottom: -1 }}
            />
          ) : null}
        </View>
        <List.Section
          title="General"
          titleStyle={{
            fontWeight: 'bold',
            color: 'white',
            fontSize: 18,
            textAlign: 'center',
            backgroundColor: '#554d07',
            margin: -12,
            borderTopColor: 'black',
            borderTopWidth: StyleSheet.hairlineWidth,
          }}
        />
        {FAQData.map((f) =>
          f.category == 'general' ? (
            <List.Accordion
              key={f.id}
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
              titleNumberOfLines={100}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="comment-question-outline"
                  color="black"
                />
              )}
              title={f.question}
            >
              <List.Item
                description={f.answer}
                descriptionStyle={{
                  color: 'black',
                  marginTop: -15,
                  marginLeft: -60,
                  textAlign: 'center',
                }}
                descriptionNumberOfLines={100}
              />
              {JSON.parse(userData).isAdmin ? (
                <List.Item
                  style={{ marginTop: -15 }}
                  title={''}
                  titleStyle={{ fontWeight: '500', color: 'black' }}
                  left={(props) => (
                    <TouchableOpacity
                      style={{ marginLeft: 130 }}
                      onPress={() => {
                        Alert.alert(
                          'Delete this FAQ from the list?',
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
                                deleteQuestionFromDB(f.id);
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
                        modalEditData(f);
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
          ) : null
        )}
        <List.Section
          title="Admin & HR"
          titleStyle={{
            fontWeight: 'bold',
            color: 'white',
            fontSize: 18,
            textAlign: 'center',
            backgroundColor: '#554d07',
            margin: -12,
            borderTopColor: 'black',
            borderTopWidth: StyleSheet.hairlineWidth,
          }}
        />
        {FAQData.map((f) =>
          f.category == 'admin' ? (
            <List.Accordion
              key={f.id}
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
              titleNumberOfLines={100}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="comment-question-outline"
                  color="black"
                />
              )}
              title={f.question}
            >
              <List.Item
                description={f.answer}
                descriptionStyle={{
                  color: 'black',
                  marginTop: -15,
                  marginLeft: -60,
                  textAlign: 'center',
                }}
                descriptionNumberOfLines={100}
              />
              {JSON.parse(userData).isAdmin ? (
                <List.Item
                  style={{ marginTop: -15 }}
                  title={''}
                  titleStyle={{ fontWeight: '500', color: 'black' }}
                  left={(props) => (
                    <TouchableOpacity
                      style={{ marginLeft: 130 }}
                      onPress={() => {
                        Alert.alert(
                          'Delete this FAQ from the list?',
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
                                deleteQuestionFromDB(f.id);
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
                        modalEditData(f);
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
          ) : null
        )}
        <List.Section
          title="Safety & Security"
          titleStyle={{
            fontWeight: 'bold',
            color: 'white',
            fontSize: 18,
            textAlign: 'center',
            backgroundColor: '#554d07',
            margin: -12,
            borderTopColor: 'black',
            borderTopWidth: StyleSheet.hairlineWidth,
          }}
        />
        {FAQData.map((f) =>
          f.category == 'security' ? (
            <List.Accordion
              key={f.id}
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
              titleNumberOfLines={100}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="comment-question-outline"
                  color="black"
                />
              )}
              title={f.question}
            >
              <List.Item
                description={f.answer}
                descriptionStyle={{
                  color: 'black',
                  marginTop: -15,
                  marginLeft: -60,
                  textAlign: 'center',
                }}
                descriptionNumberOfLines={100}
              />
              {JSON.parse(userData).isAdmin ? (
                <List.Item
                  style={{ marginTop: -15 }}
                  title={''}
                  titleStyle={{ fontWeight: '500', color: 'black' }}
                  left={(props) => (
                    <TouchableOpacity
                      style={{ marginLeft: 130 }}
                      onPress={() => {
                        Alert.alert(
                          'Delete this FAQ from the list?',
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
                                deleteQuestionFromDB(f.id);
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
                        modalEditData(f);
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
          ) : null
        )}
        <List.Section
          title="Training"
          titleStyle={{
            fontWeight: 'bold',
            color: 'white',
            fontSize: 18,
            textAlign: 'center',
            backgroundColor: '#554d07',
            margin: -12,
            borderTopColor: 'black',
            borderTopWidth: StyleSheet.hairlineWidth,
          }}
        />
        {FAQData.map((f) =>
          f.category == 'training' ? (
            <List.Accordion
              key={f.id}
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
              titleNumberOfLines={100}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="comment-question-outline"
                  color="black"
                />
              )}
              title={f.question}
            >
              <List.Item
                description={f.answer}
                descriptionStyle={{
                  color: 'black',
                  marginTop: -15,
                  marginLeft: -60,
                  textAlign: 'center',
                }}
                descriptionNumberOfLines={100}
              />
              {JSON.parse(userData).isAdmin ? (
                <List.Item
                  style={{ marginTop: -15 }}
                  title={''}
                  titleStyle={{ fontWeight: '500', color: 'black' }}
                  left={(props) => (
                    <TouchableOpacity
                      style={{ marginLeft: 130 }}
                      onPress={() => {
                        Alert.alert(
                          'Delete this FAQ from the list?',
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
                                deleteQuestionFromDB(f.id);
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
                        modalEditData(f);
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
          ) : null
        )}
        <List.Section
          title="Operations"
          titleStyle={{
            fontWeight: 'bold',
            color: 'white',
            fontSize: 18,
            textAlign: 'center',
            backgroundColor: '#554d07',
            margin: -12,
            borderTopColor: 'black',
            borderTopWidth: StyleSheet.hairlineWidth,
          }}
        />
        {FAQData.map((f) =>
          f.category == 'operations' ? (
            <List.Accordion
              key={f.id}
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
              titleNumberOfLines={100}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="comment-question-outline"
                  color="black"
                />
              )}
              title={f.question}
            >
              <List.Item
                description={f.answer}
                descriptionStyle={{
                  color: 'black',
                  marginTop: -15,
                  marginLeft: -60,
                  textAlign: 'center',
                }}
                descriptionNumberOfLines={100}
              />
              {JSON.parse(userData).isAdmin ? (
                <List.Item
                  style={{ marginTop: -15 }}
                  title={''}
                  titleStyle={{ fontWeight: '500', color: 'black' }}
                  left={(props) => (
                    <TouchableOpacity
                      style={{ marginLeft: 130 }}
                      onPress={() => {
                        Alert.alert(
                          'Delete this FAQ from the list?',
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
                                deleteQuestionFromDB(f.id);
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
                        modalEditData(f);
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
          ) : null
        )}
        <List.Section
          title="Logistics & Supply"
          titleStyle={{
            fontWeight: 'bold',
            color: 'white',
            fontSize: 18,
            textAlign: 'center',
            backgroundColor: '#554d07',
            margin: -12,
            borderTopColor: 'black',
            borderTopWidth: StyleSheet.hairlineWidth,
          }}
        />
        {FAQData.map((f) =>
          f.category == 'logistics' ? (
            <List.Accordion
              key={f.id}
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
              titleNumberOfLines={100}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="comment-question-outline"
                  color="black"
                />
              )}
              title={f.question}
            >
              <List.Item
                description={f.answer}
                descriptionStyle={{
                  color: 'black',
                  marginTop: -15,
                  marginLeft: -60,
                  textAlign: 'center',
                }}
                descriptionNumberOfLines={100}
              />
              {JSON.parse(userData).isAdmin ? (
                <List.Item
                  style={{ marginTop: -15 }}
                  title={''}
                  titleStyle={{ fontWeight: '500', color: 'black' }}
                  left={(props) => (
                    <TouchableOpacity
                      style={{ marginLeft: 130 }}
                      onPress={() => {
                        Alert.alert(
                          'Delete this FAQ from the list?',
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
                                deleteQuestionFromDB(f.id);
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
                        modalEditData(f);
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
          ) : null
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 30,
  },
  title: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: '300',
    marginBottom: 10,
  },
  header: {
    backgroundColor: '#white',
    padding: 12,
  },
  headerText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
  },
  active: {
    backgroundColor: 'white',
  },
  inactive: {
    backgroundColor: 'white',
  },
  selectors: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selector: {
    backgroundColor: '#F5FCFF',
    padding: 10,
  },
  activeSelector: {
    fontWeight: 'bold',
  },
  selectTitle: {
    fontSize: 14,
    fontWeight: '500',
    padding: 10,
    textAlign: 'center',
  },
  multipleToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 30,
    alignItems: 'center',
  },
  multipleToggle__title: {
    fontSize: 16,
    marginRight: 8,
  },
});
