import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { auth, firestore } from '../Config/firebaseconfig';
import Loading from './Loading';

export default function ManagerHome({ navigation }) {

  const [isLoading, setIsLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiroLogado, setBarbeiroLogado] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 segundos de delay que o marcos não gosta
  }, []);

  useEffect(() => {
    const fetchCurrentUser = () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setBarbeiroLogado(currentUser.uid); // Armazena o ID do usuário logado
        } else {
          console.log('Nenhum usuário está logado');
        }
      } catch (error) {
        console.error('Erro ao obter o usuário atual:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (barbeiroLogado) {
      const fetchAgendamentos = async () => {
        try {
          const agendamentoRef = firestore.collection('agendamento');
          const snapshot = await agendamentoRef.where('barbeiro', '==', barbeiroLogado).get();

          const agendamentosData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setAgendamentos(agendamentosData);
        } catch (error) {
          console.error('Erro ao buscar os agendamentos:', error);
        }
      };

      fetchAgendamentos();
    }
  }, [barbeiroLogado]);

  if (isLoading) {
    return <Loading />;
  }

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
          {/* Lista de Agendamentos */}
          {agendamentos.length > 0 ? (
            agendamentos.map((agendamento) => (
              <View key={agendamento.id} style={styles.agendamentoContainer}>
                <Text style={styles.agendamentoText}>Data: {agendamento.data}</Text>
                <Text style={styles.agendamentoText}>Horário: {agendamento.horario}</Text>
                <Text style={styles.agendamentoText}>Serviço: {agendamento.servico}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noAgendamentoText}>Nenhum agendamento encontrado.</Text>
          )}
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
  agendamentoContainer: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#b69045',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  agendamentoText: {
    color: '#000',
  },
  noAgendamentoText: {
    color: '#b69045',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
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
