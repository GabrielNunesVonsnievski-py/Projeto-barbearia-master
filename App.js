import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/Pages/Login';
import Agendamento from './src/Pages/Agendamento';
import Cadastrar from './src/Pages/Cadastrar';
import Horario from './src/Pages/Horario';
import NewHorario from './src/Pages/NewHorario';
import Home from './src/Pages/Home';
import Details from './src/Pages/Details';
import ManagerHome from './src/Pages/ManagerHome';
import BarbeiroHome from './src/Pages/BarbeiroHome';
import Loading from './src/Pages/Loading';

export default function App() { 
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
      initialRouteName='Login'
      screenOptions={{
        headerTintColor: '#373d20'
      }}>
        <Stack.Screen
        name='Login'
        component={Login}
        options={{headerShown:false}}/>

        <Stack.Screen
        name='Cadastrar'
        component={Cadastrar}
        options={{headerShown:false}}/>


      <Stack.Screen name='Home' component={Home} />
      <Stack.Screen name='Agendamento' component={Agendamento} />
      <Stack.Screen name='Horario' component={Horario} />
      <Stack.Screen name='NewHorario' component={NewHorario} />
      <Stack.Screen name='Details' component={Details} />
      <Stack.Screen name='ManagerHome' component={ManagerHome} />
      <Stack.Screen name='BarbeiroHome' component={BarbeiroHome} />
      <Stack.Screen name='Loading' component={Loading} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
