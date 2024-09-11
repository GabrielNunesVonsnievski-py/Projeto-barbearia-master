import React, { useState } from 'react';
import { View, Image, TextInput, TouchableOpacity, StyleSheet, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../Config/firebaseconfig';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const LoginUser = async () => {
    try {
      //campos preenchidos
      if (!email || !password) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos.');
        return;
      }

      //fazer login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in:', user);

      //usuário no Firestore
      const db = getFirestore();
      const userDocRef = doc(db, 'cliente', user.uid); 
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data:', userData);

        if (userData.role === 'manager') {
          navigation.navigate('ManagerHome', { idUser: user.uid });
        } 
        else if (userData.role === 'barbeiro') {
          navigation.navigate('BarbeiroHome', { idUser: user.uid });
        } 
        else {
          navigation.navigate('Home', { idUser: user.uid });
        }
      } else {
        Alert.alert('Erro', 'Nenhum dado encontrado para este usuário.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Erro', 'Email ou senha inválidos. Por favor, tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Banner */}
          <View style={styles.banner}>
            <Image
              source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs7WRs_S875bpXggXPJ7A748m8J7XmKX08dQ&s' }}
              style={styles.image}
            />
            <Text style={styles.bannerText}>MAJESTOSO</Text>
          </View>

          {/* Formulário */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(182, 144, 69, 0.5)"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="rgba(182, 144, 69, 0.5)"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
            />
            <TouchableOpacity style={styles.btnLogin} onPress={LoginUser}>
              <Text style={styles.txtbtnLogin}>LOGIN</Text>
            </TouchableOpacity>
            <Text
              style={styles.txtNewuser}
              onPress={() => navigation.navigate('Cadastrar')}>
              Não possui uma conta? Criar
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Telefone: (48) 99933-2071</Text>
        <Text style={styles.footerText}>Email: MajestosoBarbearia@gmail.com</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 80, // Espaço para o footer
  },
  banner: {
    width: '100%',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingTop: 60, // Ajustado para criar espaço para a área de status
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  bannerText: {
    color: '#b69045',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  formContainer: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 90
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#b69045',
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: 'black',
    width: '100%',
  },
  btnLogin: {
    backgroundColor: '#b69045',
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  txtbtnLogin: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  txtNewuser: {
    color: '#373D20',
    fontSize: 12,
    padding: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    position: 'flex',
    bottom: -3,
    width: '100%',
    backgroundColor: 'black',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 50
  },
  footerText: {
    color: '#b69045',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
