import {useRef, useState} from 'react';
import WebView from 'react-native-webview';
import {SOURCE_URL} from '../constants';
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer, StackActions} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function WebViewContainer() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Details"
        screenOptions={{
          ...TransitionPresets.SlideFromRightIOS,
          headerShown: false,
        }}>
        <Stack.Screen
          options={{
            transitionSpec: {
              open: {
                animation: 'spring',
                config: {
                  stiffness: 2000,
                  damping: 1000,
                },
              },
              close: {
                animation: 'spring',
                config: {
                  stiffness: 1000,
                  damping: 500,
                },
              },
            },
          }}
          name="Details"
          component={WebviewItem}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function WebviewItem({navigation, route}) {
  const webViewRef = useRef();
  const [isLoading, setIsLoading] = useState(true);

  const onNavigationStateChange = navState => {
    webViewRef.canGoBack = navState.canGoBack;
    if (!navState.url.includes(SOURCE_URL)) {
      Linking.openURL(navState.url);
      return false;
    }
  };

  const requestOnMessage = async event => {
    const nativeEvent = JSON.parse(event.nativeEvent.data);
    if (nativeEvent === 'signout') {
      await AsyncStorage.removeItem('token');
    }

    if (nativeEvent.type === 'ROUTER_EVENT') {
      const {path} = nativeEvent.data;
      if (path === 'back') {
        const popAction = StackActions.pop(1);
        navigation.dispatch(popAction);
      } else {
        const pushAction = StackActions.push('Details', {
          url: path,
          isStack: true,
        });
        navigation.dispatch(pushAction);
      }
      return;
    }
  };

  const onShouldStartLoadWithRequest = event => {
    if (!event.url.includes(SOURCE_URL)) {
      Linking.openURL(event.url);
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container} overScrollMode="never">
      <WebView
        style={styles.webview}
        ref={webViewRef}
        originWhitelist={['*']}
        source={{uri: SOURCE_URL}}
        overScrollMode="never"
        pullToRefreshEnabled
        thirdPartyCookiesEnabled={true}
        androidHardwareAccelerationDisabled={true}
        onMessage={requestOnMessage} // 웹뷰 -> 앱으로 통신
        onNavigationStateChange={onNavigationStateChange} // 웹뷰 로딩이 시작되거나 끝나면 호출하는 함수 navState로 url 감지
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} // 처음 호출한 URL에서 다시 Redirect하는 경우에, 사용하면 navState url 감지
        onLoad={() => setIsLoading(false)}
      />
      <StatusBar
        animated={false}
        backgroundColor="white"
        translucent={false}
        hidden={false}
        barStyle="dark-content"
      />
      {isLoading ? <Text>로딩 중</Text> : null}
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  webview: {
    flex: 1,
    width: windowWidth,
    height: windowHeight,
  },
});
