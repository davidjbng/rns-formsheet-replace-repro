import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable'
import { createStaticNavigation, type StaticParamList, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Button, ScrollView, Text, View } from 'react-native'

function Home() {
  const navigation = useNavigation<TabStackNavigation>()
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Button title="1. Open the form sheet" onPress={() => navigation.navigate('Sheet')} />
    </View>
  )
}

/** The `fitToContents` sheet: short, so its measured height is roughly a third of the screen. */
function Sheet() {
  const navigation = useNavigation<TabStackNavigation>()
  return (
    <View style={{ padding: 24, gap: 16 }}>
      <Text>This sheet is short, so `fitToContents` measures a small height.</Text>
      <Button title="2. replace() with the Long screen" onPress={() => navigation.replace('Long')} />
    </View>
  )
}

/** A plain screen of the same stack, taller than the sheet — and taller than the screen. */
function Long() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      {Array.from({ length: 30 }, (_row, index) => (
        <Text key={index} style={{ fontSize: 22, padding: 12 }}>
          Row {index + 1} of 30
        </Text>
      ))}
      <Button title="Last element — expected to be reachable" onPress={() => {}} />
    </ScrollView>
  )
}

// The sheet lives in a stack of a tab, i.e. two navigators deep. Replacing a form sheet screen of
// the root stack presents the replacement correctly.
const TabStack = createNativeStackNavigator({
  screens: {
    Home,
    Sheet: {
      screen: Sheet,
      options: { presentation: 'formSheet', sheetAllowedDetents: 'fitToContents' },
    },
    Long,
  },
})

const Tabs = createNativeBottomTabNavigator({
  screens: {
    'First-Tab': { screen: TabStack, options: { title: 'First' } },
    'Second-Tab': { screen: Long, options: { title: 'Second' } },
  },
})

const RootStack = createNativeStackNavigator({
  screens: {
    Main: { screen: Tabs, options: { headerShown: false } },
  },
})

type TabStackNavigation = NativeStackNavigationProp<StaticParamList<typeof TabStack>>

const Navigation = createStaticNavigation(RootStack)

export default function App() {
  return <Navigation />
}
