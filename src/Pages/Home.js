import React , {useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Loading from './Loading';

export default function Home({ navigation }) {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 segundos de delay que o marcos não gosta
  }, []);

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
          <Text style={styles.centeredText}>
            Refine sua aparência com estilo e precisão
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Agendamento')}>
            <Text style={styles.buttonText}>Agendar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Horario')}>
            <Text style={styles.buttonText}>Ver agendamentos</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('WhatsApp')}>
            <Text style={styles.button}>Abrir WhatsApp</Text>
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
    backgroundColor: 'white',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 80, // Espaço para o footer
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  banner: {
    width: '100%',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  bannerText: {
    color: '#b69045',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  formContainer: {
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b69045',
    borderRadius: 10,
    padding: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 20,
  },
  imagemesa: {
    width: 220,
    height: 140,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  addressText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
    color: '#b69045',
  },
  centeredText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    color: '#b69045',
  },
  button: {
    marginTop: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#b69045',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#b69045',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#000000',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#b69045',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
