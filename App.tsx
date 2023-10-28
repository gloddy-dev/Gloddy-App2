import MainNavigator from './src/components/MainNavigator';
import React from 'react';
import {StatusBar, View} from 'react-native';

export default function App() {
  return (
    <>
      <StatusBar
        animated={false}
        backgroundColor="white"
        translucent={false}
        hidden={false}
        barStyle="dark-content"
      />
      <View style={{flex: 1}}>
        <MainNavigator />
      </View>
    </>
  );
}
