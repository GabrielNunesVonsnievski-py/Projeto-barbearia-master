import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Alert, TextInput, Platform, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { database, auth, collection, addDoc, query, where, getDocs, updateDoc, fetchAvailableTimeSlots } from "../Config/firebaseconfig";
import Loading from './Loading';

export default function Agendamento({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [barbeiro, setBarbeiro] = useState('');
  const [barbeiros, setBarbeiros] = useState([]); 
  const [servico, setServico] = useState('');
  const [servicos, setServicos] = useState([]);
  const [local, setLocal] = useState('local1');
  const [data, setData] = useState(dayjs());
  const [clienteNome, setClienteNome] = useState('');
  const [intervaloTempo, setIntervaloTempo] = useState([]); 
  const [hora, setHora] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const fetchBarbeiros = async () => {
      try {
        const clienteCollection = collection(database, "cliente");
        const barbeiroQuery = query(clienteCollection, where("role", "==", "barbeiro"));
        const querySnapshot = await getDocs(barbeiroQuery);
        const barbeirosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBarbeiros(barbeirosList);
        if (barbeirosList.length > 0) {
          setBarbeiro(barbeirosList[0].id);
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
        console.log(servicosList);

        if (servicosList.length > 0) {
          setServico(servicosList[0].id);
        }
      } catch (error) {
        console.error("Error fetching servicos: ", error);
      }
    };

    fetchServicos();
  }, []);

  const fetchUserName = async (userEmail) => {
    try {
      const clienteCollection = collection(database, "cliente");
      const q = query(clienteCollection, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const cliente = querySnapshot.docs[0].data();
        return cliente.nome;
      } else {
        console.error("No such user document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user name: ", error);
    }
  };

  const addAgendamento = async () => {
    try {
      const barbeiroSelecionado = barbeiros.find(b => b.id === barbeiro);
      const servicoSelecionado = servicos.find(s => s.id === servico);
      
      const disponivel = await checkDisponibilidade(data, hora, barbeiroSelecionado.nome);
  
      if (!disponivel) {
        Alert.alert('Horário Indisponível', 'Este horário já está agendado. Por favor, escolha outro horário.');
        return;
      }
  
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is authenticated');
      }
  
      const nomeCliente = await fetchUserName(user.email);
  
      const agendamentoCollection = collection(database, "agendamento");
      await addDoc(agendamentoCollection, {
        barbeiro: barbeiroSelecionado ? barbeiroSelecionado.nome : '',
        servico: servicoSelecionado ? servicoSelecionado.tipo : '',
        local: local,
        data: dayjs(date).format('YYYY-MM-DD'),
        horario: hora,  
        nomeCliente: nomeCliente,
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
  

  const checkDisponibilidade = async (data, hora, barbeiroSelecionado) => {
    try {
      const agendamentoCollection = collection(database, "agendamento");
      const dataString = dayjs(data).format('YYYY-MM-DD'); // Converter data para string
      const q = query(agendamentoCollection, 
        where("data", "==", dataString), 
        where("horario", "==", hora), 
        where("barbeiro", "==", barbeiroSelecionado)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.empty; // True == disponicel, False == indisponivel 
    } catch (error) {
      console.error("Error checking availability: ", error);
      return false;
    }
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    const diaNaoUtil = dayjs(currentDate).day(); //0 = domingo, 6 = sabado

    if (diaNaoUtil === 0) {
      Alert.alert('Dia inválido', 'Selecione um dia de segunda a sábado.');
      return;
    }

    if (showDate) {
      setDate(currentDate);
      setShowDate(Platform.OS === 'ios');
      set`Data`(dayjs(currentDate).format('YYYY-MM-DD')); 
      setTime(new Date(currentDate));
    } else if (showTime) {
      setTime(currentDate);
      setShowTime(Platform.OS === 'ios');
      setHora(currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); 
    }
  };

  const fetchAvailableTimeSlots = useCallback(async () => {
    const barbeiroSelecionado = barbeiros.find(b => b.id === barbeiro);
   if (barbeiroSelecionado && data) {
      const allTimeSlots = IntervalodeTempo(); // Get all available time slots
      const availableTimeSlots = [];
      for (const intervalo of allTimeSlots) {
        const isAvailable = await checkDisponibilidade(data, intervalo, barbeiroSelecionado.nome);
        if (isAvailable) {
          availableTimeSlots.push(intervalo);
        }
      }
      setIntervaloTempo(availableTimeSlots); // Update with only available slots
    } else {
      setIntervaloTempo([]); // Clear if no barber or date selected
    }
  }, [barbeiro, data]);


  useEffect(() => {
    fetchAvailableTimeSlots();
  }, [barbeiro, data, fetchAvailableTimeSlots]);
  

  useEffect(() => {
    setIntervaloTempo(IntervalodeTempo()); 
    if (intervaloTempo.length > 0) {
      setHora(intervaloTempo[0]);
    }
  }, []);

  const IntervalodeTempo = () => {
    const intervaloTempo = [];
    const horarioInicio = dayjs().hour(8).minute(0); //horario de início: 8:00
    const horarioFinal = dayjs().hour(18).minute(0);  //horario q termina: 18:00
  
    let currentTime = horarioInicio;
  
    while (currentTime.isBefore(horarioFinal)) {
      intervaloTempo.push(currentTime.format('HH:mm')); // Formata o horário como HH:mm
      currentTime = currentTime.add(30, 'minute'); // Adiciona 30 minutos
    }
  
    return intervaloTempo;
  };

  useEffect(() => {
    if(dayjs(date).isSame(dayjs(), 'day')) {
      const horarioAtual = dayjs();
      const horariosFiltrados = IntervalodeTempo().filter(horario => {
        return dayjs(horario, 'HH:mm').isAfter(horarioAtual); //Impede que o usuario escolha um horario que ja passou
      });
      setIntervaloTempo(horariosFiltrados); //define estado com os horarios disponiveis 
    }
      else {
        setIntervaloTempo(IntervalodeTempo()); //Se for outro dia, mostra todos os horarios disponiveis 
      }
    }, [date]);

    useEffect(() => {
      const updateHorariosDisponiveis = () => {
        if (dayjs(date).isSame(dayjs(), 'day')) { 
          // Se a data selecionada for o dia atual
          const horarioAtual = dayjs();
          const horariosFiltrados = IntervalodeTempo().filter(horario => {
            return dayjs(horario, 'HH:mm').isAfter(horarioAtual); // filtra horários após o atual
          });
          setIntervaloTempo(horariosFiltrados); // atualiza com os horários filtrados
        } else {
          setIntervaloTempo(IntervalodeTempo()); // para outros dias (quando mudar) mostra todos os horários
        }
      };
    
      updateHorariosDisponiveis(); // atualiza os horários quando a data mudar
    }, [date]);
    
    
  const showDatepicker = () => {
    setShowDate(true);
  };

  const showTimepicker = () => {
    setShowTime(true);
  };

  if (isLoading) {
    return <Loading />;
  }

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
                style={styles.DateTimePickerData}
                testID="dateTimePicker"
                value={date}

                mode={'date'}
                is24Hour={true}
                minimumDate={new Date()}  //Define a data mínima (para ser possível agendar) como o dia atual
                onChange={onChange}
              />
            )}

            <TouchableOpacity style={styles.timeButton} onPress={showTimepicker}>
              <Text style={styles.timeButtonText}>Selecionar Hora</Text>
            </TouchableOpacity>

            {/*<Text style={styles.selectedTime}>Hora selecionada: {dayjs(time).format('HH:mm')}</Text>*/}

            {showTime && (
              <View>
                <Text style={styles.label}>Escolha o horário:</Text>
                  <Picker
                    selectedValue={hora}
                    onValueChange={(itemValue) => setHora(itemValue)} 
                    style={styles.pickerHora}
                  >
                    {intervaloTempo.map((intervalo, index) => (
                      <Picker.Item key={index} label={intervalo} value={intervalo} />
                    ))}
                  </Picker>
              </View>
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
  DateTimePickerHora:{
    alignItems: 'center',
    padding: 20,
    marginBottom: 30,
    marginRight: 120,
    color: '#b69045',
  },
  pickerHora:{
    height: 100, 
    width: 200, 
    margin:70, 
    textAlign: 'center', 
    alignContent:'center',
  },
  pickerHoraIndisponivel: {
    height: 100, 
    width: 200, 
    margin:70, 
    textAlign: 'center', 
    alignContent:'center',
    color: '#ff3838',
    textColor: '#ff3838',

  },
  DateTimePickerData:{
    alignItems: 'center',
    padding: 20,
    marginBottom: 30,
    marginRight: 100
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#000',
    displayFlex:1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  banner: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#FFFF',
    color: '#FFF',
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: '#b69045',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  dateButtonText: {
    color: '#FFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedDate: {
    color: '#b69045',
    fontWeight: 'bold',
    marginBottom: 20,
   marginLeft: 60
  },
  timeButton: {
    backgroundColor: '#b69045',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  timeButtonText: {
    color: '#FFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedTime: {
    color: '#b69045',
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 80
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 100,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#b69045',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFF',
    fontWeight: 'bold',
  },
});