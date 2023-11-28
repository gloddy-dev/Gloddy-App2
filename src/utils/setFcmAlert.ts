import { SOURCE_URL } from '@/config';
import messaging from '@react-native-firebase/messaging';
import { StackActions } from '@react-navigation/native';
import { Alert } from 'react-native';
import { getNotificationPath } from './getNotificationPath';


type RemoteMessageType = {
  data: {
    type: string;
    title: string;
    content: string;
    redirectId: string;
  };
};

export const setFcmAlert = (navigation) => {
  const unsubscribe = messaging().onMessage((remoteMessage) => {
    const {
      data,
    } = remoteMessage;
    const { type, title, content, redirectId } = data as RemoteMessageType['data'];

    const path = getNotificationPath(type, Number(redirectId));

    const pushAction = StackActions.push('WebViewContainer', {
      url: `${SOURCE_URL}${path}`,
    });

    Alert.alert(
      title,
      content,
      [
        {
          text: 'Go To Page',
          onPress: () => navigation.dispatch(pushAction),
        },
      ],
    );
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
  return unsubscribe;
}