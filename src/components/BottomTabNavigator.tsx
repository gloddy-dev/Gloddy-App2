import {
  BottomTabBarProps,
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import WebViewContainer from './WebViewContainer';
import {PropsWithChildren, useMemo} from 'react';
import TabBar from './TabBar';

const BottomTab = createBottomTabNavigator();

const BottomTabNavigator = ({children}: PropsWithChildren) => {
  const props = useMemo(
    () => ({
      tabBar: (props: BottomTabBarProps) => <TabBar {...props} />,
      screenOptions: {
        headerShown: false,
        lazy: false,
      } satisfies BottomTabNavigationOptions,
    }),
    [],
  );
  return <BottomTab.Navigator {...props}>{children}</BottomTab.Navigator>;
};

BottomTabNavigator.createScreen = ({
  name,
  url,
}: {
  name: string;
  url: string;
}) => (
  <BottomTab.Screen
    name={name}
    component={WebViewContainer}
    initialParams={{url, edges: ['top']}}
  />
);

export default BottomTabNavigator;
