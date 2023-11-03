import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { requestUserPermission } from '../utils/requestUserPermission';

export function useGetUserPermission() {
  // FCM 권한
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const {
        data: { body, title },
      } = remoteMessage;
      Alert.alert(title, body);
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
