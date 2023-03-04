import * as React from 'react';
import { WebView } from 'react-native-webview';
import {
  View,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import UserContext from '../../hooks/UserContext';

export default function Announcements() {
  const { homeWebViewValue, setHomeWebViewValue } =
    React.useContext(UserContext);
  return (
    <WebView
      key={homeWebViewValue}
      startInLoadingState={true}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        marginTop: -100,
      }}
      source={{
        uri: 'https://docs.google.com/document/d/1YyUckKUmSlUCLn4uHkJiaDa6-o1liimDc17hDpGdyQE/edit?usp=share_link',
      }}
    />
  );
}
