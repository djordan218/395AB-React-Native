import React from 'react';
import {
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import styles from '../../styles';
import {Formik} from 'formik';
import * as Yup from 'yup';

export default function ForgotPassword({navigation}) {
  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email')
      .required('You must provide an email'),
  });
  return (
    <Formik
      initialValues={{email: ''}}
      validationSchema={ForgotPasswordSchema}
      validateOnBlur={false}
      onSubmit={values => console.log(values)}>
      {({handleChange, handleBlur, handleSubmit, values, errors}) => (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={100}
            style={styles.container}>
            <Image
              style={styles.image}
              source={require('../../assets/63rd.png')}
            />
            <Text style={styles.titleText}>395th Army Band</Text>
            <View>
              <TextInput
                style={{width: 300, backgroundColor: 'white', color: 'black'}}
                contentStyle={{color: 'black'}}
                mode="outlined"
                outlineColor="black"
                activeOutlineColor="#554d07"
                label="Enter your e-mail"
                placeholder="E-mail must be on the unit roster"
                placeholderTextColor="black"
                autoCapitalize="none"
                value={values.email}
                onChangeText={handleChange('email')}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <View>
              <View style={{flexDirection: 'row', gap: 20, marginTop: 10}}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  title="Submit"
                  labelStyle={{fontWeight: 'bold', color: 'white'}}
                  style={{
                    backgroundColor: '#554d07',
                    width: 120,
                    borderColor: 'black',
                    borderWidth: 1,
                  }}>
                  Submit
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      )}
    </Formik>
  );
}
