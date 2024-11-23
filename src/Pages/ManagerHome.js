import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, database, doc, deleteDoc } from '../Config/firebaseconfig'; 
import dayjs from 'dayjs';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function ManagerHome({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiroLogado, setBarbeiroLogado] = useState(null); 
  const [barbeiros, setBarbeiros] = useState([]);
  const [SelectedBarbeiro, setSelectedBarbeiro] = useState(null);
  const [faturamentoBarbeiros, setFaturamentoBarbeiros] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [showDatePicker, setShowDatePicker] = useState(false); 

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

    // Chama a função ao carregar a pg
    fetchCurrentUser();
    getBarbeiros();
    getFaturamentoBarbeiros(); 
  }, []);

  // Função para buscar o faturamento diário dos barbeiros com base na data selecionada
  const getFaturamentoBarbeiros = async (date = selectedDate) => {
    try {
      const hoje = dayjs(date).format('YYYY-MM-DD');
      const faturamentoRef = collection(database, "faturamento_diario");
      const faturamentoSnap = await getDocs(faturamentoRef);
      const faturamentoList = faturamentoSnap.docs
      .filter(doc => doc.id.includes(hoje)) // Filtra pelo dia atual
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setFaturamentoBarbeiros(faturamentoList);
      console.log(faturamentoList);
    } catch (error) {
      console.error("Erro ao buscar o faturamento diário dos barbeiros: ", error);
    }
  };

  const encerrarExpediente = async () => {
    try {
      const hoje = dayjs().format('YYYY-MM-DD');
      for (const barbeiro of faturamentoBarbeiros) {
        const faturamentoRef = doc(database, "faturamento_diario", barbeiro.id);
        await setDoc(faturamentoRef, { data: hoje, faturamento: 0 }, { merge: true });
      }
  
      console.log("Faturamento zerado para todos os barbeiros.");
      setFaturamentoBarbeiros(faturamentoBarbeiros.map(b => ({ ...b, faturamento: 0 }))); // Atualiza o estado para zero
    } catch (error) {
      console.error("Erro ao zerar o faturamento diário:", error);
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
      
      agendamentoList.sort((a, b) => {
        const dataA = dayjs(`${a.data} ${a.horario}`, 'DD-MM-YYYY HH:mm');
        const dataB = dayjs(`${b.data} ${b.horario}`, 'DD-MM-YYYY HH:mm');
        return dataA - dataB;
      });

      setAgendamentos(agendamentoList);
      console.log(agendamentoList);
    };

    getAgendamentos();
  }, [SelectedBarbeiro]);

  function deleteHorario(id) {
    const HorarioDocRef = doc(database, "agendamento", id);
    deleteDoc(HorarioDocRef)
        .then(() => {
            console.log(`Agendamento com ID ${id} excluído com sucesso.`);
            // Atualize os agendamentos, se necessário
            setAgendamentos(prev => prev.filter(item => item.id !== id));
        })
        .catch((error) => {
            console.error("Erro ao excluir agendamento:", error);
        });
  };  

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate); // Atualiza a data selecionada
    getFaturamentoBarbeiros(currentDate); // Atualiza o faturamento com base na data escolhida
  };

  useEffect(() => {
    getFaturamentoBarbeiros(selectedDate);
  }, [selectedDate, SelectedBarbeiro]);
  

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

          {/* DateTimePicker */}
          <View style={styles.dateTimePickerContainer}>
            <Text style={styles.datePickerLabel}>Selecione a data:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerButtonText}>
                {selectedDate.toLocaleDateString()}
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

          {/* Exibe o faturamento diário dos barbeiros */}
          <View style={styles.faturamentoContainer}>
            <Text style={styles.faturamentoTitle}>Faturamento Diário dos Barbeiros</Text>
            {faturamentoBarbeiros.length > 0 ? (
              faturamentoBarbeiros.map((barbeiro) => (
                <View key={barbeiro.id} style={styles.faturamentoItem}>
                  {barbeiros.find((b) => b.id === barbeiro.id.split('_')[0]) && ( // Ajusta o barbeiro pelo ID
                    <View>
                      <Text style={styles.faturamentoText}>
                        {barbeiros.find((b) => b.id === barbeiro.id.split('_')[0]).nome}
                      </Text>
                      {Object.entries(barbeiro.faturamento || {}).map(([metodo, valor]) => (
                        <Text key={metodo} style={styles.faturamentoText}>
                          {metodo}: R$ {valor.toFixed(2)}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noAgendamentoText}>Nenhum faturamento encontrado</Text>
            )}
          </View>



          <TouchableOpacity onPress={encerrarExpediente} style={styles.button}>
            <Text style={styles.buttonText}>Encerrar expediente</Text>
          </TouchableOpacity>


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
                  <TouchableOpacity
                    style={styles.btnDeleteTask}
                    onPress={() => {
                    deleteHorario(agendamento.id)
                   }}>
                    <AntDesign name="delete" size={24} color="#FF4C4C" />
                  </TouchableOpacity>
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
  btnDeleteTask: {
    color: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
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
  noAgendamentoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
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