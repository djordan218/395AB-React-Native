import * as React from 'react';
import { WebView } from 'react-native-webview';
import UserContext from '../../hooks/UserContext';

export default function Schedule() {
  const { scheduleWebViewValue, setScheduleWebViewValue } =
    React.useContext(UserContext);
  return (
    <WebView
      key={scheduleWebViewValue}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        marginTop: -100,
      }}
      source={{
        uri: 'https://docs.google.com/document/d/1u0sb3kNb4iwgawZDxRCsiAuo0gS02itRh6naBuHrkGw/edit?usp=share_link',
      }}
    />
  );
}
