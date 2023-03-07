import * as React from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, RefreshControl } from 'react-native';
import UserContext from '../../hooks/UserContext';

// page that displays the BA newsletter
// user can reload the newsletter by changing the state
export default function NewsletterScreen() {
  const { newsletterWebViewValue, setNewsletterWebViewValue } =
    React.useContext(UserContext);
  return (
    <WebView
      key={newsletterWebViewValue}
      startInLoadingState={true}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        marginTop: -50,
      }}
      source={{
        uri: 'https://drive.google.com/file/d/12h6DmIKIXYe8L7a5LeNZMX4NW_BcM-jE/view?usp=share_link',
      }}
    />
  );
}
