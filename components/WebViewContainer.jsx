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
import {requestUserPermission} from '../src/utils/requestUserPermission';
import Error from './Error';

export default function WebViewContainer({navigation, route}) {
  const webViewRef = useRef();
  const {isError, setIsError, onWebViewError} = useAppError();

  // 앱이 Foreground 인 상태에서 푸쉬알림 받는 코드 작성
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  // 앱이 Background 이거나 꺼진 상태에서 푸쉬알림 받는 코드 작성
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

  // 뒤로 가기 control
  const [exit, setexit] = useState(false);
  const [swexit, setswexit] = useState(0);
  const backAction = () => {
    // 500(0.5초) 안에 back 버튼을 한번 더 클릭 할 경우 앱 종료
    setswexit(swexit => swexit + 1);
    return true;
  };

  useEffect(() => {
    let timer;
    if (exit === false) {
      webViewRef?.current?.goBack();
      setexit(true);
      timer = setTimeout(function () {
        setexit(false);
      }, 500);
    } else {
      clearTimeout(timer);
      BackHandler.exitApp();
    }
  }, [swexit]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

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
        await requestUserPermission();
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
    if (nativeEvent === 'signout') {
      await AsyncStorage.removeItem('token');
    }

    if (nativeEvent.type === 'ROUTER_EVENT') {
      const {path} = nativeEvent.data;
      if (path === 'back') {
        const popAction = StackActions.pop(1);
        navigation.dispatch(popAction);
      } else {
        const pushAction = StackActions.push('WebViewContainer', {
          url: 'https://www.naver.com',
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
          ref={webViewRef}
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
