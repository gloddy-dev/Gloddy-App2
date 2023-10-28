import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import OnBoarding from './OnBoarding';
import WebViewContainer from './WebViewContainer';

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="onBoarding"
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
