import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  AppRegistry,
  BackHandler,
  Dimensions,
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ExpandingDot} from 'react-native-animated-pagination-dots';
import * as RNLocalize from 'react-native-localize';
import {PERMISSIONS, request} from 'react-native-permissions';
import SplashScreen from 'react-native-splash-screen';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import {WebView} from 'react-native-webview';
import Bubble1SVG from './image/bubble1.svg';
import Bubble1enSVG from './image/bubble1en.svg';
import Bubble2SVG from './image/bubble2.svg';
import Bubble2enSVG from './image/bubble2en.svg';
import Text1SVG from './image/text1.svg';
import Text1enSVG from './image/text1en.svg';
import Text2SVG from './image/text2.svg';
import Text2enSVG from './image/text2en.svg';
import messaging from '@react-native-firebase/messaging';

import {StackActions} from '@react-navigation/native';
import {SOURCE_URL} from './constants';
import WebViewContainer from './components/WebViewContainer';

// Firebase 알림
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

const deviceWidth = Dimensions.get('window').width;

const imageDataList = [
  {no: 1, uri: require('./image/character_edit.png')},
  {no: 2, uri: require('./image/character_edit2.png')},
  {no: 3, uri: require('./image/start.png')},
];

export default function App() {
  const webViewRef = useRef();
  const [lang, setlang] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [webloading, setwebloading] = useState(true);
  const [showindex, setshowindex] = useState(true);

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

  AppRegistry.registerComponent('app', () => App);

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

  const preloading = async () => {
    const lang = RNLocalize.getLocales()[0].languageCode;
    setlang(lang);
    const get = await AsyncStorage.getItem('token');
    if (get) {
      setwebloading(false);
    }
  };
  useEffect(() => {
    preloading();
    setTimeout(() => {
      SplashScreen.hide();
    }, 3000);
  }, []);

  // 사진 라이브러리를 사용하기 전에 이 함수를 호출해야 합니다.
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

  const handlestart = async () => {
    await AsyncStorage.setItem('token', 'ok');
    setwebloading(false);
  };

  return (
    <SafeAreaView
      overScrollMode="never"
      style={{flex: 1, backgroundColor: 'white'}}>
      {webloading ? (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <SwiperFlatList
            initialScrollIndex={0}
            paginationDefaultColor="gray"
            paginationActiveColor="rgb(75,133,247)"
            showPagination={false}
            pagingEnabled={true}
            paginationStyle={{bottom: 100}}
            onChangeIndex={e => setshowindex(e.index)}
            horizontal={true}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {x: scrollX}}}],
              {
                useNativeDriver: false,
              },
            )}
            onContentProcessDidTerminate={() => webViewRef.current.reload()}
            data={imageDataList}
            renderItem={({item, index}) => {
              return (
                <View
                  style={{
                    width: deviceWidth,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {index === 0 ? (
                    <View style={{alignItems: 'center'}}>
                      {lang === 'ko' ? <Bubble1SVG /> : <Bubble1enSVG />}
                      <Image
                        style={{
                          width: deviceWidth * 0.8,
                          height: deviceWidth * 0.8,
                          marginVertical: 20,
                        }}
                        source={item.uri}
                        resizeMode="contain"
                      />
                      {lang === 'ko' ? <Text1SVG /> : <Text1enSVG />}
                    </View>
                  ) : index === 1 ? (
                    <View style={{alignItems: 'center'}}>
                      {lang === 'ko' ? <Bubble2SVG /> : <Bubble2enSVG />}
                      <Image
                        style={{
                          width: deviceWidth * 0.8,
                          height: deviceWidth * 0.8,
                          marginBottom: 20,
                          marginTop: 10,
                        }}
                        source={item.uri}
                        resizeMode="contain"
                      />
                      {lang === 'ko' ? <Text2SVG /> : <Text2enSVG />}
                    </View>
                  ) : (
                    <Image
                      style={{
                        width: deviceWidth * 0.7,
                        height: deviceWidth * 1.6,
                      }}
                      source={item.uri}
                      resizeMode="contain"
                    />
                  )}

                  {index === 2 && (
                    <TouchableOpacity
                      onPress={() => {
                        handlestart();
                      }}
                      style={{
                        width: deviceWidth * 0.9,
                        height: 60,
                        borderRadius: 10,
                        backgroundColor: 'rgb(75,133,247)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 20,
                          fontWeight: 'bold',
                        }}>
                        {lang === 'ko' ? '시작하기' : 'START'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            keyExtractor={(item, index) => String(index)}
          />
          {showindex !== 2 && (
            <ExpandingDot
              data={['1', '2']}
              expandingDotWidth={30}
              scrollX={scrollX}
              activeDotColor="rgb(75,133,247)"
              inActiveDotColor="gray"
              inActiveDotOpacity={0.6}
              dotStyle={{
                width: 10,
                height: 10,
                backgroundColor: '#347af0',
                borderRadius: 5,
                marginHorizontal: 5,
              }}
              containerStyle={{
                bottom: 30,
              }}
            />
          )}
        </View>
      ) : (
        <View overScrollMode="never" style={{flex: 1}}>
          <WebViewContainer />
        </View>
      )}

      <StatusBar
        animated={false}
        backgroundColor="white"
        translucent={false}
        hidden={false}
        barStyle="dark-content"
      />
    </SafeAreaView>
  );
}
