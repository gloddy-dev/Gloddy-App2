import React from 'react';

import {useFlipper} from '@react-navigation/devtools';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import OnBoarding from './OnBoarding';
import WebViewContainer from './WebViewContainer';

const Stack = createStackNavigator();

export default function MainNavigator() {
  const navigationRef = useNavigationContainerRef();
  useFlipper(navigationRef);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="OnBoarding"
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
