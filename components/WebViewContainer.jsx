import {useRef} from 'react';
import WebView from 'react-native-webview';
import {SOURCE_URL} from '../constants';
import {Alert, Linking, Platform} from 'react-native';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WebViewContainer() {
  const webViewRef = useRef();

  const sendweb = () => {
    try {
      const lang = RNLocalize.getLocales()[0].languageCode;
      const payload = {
        type: 'RNLocalize',
        Platform: Platform.OS,
        data: lang,
      };
      webViewRef.current.postMessage(JSON.stringify(payload));
    } catch (error) {
      console.log(error);
    }
  };

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
      Alert.alert(path);
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
    <>
      <WebView
        style={{flex: 1}}
        ref={webViewRef}
        originWhitelist={['*']}
        source={{uri: SOURCE_URL}}
        overScrollMode="never"
        pullToRefreshEnabled
        thirdPartyCookiesEnabled={true}
        androidHardwareAccelerationDisabled={true}
        onLoad={() => sendweb()}
        onMessage={requestOnMessage} // 웹뷰 -> 앱으로 통신
        onNavigationStateChange={onNavigationStateChange} // 웹뷰 로딩이 시작되거나 끝나면 호출하는 함수 navState로 url 감지
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} // 처음 호출한 URL에서 다시 Redirect하는 경우에, 사용하면 navState url 감지
      />
    </>
  );
}
