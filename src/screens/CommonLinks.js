import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WebView from 'react-native-webview';
import {
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import styles from '../../styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// displays common links, user can click on each link which opens up forms in same webview browser
function Home({ navigation }) {
  return (
    <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
      <ScrollView>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            marginBottom: 25,
          }}
        >
          <Image
            style={{
              resizeMode: 'contain',
              height: 150,
              width: 150,
            }}
            source={require('../../assets/63rd.png')}
          />
          <Text style={styles.titleText}>Common Links!</Text>
          <TouchableOpacity
            style={styles.pwResetBtn}
            onPress={() => {
              navigation.navigate('LIKForm');
            }}
          >
            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
              Lodging-in-Kind (LIK) Request
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pwResetBtn}
            onPress={() => {
              navigation.navigate('RSTForm');
            }}
          >
            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
              Rescheduled Training (RST) Request
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pwResetBtn}
            onPress={() => {
              navigation.navigate('RFOForm');
            }}
          >
            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
              Request for Orders (RFO)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pwResetBtn}
            onPress={() => {
              navigation.navigate('MissionPollOne');
            }}
          >
            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
              Mission Poll #1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pwResetBtn}
            onPress={() => {
              navigation.navigate('MissionPollTwo');
            }}
          >
            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
              Mission Poll #2
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pwResetBtn}
            onPress={() => {
              navigation.navigate('MissionPollThree');
            }}
          >
            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
              Mission Poll #3
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pwResetBtn}
            onPress={() => {
              navigation.navigate('MissionPollFour');
            }}
          >
            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
              Mission Poll #4
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pwResetBtn}
            onPress={() => {
              navigation.navigate('AARForm');
            }}
          >
            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
              After Action Review (AAR)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RSTForm() {
  return (
    <WebView
      source={{
        uri: 'https://docs.google.com/forms/d/e/1FAIpQLSeDzZW7xpNx7r4NVwVKbEj_EXSukKtIxi4-8I8g_SmH928ZWQ/viewform',
      }}
    />
  );
}

function RFOForm() {
  return (
    <WebView
      source={{
        uri: 'https://docs.google.com/forms/d/e/1FAIpQLSemdJCQDd51c_CSW0ey1S2HqxTIc_UBGgmb4bWYI7Pk4IIxuw/viewform?usp=share_link',
      }}
    />
  );
}

function AARForm() {
  return (
    <WebView
      source={{
        uri: 'https://docs.google.com/forms/d/e/1FAIpQLSdSYZj3xHB6dzbqx6LwptFAfJuyqU5s7SBvW3mbZOYswBnFcw/viewform',
      }}
    />
  );
}

function LIKForm() {
  return (
    <WebView
      source={{
        uri: 'https://docs.google.com/forms/d/e/1FAIpQLSfqlP4vjTdTDGb3wAo1j3WOK6PfiEiRqSJexg9yenc8_eBVaA/viewform',
      }}
    />
  );
}

function MissionPollOne() {
  return (
    <WebView
      source={{
        uri: 'https://docs.google.com/forms/d/e/1FAIpQLSdRy_QOlqzrqFYPZn4VpgFq5tiiOPoQWgfv-3tAX_WtJ1g6Ug/viewform?usp=share_link',
      }}
    />
  );
}

function MissionPollTwo() {
  return (
    <WebView
      source={{
        uri: 'https://docs.google.com/forms/d/e/1FAIpQLSf3gcNHd45cuNTJIe_hb8CHntP5xzStSeNIIlp7ldzZSRUgbg/viewform?usp=share_link',
      }}
    />
  );
}

function MissionPollThree() {
  return (
    <WebView
      source={{
        uri: 'https://docs.google.com/forms/d/e/1FAIpQLSecUZlFKiK8vBxTkO1USKI3LJknfWiCnrCxT8JQbasqaanhUw/viewform?usp=share_link',
      }}
    />
  );
}

function MissionPollFour() {
  return (
    <WebView
      source={{
        uri: 'https://docs.google.com/forms/d/e/1FAIpQLSflJPiPFdLIa7H02IctWegpngFrJoe4wuPNFlr0nN-8GJCASA/viewform?usp=share_link',
      }}
    />
  );
}

const Stack = createNativeStackNavigator();
export default function CommonLinks() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false, title: '' }}
      />
      <Stack.Screen
        name="AARForm"
        component={AARForm}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="LIKForm"
        component={LIKForm}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="MissionPollOne"
        component={MissionPollOne}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="MissionPollTwo"
        component={MissionPollTwo}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="MissionPollThree"
        component={MissionPollThree}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="MissionPollFour"
        component={MissionPollFour}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="RFOForm"
        component={RFOForm}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="RSTForm"
        component={RSTForm}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
}
