import * as React from 'react';
import { WebView } from 'react-native-webview';
import {
  View,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import UserContext from '../../hooks/UserContext';

// main home page with announcements
// cropped top of webview to not allow user to go back or navigate and make webview - view only
export default function LoadingScreen() {
  const colors = ['#554d07', '#f8d360', '#d90532', '#7d4215'];
  function getRandomInt() {
    const idx = Math.floor(Math.random() * colors.length);
    return colors[idx];
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        opacity: 0.4,
      }}
    >
      <ActivityIndicator color="#d90532" size={'large'} />
    </View>
  );
}
