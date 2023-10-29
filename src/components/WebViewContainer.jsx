import {useGetUserPermission} from '../hooks/useGetUserPermission';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackActions} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import {SOURCE_URL} from '../constants';
import {sendFCMTokenToWebView} from '../utils/sendFCMTokenToWebView';
import Error from './Error';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function WebViewContainer({navigation, route}) {
  const webViewRef = useRef(null);
  const {isError, setIsError, onWebViewError} = useAppError();
  const url = route.params?.url ?? SOURCE_URL;
  const onWebViewLoad = async () => {
    sendFCMTokenToWebView(webViewRef);
  };

  useGetUserPermission();

  const onNavigationStateChange = navState => {
    webViewRef.canGoBack = navState.canGoBack;
    if (!navState.url.includes(SOURCE_URL)) {
      Linking.openURL(navState.url);
      return false;
    }
  };

  const onShouldStartLoadWithRequest = event => {
    if (!event.url.includes(SOURCE_URL)) {
      Linking.openURL(event.url);
      return false;
    }
    return true;
  };

  const requestOnMessage = async event => {
    const nativeEvent = JSON.parse(event.nativeEvent.data);
    const {type, data} = nativeEvent;
    switch (type) {
      case 'SIGN_OUT': {
        AsyncStorage.removeItem('token');
        break;
      }
      case 'ROUTER_EVENT': {
        const {path} = nativeEvent.data;
        if (path === 'back') {
          const popAction = StackActions.pop(1);
          navigation.dispatch(popAction);
        } else {
          const pushAction = StackActions.push('WebViewContainer', {
            url: `${SOURCE_URL}${path}`,
          });
          navigation.dispatch(pushAction);
          return;
        }
        break;
      }
    }
  };

  const onAndroidBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }

    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };
  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener(
          'hardwareBackPress',
          onAndroidBackPress,
        );
      };
    }
  }, []);

  if (isError) {
    return (
      <Error
        reload={() => {
          webViewRef.current?.reload();
          setIsError(false);
        }}
      />
    );
  }
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <WebView
        style={{
          flex: 1,
          width: windowWidth,
          height: windowHeight,
        }}
        ref={ref => {
          if (!ref) {
            return;
          }
          webViewRef.current = ref;
        }}
        originWhitelist={['*']}
        source={{uri: url}}
        overScrollMode="never"
        pullToRefreshEnabled
        thirdPartyCookiesEnabled={true}
        androidHardwareAccelerationDisabled={true}
        onNavigationStateChange={onNavigationStateChange} // 웹뷰 로딩이 시작되거나 끝나면 호출하는 함수 navState로 url 감지
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} // 처음 호출한 URL에서 다시 Redirect하는 경우에, 사용하면 navState url 감지
        onMessage={requestOnMessage} // 웹뷰 -> 앱으로 통신
        onContentProcessDidTerminate={() => webViewRef.current?.reload()}
        bounces={false}
        onError={onWebViewError}
        onLoad={onWebViewLoad}
      />
    </SafeAreaView>
  );
}

const useAppError = () => {
  const [isError, setIsError] = useState(false);

  const onWebViewError = () => {
    setIsError(true);
  };

  return {isError, setIsError, onWebViewError};
};
