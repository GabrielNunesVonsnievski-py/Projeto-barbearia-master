import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { auth, database } from '../Config/firebaseconfig'; 

export default function ManagerHome({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiroLogado, setBarbeiroLogado] = useState(null);
  const [barbeiros, setBarbeiros] = useState([]);
  const [SelectedBarbeiro, setSelectedBarbeiro] = useState(null);
  const [faturamentoBarbeiros, setFaturamentoBarbeiros] = useState([]);

  const useBarbeirosRef = query(
    collection(database, "cliente"),
    where("role", "==", "barbeiro")
  );
  const useAgendamentosRef = collection(database, "agendamento");

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setBarbeiroLogado(currentUser.uid);
        } else {
          console.log('Nenhum usuário está logado');
        }
      } catch (error) {
        console.error('Erro ao obter o usuário atual:', error);
      }
    };

    fetchCurrentUser();
    getBarbeiros();
    getFaturamentoBarbeiros(); // Chama a função ao carregar a página
  }, []);

  // Função para buscar o faturamento diário dos barbeiros
  const getFaturamentoBarbeiros = async () => {
    try {
      const faturamentoRef = collection(database, "faturamento_diario");
      const faturamentoSnap = await getDocs(faturamentoRef);
      const faturamentoList = faturamentoSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setFaturamentoBarbeiros(faturamentoList);
      console.log(faturamentoList);
    } catch (error) {
      console.error("Erro ao buscar o faturamento diário dos barbeiros: ", error);
    }
  };

  const getBarbeiros = async () => {
    try {
      const dataBarbeiros = await getDocs(useBarbeirosRef);
      const Lbarbeiros = dataBarbeiros.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setBarbeiros(Lbarbeiros);
      console.log(Lbarbeiros);
    } catch (error) {
      console.error("Erro ao buscar Rotas: ", error);
    }
  };

  useEffect(() => {
    const getAgendamentos = async () => {
      if (!SelectedBarbeiro) return;
      const q = query(useAgendamentosRef, where('barbeiro', '==', SelectedBarbeiro));
      const agendamentosData = await getDocs(q);
      const agendamentoList = agendamentosData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }));
      setAgendamentos(agendamentoList);
      console.log(agendamentoList);
    };

    getAgendamentos();
  }, [SelectedBarbeiro]);

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
          <Picker
            selectedValue={SelectedBarbeiro}
            style={styles.picker}
            onValueChange={(itemValue) => {
              console.log('Selecionado:', itemValue);
              setSelectedBarbeiro(itemValue); 
            }}
          >
            {barbeiros.map((barbeiro) => (
              <Picker.Item key={barbeiro.nome} label={barbeiro.nome} value={barbeiro.nome} />
            ))}
          </Picker>

          {/* Exibe o faturamento diário dos barbeiros */}
          <View style={styles.faturamentoContainer}>
            <Text style={styles.faturamentoTitle}>Faturamento Diário dos Barbeiros</Text>
            {faturamentoBarbeiros.map((barbeiro) => (
              <View key={barbeiro.id} style={styles.faturamentoItem}>
                {/* Encontra o barbeiro correspondente na lista de barbeiros */}
                {barbeiros.find((b) => b.id === barbeiro.id) && (
                  <Text style={styles.faturamentoText}>
                    {barbeiros.find((b) => b.id === barbeiro.id).nome} 
                    - R$ {barbeiro.faturamento || 0}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Lista de Agendamentos */}
          <View style={styles.agendamentosContainer}>
            <Text style={styles.agendamentosTitle}>Agendamentos</Text>
            {agendamentos.length > 0 ? (
              agendamentos.map((agendamento) => (
                <View key={agendamento.id} style={styles.agendamentoContainer}>
                  <Text style={styles.agendamentoText}>Data: {agendamento.data}</Text>
                  <Text style={styles.agendamentoText}>Horário: {agendamento.horario}</Text>
                  <Text style={styles.agendamentoText}>Serviço: {agendamento.servico}</Text>
                  <Text style={styles.agendamentoText}>Cliente: {agendamento.nomeCliente}</Text>
                  <Text style={styles.agendamentoText}></Text>
                </View>
              ))
            ) : (
              <Text style={styles.centeredText}>Nenhum agendamento encontrado</Text>
            )}
          </View>
        </View>

        {/* blg de baixo */}
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
  picker: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  faturamentoContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#b69045',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  faturamentoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  faturamentoItem: {
    marginBottom: 5,
  },
  faturamentoText: {
    color: '#000',
  },
  agendamentosContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#b69045',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  agendamentosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  centeredText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    color: '#b69045',
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
