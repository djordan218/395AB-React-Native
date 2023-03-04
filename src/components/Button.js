import * as React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

export default function ProfileScreen({ label, onPress }) {
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        style={{
          borderRadius: 8,
          height: 50,
          width: 245,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#554d07',
        }}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <Text
          style={{ fontSize: 18, color: 'white', textTransform: 'uppercase' }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
