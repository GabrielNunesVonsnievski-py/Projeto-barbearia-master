import React, { useState, useEffect } from 'react';
import { Button, TextInput, View, StyleSheet, Linking } from 'react-native';
import { database, auth, collection, addDoc, query, where, getDocs } from "../Config/firebaseconfig";

const WhatsApp = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userLogado, setUserLogado] = useState(null);

  const openWhatsApp = (phoneNumber, message) => {
    let url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch((err) => {
      console.error("Não foi possível abrir o WhatsApp", err);
    });
  };

  useEffect(() => {
    const fetchCurrentUser = () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUserLogado(currentUser.uid); // armazena o ID do usuario q ta logado
        } else {
          console.log('Nenhum usuário está logado');
        }
      } catch (error) {
        console.error('Erro ao obter o usuário atual:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <View style={styles.container}>
      {/*<TextInput
        style={styles.input}
        placeholder="Digite o número de telefone ex: +5548999999999"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />*/}
      <Button
        title="Abrir WhatsApp"
        onPress={() => openWhatsApp('5548999332071', 'Olá!')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default WhatsApp;