import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Alert, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { database, auth, collection, addDoc, query, where, getDocs } from "../Config/firebaseconfig";

export default function Agendamento({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date()); // Novo estado para a hora
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false); // Novo estado para mostrar o picker de hora

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    if (showDate) {
      setDate(currentDate);
      setShowDate(Platform.OS === 'ios'); // Para iOS, mantém o picker aberto
      setData(dayjs(currentDate).format('YYYY-MM-DD')); // Armazenando a data formatada no estado
    } else if (showTime) {
      setTime(currentDate);
      setShowTime(Platform.OS === 'ios'); // Para iOS, mantém o picker aberto
      setHora(dayjs(currentDate).format('HH:mm')); // Armazenando a hora formatada no estado
    }
  };
  

  const showDatepicker = () => {
    setShowDate(true);
  };

  const showTimepicker = () => {
    setShowTime(true);
  };

  const [barbeiro, setBarbeiro] = useState('');
  const [barbeiros, setBarbeiros] = useState([]);
  const [servico, setServico] = useState('');
  const [servicos, setServicos] = useState([]);
  const [local, setLocal] = useState('local1');
  const [data, setData] = useState(dayjs());
  const [hora, setHora] = useState('');
  

  useEffect(() => {
    const fetchBarbeiros = async () => {
      try {
        // Consulta na coleção 'cliente' para pegar apenas os que têm 'role' igual a 'barbeiro'
        const clienteCollection = collection(database, "cliente");
        const barbeiroQuery = query(clienteCollection, where("role", "==", "barbeiro"));
        const querySnapshot = await getDocs(barbeiroQuery);
        const barbeirosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBarbeiros(barbeirosList);
        if (barbeirosList.length > 0) {
          setBarbeiro(barbeirosList[0].id); // Definindo o barbeiro padrão
        }
      } catch (error) {
        console.error("Error fetching barbeiros: ", error);
      }
    };

    fetchBarbeiros();
  }, []);

  useEffect(() => {
  const fetchServicos = async () => {
    try {
      const servicoCollection = collection(database, "servico");
      const querySnapshot = await getDocs(servicoCollection);
      const servicosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServicos(servicosList);
      console.log(servicosList)

      if (servicosList.length > 0) {
        setServico(servicosList[0].id); // Definindo o servico padrão
      }
    } catch (error) {
      console.error("Error fetching servicos: ", error);
    }
  };

  fetchServicos();
  }, []);

  const addAgendamento = async () => {
    try {
      const disponivel = await checkDisponibilidade(data, hora);

      if (!disponivel) {
        Alert.alert('Horário Indisponível', 'Este horário já está agendado. Por favor, escolha outro horário.');
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is authenticated');
      }

      const barbeiroSelecionado = barbeiros.find(b => b.id === barbeiro);
      const servicoSelecionado = servicos.find(s => s.id === servico);

      const agendamentoCollection = collection(database, "agendamento");
      await addDoc(agendamentoCollection, {
        barbeiro: barbeiroSelecionado ? barbeiroSelecionado.nome : '',
        servico: servicoSelecionado ? servicoSelecionado.tipo : '',
        local: local,
        data: data,    
        horario: hora,  
        idUser: user.uid,
      });
      

      Alert.alert(
        'Agendamento Confirmado!',
        `Barbeiro: ${barbeiroSelecionado.nome}\nServiço: ${servicoSelecionado.tipo}\nLocal: ${local}`,
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      );

      navigation.navigate('Horario');
    } catch (error) {
      console.error("Error adding agendamento: ", error);
    }
  };

  const checkDisponibilidade = async (data, hora) => {
    try {
      const agendamentoCollection = collection(database, "agendamento");
      const q = query(agendamentoCollection, 
        where("data", "==", data),
        where("horario", "==", hora),
        where("barbeiro", "==", barbeiro)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error("Error checking availability: ", error);
      return false;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <View style={styles.banner}>
          <Image
            source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs7WRs_S875bpXggXPJ7A748m8J7XmKX08dQ&s' }}
            style={styles.logo}
          />
          <Text style={styles.bannerText}>MAJESTOSO</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Escolha o barbeiro:</Text>
            <Picker
              selectedValue={barbeiro}
              style={styles.picker}
              onValueChange={(itemValue) => setBarbeiro(itemValue)}
            >
              {barbeiros.map((barbeiro) => (
                <Picker.Item key={barbeiro.id} label={barbeiro.nome} value={barbeiro.id} />
              ))}
            </Picker>

            <Text style={styles.label}>Escolha o serviço:</Text>
            <Picker
              selectedValue={servico}
              style={styles.picker}
              onValueChange={(itemValue) => setServico(itemValue)}
            >
              {servicos.map((servico) => (
                <Picker.Item key={servico.id} label={servico.tipo + '   R$:' + servico.valor} value={servico.id} />
              ))}
            </Picker>

            <Text style={styles.label}>Escolha o local:</Text>
            <Picker
              selectedValue={local}
              style={styles.picker}
              onValueChange={(itemValue) => setLocal(itemValue)}
            >
              <Picker.Item label="Local 1" value="local1" />
              <Picker.Item label="Local 2" value="local2" />
              <Picker.Item label="Local 3" value="local3" />
            </Picker>

            <TouchableOpacity style={styles.dateButton} onPress={showDatepicker}>
              <Text style={styles.dateButtonText}>Selecionar Data</Text>
            </TouchableOpacity>

            <Text style={styles.selectedDate}>Data selecionada: {dayjs(date).format('DD/MM/YYYY')}</Text>

            {showDate && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={'date'}
                is24Hour={true}
                onChange={onChange}
              />
            )}

            <TouchableOpacity style={styles.timeButton} onPress={showTimepicker}>
              <Text style={styles.timeButtonText}>Selecionar Hora</Text>
            </TouchableOpacity>

            <Text style={styles.selectedTime}>Hora selecionada: {dayjs(time).format('HH:mm')}</Text>

            {showTime && (
              <DateTimePicker
                testID="dateTimePicker"
                value={time}
                mode={'time'}
                is24Hour={true}
                onChange={onChange}
              />
            )}

          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={() => addAgendamento()}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.buttonText}>Voltar para Home</Text>                                            
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    width: '100%',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  bannerText: {
    color: '#b69045',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#b69045',
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  dateButton: {
    backgroundColor: '#b69045',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
    width: '100%', // Full width
    maxWidth: 300, // Limit max width
  },
  timeButton: {
    backgroundColor: '#b69045',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
    width: '100%', // Full width
    maxWidth: 300, // Limit max width
  },
  dateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedDate: {
    fontSize: 16,
    marginVertical: 10,
    color: '#333',
  },
  selectedTime: {
    fontSize: 16,
    marginVertical: 10,
    color: '#333',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#b69045',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: '100%', // Full width
    maxWidth: 300, // Limit max width
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center', // Center text within buttons
  },
  input: {
    width: '90%',
    marginTop: 10,
    padding: 10,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#b69045',
  }
});
