import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function ManagerHome({ navigation }) {
  return (
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
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Formulário */}
          <View style={styles.formContainer}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/p/AF1QipPe9P-vkmj_zpBaanW6BuB6omZHkWTDTpnWqk95=s680-w680-h510' }}
              style={styles.imagemesa}
            />
            <Text style={styles.addressText}>
              <FontAwesome5 name="map-marker-alt" size={16} color="#b69045" /> R. Dr José de Patta, 471 - Centro, Criciúma - SC, 88802-240
            </Text>
            <Text style={styles.centeredText}>
              BARBEIRO 
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Agendamento')}>
              <Text style={styles.buttonText}>Agendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Horario')}>
              <Text style={styles.buttonText}>Ver agendamentos</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#f4f4f4',
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    width: '100%',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 30,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  bannerText: {
    color: '#b69045',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  content: {
    flex: 1,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
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
    fontSize: 30,
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
    marginTop: 30,
    width: '100%',
    backgroundColor: '#000000',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#b69045',
    fontSize: 14,
    fontWeight: 'bold',
  },
});