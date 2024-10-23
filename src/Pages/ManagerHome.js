import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, database } from '../Config/firebaseconfig'; 
import dayjs from 'dayjs';

export default function ManagerHome({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiroLogado, setBarbeiroLogado] = useState(null); 
  const [barbeiros, setBarbeiros] = useState([]);
  const [SelectedBarbeiro, setSelectedBarbeiro] = useState(null);
  const [faturamentoBarbeiros, setFaturamentoBarbeiros] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Estado para armazenar a data selecionada
  const [showDatePicker, setShowDatePicker] = useState(false); // Estado para exibir ou ocultar o DateTimePicker

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

  // Função para buscar o faturamento diário dos barbeiros com base na data selecionada
  const getFaturamentoBarbeiros = async (date = selectedDate) => {
    try {
      const faturamentoRef = collection(database, "faturamento_diario"); // Certifique-se de definir o faturamentoRef corretamente
      const formattedDate = dayjs(date).format("YYYY-MM-DD"); // Formate a data
      const faturamentoSnap = await getDocs(query(faturamentoRef, where("data", "==", formattedDate)));
      const faturamentoList = faturamentoSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setFaturamentoBarbeiros(faturamentoList);
    } catch (error) {
      console.error("Erro ao buscar o faturamento diário dos barbeiros: ", error);
    }
  };

   //adicionar ou atualizar o faturamento do barbeiro para o dia atual
   const updateFaturamentoBarbeiro = async (barbeiroId, valor) => {
    try {
      const hoje = dayjs().format("YYYY-MM-DD");
      const faturamentoSnap = await getDocs(query(faturamentoRef, where("barbeiroId", "==", barbeiroId), where("data", "==", hoje)));
      
      if (faturamentoSnap.empty) {
        //se não existir faturamento para o dia, cria um novo documento
        await addDoc(faturamentoRef, {
          barbeiroId,
          data: hoje,
          faturamento: valor,
        });
      } else {
        //atualiza o faturamento q ja existe
        const faturamentoDoc = faturamentoSnap.docs[0];
        await updateDoc(doc(faturamentoRef, faturamentoDoc.id), {
          faturamento: faturamentoDoc.data().faturamento + valor,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar faturamento: ", error);
    }
  };

  //reseta o faturamento no final do dia
  const resetFaturamentoDiario = async () => {
    try {
      const hoje = dayjs().format("YYYY-MM-DD");
      const faturamentoSnap = await getDocs(query(faturamentoRef, where("data", "==", hoje)));

      faturamentoSnap.forEach(async (doc) => {
        await updateDoc(doc.ref, { faturamento: 0 }); //reseta o faturamento
      });
    } catch (error) {
      console.error("Erro ao resetar faturamento: ", error);
    }
  };

  useEffect(() => {
    const now = dayjs();
    const endOfDay = now.endOf('day'); // Obter o final do dia atual

    //agenda o 'reset' do faturamento no final do dia
    const timeout = setTimeout(() => {
      resetFaturamentoDiario();
    }, endOfDay.diff(now));

    return () => clearTimeout(timeout); //limpa o timeout ao desmontar o componente
  }, []);

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


  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate); // Atualiza a data selecionada
    console.log("Nova data selecionada:", dayjs(currentDate).format("YYYY-MM-DD"));
    getFaturamentoBarbeiros(currentDate); // Atualiza o faturamento com base na data escolhida
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.banner}>
        <Image
          source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs7WRs_S875bpXggXPJ7A748m8J7XmKX08dQ&s' }}
          style={styles.image}
        />
        <Text style={styles.bannerText}>MAJESTOSO</Text>
      </View>

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

              {/* DateTimePicker para selecionar data */}
          <View style={styles.dateTimePickerContainer}>
            <Text style={styles.datePickerLabel}>Selecione a data:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerButtonText}>
                {dayjs(selectedDate).format("DD/MM/YYYY")}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}
          </View>

          {/*faturamento diário dos barbeiros */}
          <View style={styles.faturamentoContainer}>
            <Text style={styles.faturamentoTitle}>Faturamento Diário dos Barbeiros</Text>
            {faturamentoBarbeiros.map((barbeiro) => (
              <View key={barbeiro.id} style={styles.faturamentoItem}>
                {barbeiros.find((b) => b.id === barbeiro.barbeiroId) && (
                  <Text style={styles.faturamentoText}>
                    {barbeiros.find((b) => b.id === barbeiro.barbeiroId).nome}
                    - R$ {barbeiro.faturamento || 0} em {dayjs(selectedDate).format("DD/MM/YYYY")}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Agendamentos */}
          <View style={styles.agendamentosContainer}>
            <Text style={styles.agendamentosTitle}>Agendamentos</Text>
            {agendamentos.length > 0 ? (
              agendamentos.map((agendamento) => (
                <View key={agendamento.id} style={styles.agendamentoContainer}>
                  <Text style={styles.agendamentoText}>Data: {agendamento.data}</Text>
                  <Text style={styles.agendamentoText}>Horário: {agendamento.horario}</Text>
                  <Text style={styles.agendamentoText}>Serviço: {agendamento.servico}</Text>
                  <Text style={styles.agendamentoText}>Cliente: {agendamento.nomeCliente}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.centeredText}>Nenhum agendamento encontrado</Text>
            )}
          </View>
        </View>

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
    width: 250,
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
  dateTimePickerContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  datePickerLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  datePickerButton: {
    backgroundColor: '#b69045',
    padding: 10,
    borderRadius: 10,
  },
  datePickerButtonText: {
    color: '#fff',
  },
});
