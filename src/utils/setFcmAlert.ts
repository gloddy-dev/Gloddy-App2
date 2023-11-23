import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';


type RemoteMessageType = {
  data: {
    title: string;
    content: string;
    redirectId: string;
  };
};

export const setFcmAlert = () => {
  const unsubscribe = messaging().onMessage((remoteMessage) => {
    const {
      data,
    } = remoteMessage;
    const { title, content, redirectId } = data as RemoteMessageType['data'];
    Alert.alert(title, content);
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
  return unsubscribe;
}