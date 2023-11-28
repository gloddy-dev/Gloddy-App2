import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackActions} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {Alert, BackHandler, Dimensions, Linking, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import {sendFCMTokenToWebView} from '../utils/sendFCMTokenToWebView';
import Error from './Error';

import {useDidMount} from '@/hooks/useDidMount';
import {getPermission} from '@/utils/getPermission';
import {setFcmAlert} from '@/utils/setFcmAlert';
import messaging from '@react-native-firebase/messaging';
import RNRestart from 'react-native-restart'; // Import package from node modules
import {SOURCE_URL} from '../config';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function WebViewContainer({navigation, route}) {
  const webViewRef = useRef(null);
  const {isError, setIsError, onWebViewError} = useAppError();
  const url = route.params?.url ?? SOURCE_URL;

  useDidMount(async () => {
    /* 권한 요청 */
    sendFCMTokenToWebView(webViewRef);
    await getPermission('camera');
    await getPermission('photoLibrary');
    await messaging().requestPermission();
    setFcmAlert(navigation);
  }, []);

  /* 안드로이드 뒤로가기 */
  useDidMount(() => {
    const handleAndroidBackPress = () => {
      if (navigation.canGoBack()) navigation.goBack();
      else {
        Alert.alert(
          'Hold on!(잠시만요!)',
          'Are you sure you want to quit the program?(앱을 종료하시겠습니까?)',
          [
            {
              text: 'Cancel(취소)',
              onPress: () => null,
            },
            {text: 'Confirm(확인)', onPress: () => BackHandler.exitApp()},
          ],
        );
      }

      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', handleAndroidBackPress);
      return () => {
        BackHandler.removeEventListener(
          'hardwareBackPress',
          handleAndroidBackPress,
        );
      };
    }
  });

  /* (iOS)외부 페이지 이동 */
  const onNavigationStateChange = navState => {
    if (!navState.url.includes(SOURCE_URL)) {
      Linking.openURL(navState.url).catch(err => {});
      return false;
    }
  };
  const onShouldStartLoadWithRequest = navState => {
    if (!navState.url.includes(SOURCE_URL)) {
      Linking.openURL(navState.url).catch(err => {});
      return false;
    }
    return true;
  };

  /* 페이지 이동 */
  const requestOnMessage = async event => {
    const nativeEvent = JSON.parse(event.nativeEvent.data);
    const {type, data} = nativeEvent;
    switch (type) {
      case 'SIGN_OUT': {
        AsyncStorage.removeItem('token');
        break;
      }
      case 'ROUTER_EVENT': {
        const {path, type: pathType} = data;
        switch (pathType) {
          case 'PUSH':
            const pushAction = StackActions.push('WebViewContainer', {
              url: `${SOURCE_URL}${path}`,
            });
            navigation.dispatch(pushAction);
            break;
          case 'BACK':
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
            break;
          case 'REPLACE':
            const replaceAction = StackActions.replace('WebViewContainer', {
              url: `${SOURCE_URL}${path}`,
            });
            navigation.dispatch(replaceAction);
            break;
          case 'RESET':
            RNRestart.Restart();
        }
      }
    }
  };

  if (isError) {
    return (
      <Error
        reload={() => {
          webViewRef.current?.reload();
          RNRestart.Restart();
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
        ref={webViewRef}
        originWhitelist={['*']}
        source={{uri: url}}
        overScrollMode="never"
        pullToRefreshEnabled
        thirdPartyCookiesEnabled={true}
        androidHardwareAccelerationDisabled={true}
        onNavigationStateChange={onNavigationStateChange}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onMessage={requestOnMessage} // 웹뷰 -> 앱으로 통신
        onContentProcessDidTerminate={() => webViewRef.current?.reload()}
        bounces={false}
        onError={onWebViewError}
        onLoad={onWebViewLoad}
        webviewDebuggingEnabled={true}
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
