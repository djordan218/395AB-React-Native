import React from 'react';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -100,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginBottom: 2,
    marginTop: 2,
  },
  image: {
    resizeMode: 'contain',
    height: 200,
    width: 200,
    marginTop: -30,
  },
  imageSmall: {
    resizeMode: 'contain',
    height: 100,
    width: 100,
    marginTop: -30,
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
  inputView: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 2,
    width: '90%',
    height: 50,
    marginBottom: 10,
    alignItems: 'center',
  },
  TextInput: {
    textAlign: 'center',
    width: '100%',
    height: 50,
    flex: 1,
  },
  TextInputEmail: {
    textAlign: 'center',
    height: 50,
    flex: 1,
  },
  forgot_button: {
    height: 30,
    marginBottom: 10,
  },
  loginBtn: {
    width: '80%',
    borderRadius: 10,
    borderWidth: 2,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#da0034',
  },
  registerBtn: {
    width: '80%',
    borderRadius: 10,
    borderWidth: 2,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#554d07',
  },
  loginText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  registerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
  pwResetBtn: {
    width: '80%',
    borderRadius: 10,
    borderWidth: 2,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#f8d360',
  },
  smallWhiteBtn: {
    width: '60%',
    borderRadius: 5,
    borderWidth: 1,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#white',
  },
  visibilityBtn: {
    position: 'absolute',
    right: 12,
    height: 25,
    width: 25,
    padding: 0,
    marginTop: 11,
  },
  input: {
    margin: 15,
    borderColor: 'black',
    borderWidth: 1,
  },
  dropdown: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    width: '90%',
    marginBottom: 10,
  },
});

module.exports = styles;
