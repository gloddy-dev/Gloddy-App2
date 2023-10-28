import React from 'react';

import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import OnBoarding from './OnBoarding';
import WebViewContainer from './WebViewContainer';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {useFlipper} from '@react-navigation/devtools';

const Stack = createStackNavigator();

export default function MainNavigator() {
  const navigationRef = useNavigationContainerRef();

  useFlipper(navigationRef);

  return (
    <NavigationContainer ref={navigationRef}>
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
