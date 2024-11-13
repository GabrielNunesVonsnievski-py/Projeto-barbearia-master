import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView, Linking} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Loading from './Loading';

export default function Home({ navigation }) {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 segundos de delay que o marcos não gosta
  }, []);

  const openWhatsApp = (phoneNumber, message) => {
    let url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch((err) => {
      console.error("Não foi possível abrir o WhatsApp", err);
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <Image
            source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs7WRs_S875bpXggXPJ7A748m8J7XmKX08dQ&s' }}
            style={styles.image}
          />
          <Text style={styles.bannerText}>MAJESTOSO</Text>
        </View>

        {/* Conteúdo Principal */}
        <View style={styles.formContainer}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/p/AF1QipPe9P-vkmj_zpBaanW6BuB6omZHkWTDTpnWqk95=s680-w680-h510' }}
            style={styles.imagemesa}
          />
          <Text style={styles.addressText}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#b69045" /> R. Dr José de Patta, 471 - Centro, Criciúma - SC, 88802-240
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Agendamento')}>
            <Text style={styles.buttonText}>Agendar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Horario')}>
            <Text style={styles.buttonText}>Ver agendamentos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.whatsappButton]} onPress={() => openWhatsApp('5548999332071', 'Olá!')}>
            <FontAwesome5 name="whatsapp" size={16} color="#FFF" style={styles.icon} />
            <Text style={styles.buttonText}>Abrir WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          <FontAwesome5 name="phone" size={14} color="#b69045" /> (48) 99933-2071
        </Text>
        <Text style={styles.footerText}>
          <FontAwesome5 name="envelope" size={14} color="#b69045" /> MajestosoBarbearia@gmail.com
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Cor de fundo semelhante à da página de Agendamento
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 80, // Espaço para o footer
    alignItems: 'center',
  },
  banner: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  bannerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#b69045',
    marginTop: 10,
  },
  formContainer: {
    width: '90%',
    alignItems: 'center',
    borderRadius: 15,
    padding: 20,
    backgroundColor: '#FFF', // Cor de fundo semelhante à da página de Agendamento
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 20,
  },
  imagemesa: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  addressText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#b69045',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#b69045',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#000',
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

  whatsappButton: {
    backgroundColor: '#25D366', 
    flexDirection: 'row',      
    alignItems: 'center',    
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});
