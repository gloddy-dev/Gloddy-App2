import MainNavigator from './src/components/MainNavigator';
import React from 'react';
import {StatusBar, View} from 'react-native';

export default function App() {
  return (
    <>
      <StatusBar />
      <View style={{flex: 1}}>
        <MainNavigator />
      </View>
    </>
  );
}
