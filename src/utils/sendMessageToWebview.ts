import { RefObject } from 'react';
import WebView from 'react-native-webview';

export default function sendMessageToWebview(
  webViewRef: RefObject<WebView>,
  message: string,
) {
  webViewRef.current?.postMessage(message);
}
