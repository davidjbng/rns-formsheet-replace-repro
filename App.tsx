import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable'
import { createStaticNavigation, type StaticParamList, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Button, ScrollView, Text, View } from 'react-native'

/** Bump on every change, so it is visible on the device which version is being tested. */
const REPRO_VERSION = 'repro v8 · sheet from the initial state, nested stack'

/** The `fitToContents` sheet: short, so its measured height is roughly a third of the screen. */
function Sheet() {
  const navigation = useNavigation<TabStackNavigation>()
  return (
    <View style={{ padding: 24, gap: 16 }}>
      <Text>This sheet is short, so `fitToContents` measures a small height.</Text>
      <Text style={{ color: '#666' }}>{REPRO_VERSION}</Text>
      <Button title="replace() with the Long screen" onPress={() => navigation.replace('Long')} />
    </View>
  )
}

/** A plain screen of the same stack, taller than the sheet — and taller than the screen. */
function Long() {
  return (
    <ScrollView>
      <Text style={{ fontSize: 22, padding: 12 }}>{REPRO_VERSION}</Text>
      {Array.from({ length: 30 }, (_row, index) => (
        <Text key={index} style={{ fontSize: 22, padding: 12 }}>
          Row {index + 1} of 30
        </Text>
      ))}
      <Button title="Last element — expected to be reachable" onPress={() => {}} />
    </ScrollView>
  )
}

function Home() {
  const navigation = useNavigation<TabStackNavigation>()
  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: 24, padding: 24 }}>
      <Text style={{ textAlign: 'center', color: '#666' }}>{REPRO_VERSION}</Text>
      {/* The same sheet, opened later instead of from the initial state: replacing it works. */}
      <Button title="Open the form sheet (works)" onPress={() => navigation.navigate('Sheet')} />
    </View>
  )
}

// The sheet has to live in a *nested* stack: doing the same in the root stack presents the
// replacement at full size.
const TabStack = createNativeStackNavigator({
  screens: {
    Home,
    Sheet: {
      screen: Sheet,
      options: {
        presentation: 'formSheet',
        sheetAllowedDetents: 'fitToContents',
        sheetGrabberVisible: true,
        headerTitle: 'Pick something',
      },
    },
    Long,
  },
})

const Tabs = createNativeBottomTabNavigator({
  screens: {
    'First-Tab': { screen: TabStack, options: { title: 'First' } },
    'Second-Tab': { screen: Home, options: { title: 'Second' } },
  },
})

const RootStack = createNativeStackNavigator({
  screens: {
    Main: { screen: Tabs, options: { headerShown: false } },
  },
})

type TabStackNavigation = NativeStackNavigationProp<StaticParamList<typeof TabStack>>

const Navigation = createStaticNavigation(RootStack)

/**
 * The sheet is part of the state the app starts with — as it is when a deep link, a push
 * notification or a restored state opens it. Opening it later from `Home` does not reproduce.
 */
const initialState = {
  routes: [
    {
      name: 'Main',
      state: {
        routes: [{ name: 'First-Tab', state: { index: 1, routes: [{ name: 'Home' }, { name: 'Sheet' }] } }],
      },
    },
  ],
}

export default function App() {
  return <Navigation initialState={initialState} />
}
