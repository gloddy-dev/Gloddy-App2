import React from 'react';
import {StatusBar, View} from 'react-native';

import MainNavigator from './components/MainNavigator';

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
