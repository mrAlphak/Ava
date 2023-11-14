import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {LogBox} from 'react-native'
import { NavigationContainer } from "@react-navigation/native"
import Screens from "./screens"

const Stack = createNativeStackNavigator()
LogBox.ignoreAllLogs()
const App =()=>{
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="splash" component={Screens.Splash} options={{headerShown: false}} />
        <Stack.Screen name="register" component={Screens.Register} options={{headerShown: false}} />
        <Stack.Screen name="main" component={Screens.Main} options={{headerShown: false, animation: "slide_from_right"}} />
        <Stack.Screen name="imageViewer" component={Screens.ImageViewer} options={{headerShown: false, animation: "slide_from_right"}} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App