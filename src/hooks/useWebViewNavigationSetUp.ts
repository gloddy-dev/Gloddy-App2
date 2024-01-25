import Header from '@/components/Header';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useLayoutEffect} from 'react';

export default function useWebViewNavigationSetUp() {
  const navigation = useNavigation();
  const params = useRoute().params;

  useLayoutEffect(() => {
    if (!params.title) return;

    navigation.setOptions({
      headerShown: true,
      title: params.title,
      header: Header,
    });
  }, [params, navigation]);
}
