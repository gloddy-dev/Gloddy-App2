import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {StackActions} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  AppRegistry,
  BackHandler,
  Dimensions,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import {PERMISSIONS, request} from 'react-native-permissions';
import {SafeAreaView} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import {SOURCE_URL} from '../constants';
import {requestUserPermission} from '../utils/requestUserPermission';
import {sendFCMTokenToWebView} from '../utils/sendFCMTokenToWebView';
import Error from './Error';

export default function WebViewContainer({navigation, route}) {
  const webViewRef = useRef(null);
  const {isError, setIsError, onWebViewError} = useAppError();
  const onWebViewLoad = async () => {
    sendFCMTokenToWebView(webViewRef);
  };

  // 앱이 Foreground 인 상태에서 푸쉬알림 받는 코드 작성
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  // 앱이 Background 이거나 꺼진 상태에서 푸쉬알림 받는 코드 작성
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

  // 권한설정
  useEffect(() => {
    if (Platform.OS === 'android') {
      const getper = async () => {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION,
        );
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      };
      getper();
    }
    if (Platform.OS === 'ios') {
      const requestPhotoLibraryPermission = async () => {
        await request(PERMISSIONS.IOS.CAMERA);
        await request(PERMISSIONS.IOS.MICROPHONE);
        await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      };
      requestPhotoLibraryPermission();
    }
  }, []);

  const onNavigationStateChange = navState => {
    webViewRef.canGoBack = navState.canGoBack;
    if (!navState.url.includes(SOURCE_URL)) {
      Linking.openURL(navState.url);
      return false;
    }
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
          console.log(`${SOURCE_URL}/ko${path}`);
          const pushAction = StackActions.push('WebViewContainer', {
            url: `${SOURCE_URL}/ko${path}`,
            isStack: true,
          });
          navigation.dispatch(pushAction);
        }
        break;
      }
    }
  };

  const onShouldStartLoadWithRequest = event => {
    if (!event.url.includes(SOURCE_URL)) {
      Linking.openURL(event.url);
      return false;
    }
    return true;
  };

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
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <WebView
          style={styles.webview}
          ref={ref => {
            if (!ref) {
              return;
            }
            webViewRef.current = ref;
          }}
          originWhitelist={['*']}
          source={{uri: SOURCE_URL}}
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
    </>
  );
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    width: windowWidth,
    height: windowHeight,
  },
});

const useAppError = () => {
  const [isError, setIsError] = useState(false);

  const onWebViewError = () => {
    setIsError(true);
  };

  return {isError, setIsError, onWebViewError};
};
