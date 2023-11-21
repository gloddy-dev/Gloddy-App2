import messaging from '@react-native-firebase/messaging';
import { RefObject, useEffect } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import WebView from 'react-native-webview';
import { requestUserPermission } from '../utils/requestUserPermission';

type RemoteMessageType = {
  data: {
    title: string;
    content: string;
    redirectId: string;
  };
};

export function useGetUserPermission(webViewRef: RefObject<WebView>) {
  // FCM 권한
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const {
        data: { title, content, redirectId },
      } = remoteMessage;
      Alert.alert(title, content);
    });

    return unsubscribe;
  }, []);
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
}
