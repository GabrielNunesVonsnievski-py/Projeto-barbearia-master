import React, { useState, useEffect } from 'react';
import { View, Image, TextInput, TouchableOpacity, StyleSheet, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../Config/firebaseconfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { FontAwesome5 } from '@expo/vector-icons'; // Importando ícones
import Loading from './Loading';

export default function Cadastrar() {
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // Estado para visibilidade da senha
  const navigation = useNavigation();
  const db = getFirestore();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const NovoUsuario = async () => {
    if (!email || !password || !name || !telefone || !endereco) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered:', userCredential.user);

      const userRef = doc(db, 'cliente', userCredential.user.uid);
      await setDoc(userRef, {
        nome: name,
        endereco: endereco,
        telefone: telefone,
        email: email,
        role: 'user'
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert('Erro', error.message);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.banner}>
            <Image
              source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs7WRs_S875bpXggXPJ7A748m8J7XmKX08dQ&s' }}
              style={styles.image}
            />
            <Text style={styles.bannerText}>MAJESTOSO</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Cadastro</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(182, 144, 69, 0.5)"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            {/* Campo de Senha com ícone para visibilidade */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Senha"
                placeholderTextColor="rgba(182, 144, 69, 0.5)"
                onChangeText={setPassword}
                value={password}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <FontAwesome5 name={passwordVisible ? 'eye' : 'eye-slash'} size={24} color="#b69045" />
              </TouchableOpacity>

            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="rgba(182, 144, 69, 0.5)"
              onChangeText={setName}
              value={name}
            />
            <TextInput
              style={styles.input}
              placeholder="Endereço"
              placeholderTextColor="rgba(182, 144, 69, 0.5)"
              onChangeText={setEndereco}
              value={endereco}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              placeholderTextColor="rgba(182, 144, 69, 0.5)"
              onChangeText={setTelefone}
              value={telefone}
            />
            <TouchableOpacity style={styles.signUpButton} onPress={NovoUsuario}>
              <Text style={styles.buttonText}>CADASTRAR</Text>
            </TouchableOpacity>

            <Text
              style={styles.txtNewuser}
              onPress={() => navigation.navigate('Login')}>
              Já possui uma conta? Logar
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
    paddingTop: 60,
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
    width: '60%',
    alignSelf: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#b69045',
    borderRadius: 20,
    height: 40,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputPassword: {
    flex: 1,
    color: 'black',
  },
  signUpButton: {
    backgroundColor: '#b69045',
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
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
    width: '100%',
    backgroundColor: 'black',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#b69045',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
