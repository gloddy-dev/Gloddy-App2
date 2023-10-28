import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ExpandingDot} from 'react-native-animated-pagination-dots';
import SplashScreen from 'react-native-splash-screen';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import Bubble1SVG from '../image/bubble1.svg';
import Bubble1enSVG from '../image/bubble1en.svg';
import Bubble2SVG from '../image/bubble2.svg';
import Bubble2enSVG from '../image/bubble2en.svg';
import Text1SVG from '../image/text1.svg';
import Text1enSVG from '../image/text1en.svg';
import Text2SVG from '../image/text2.svg';
import Text2enSVG from '../image/text2en.svg';

const deviceWidth = Dimensions.get('window').width;

const imageDataList = [
  {no: 1, uri: require('../image/character_edit.png')},
  {no: 2, uri: require('../image/character_edit2.png')},
  {no: 3, uri: require('../image/start.png')},
];

export default function OnBoarding({navigation}) {
  const lang = 'ko';
  const scrollX = useRef(new Animated.Value(0)).current;
  const [pageIndex, setpageIndex] = useState(0);
  const preloading = async () => {
    const get = await AsyncStorage.getItem('token');
    if (get) {
      navigation.replace('WebViewContainer');
    }
  };
  useEffect(() => {
    preloading();
    setTimeout(() => {
      SplashScreen.hide();
    }, 3000);
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <SwiperFlatList
        initialScrollIndex={0}
        paginationDefaultColor="gray"
        paginationActiveColor="rgb(75,133,247)"
        showPagination={false}
        pagingEnabled={true}
        paginationStyle={{bottom: 100}}
        onChangeIndex={e => setpageIndex(e.index)}
        horizontal={true}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {
            useNativeDriver: false,
          },
        )}
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
                  onPress={async () => {
                    await AsyncStorage.setItem('onBoarding', 'true');
                    navigation.replace('WebViewContainer');
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
      {pageIndex < 2 && (
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
  );
}
