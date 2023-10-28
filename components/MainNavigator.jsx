import React, {useEffect, useState} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import OnBoarding from './OnBoarding';
import WebViewContainer from './WebViewContainer';

const Stack = createStackNavigator();
export default function MainNavigator() {
  const [firstView, setFirstView] = useState('');
  useEffect(() => {
    const a = async () => {
      const onBoarding = await AsyncStorage.getItem('onBoarding');
      if (onBoarding) {
        setFirstView('WebViewContainer');
      }
    };
    a();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={firstView}
        screenOptions={{
          ...TransitionPresets.SlideFromRightIOS,
          headerShown: false,
        }}>
        <Stack.Screen name="onBoarding" component={OnBoarding} />
        <Stack.Screen name="WebViewContainer" component={WebViewContainer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
