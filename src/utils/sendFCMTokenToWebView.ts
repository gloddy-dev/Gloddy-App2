import {RefObject} from 'react';
import WebView from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';

export async function sendFCMTokenToWebView(webViewRef: RefObject<WebView>) {
  try {
    const token = await messaging().getToken();
    webViewRef.current?.postMessage(
      JSON.stringify({type: 'FCM_TOKEN', data: token}),
    );
  } catch (error) {
    console.log(error);
  }
}
