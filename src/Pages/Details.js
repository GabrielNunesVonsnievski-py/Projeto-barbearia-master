import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Modal, ScrollView } from 'react-native';
import { database, doc, updateDoc, collection, getDocs, query, where } from "../Config/firebaseconfig";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import Loading from './Loading';

export default function Details({ navigation, route }) {
    const [isLoading, setIsLoading] = useState(true);
    const [horarioEdit, setHorarioEdit] = useState(route.params.hora ? new Date(route.params.hora) : new Date());
    const [dataEdit, setDataEdit] = useState(route.params.data ? new Date(route.params.data) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
    const [horarioSelecionado, setHorarioSelecionado] = useState('');
    const [showPickerModal, setShowPickerModal] = useState(false);
    const [intervaloTempo, setIntervaloTempo] = useState([]); 
    const idagendamento = route.params.id;

    const checkDisponibilidade = async (data, hora) => {
        try {
            const agendamentoCollection = collection(database, "agendamento");
            const dataString = dayjs(data).format('DD-MM-YYYY');
            const q = query(agendamentoCollection,
                where("data", "==", dataString),
                where("horario", "==", hora)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.empty; // true == disponivel  false == indisponivel
        } catch (error) {
            console.error("Erro ao verificar disponibilidade:", error);
            return false;
        }
    };


    const gerarHorariosDisponiveis = useCallback(async () => {
        const allTimeSlots = IntervalodeTempo();
        const promisesDisponiveis = allTimeSlots.map(async intervalo => {
            const isAvailable = await checkDisponibilidade(dataEdit, intervalo);
            return { intervalo, isAvailable };
        });

        const resolvedSlots = await Promise.all(promisesDisponiveis);
        const availableTimeSlots = resolvedSlots
            .filter(slot => slot.isAvailable)
            .map(slot => slot.intervalo);

        setHorariosDisponiveis(availableTimeSlots);
    }, [dataEdit]);

    // Atualizar horários disponíveis quando a data mudar
    useEffect(() => {
        gerarHorariosDisponiveis();
    }, [dataEdit, gerarHorariosDisponiveis]);

    // Atualizar estado de carregamento
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, []);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const diaNaoUtil = dayjs(selectedDate).day(); // 0 = domingo, 6 = sábado
            if (diaNaoUtil === 0) {
                Alert.alert('Dia inválido', 'Selecione um dia de segunda a sábado.');
                return;
            }
            setDataEdit(selectedDate);
        }
    };

    const IntervalodeTempo = () => {
        const intervaloTempo = [];
        const horarioInicio = dayjs().hour(8).minute(0); 
        const horarioFinal = dayjs().hour(18).minute(0); 
        const horarioAtual = dayjs(); 
      
        let currentTime = horarioInicio;
      
        while (currentTime.isBefore(horarioFinal)) {
          // filtra horários já passados no dia atual
          if (dayjs(date).isSame(horarioAtual, 'day')) {
            if (currentTime.isAfter(horarioAtual) && currentTime.hour() !== 12) {
              intervaloTempo.push(currentTime.format('HH:mm'));
            }
          } else {
            // Para outros dias adiciona todos os horários
            if (currentTime.hour() !== 12) {
              intervaloTempo.push(currentTime.format('HH:mm'));
            }
          }
      
          currentTime = currentTime.add(30, 'minute'); // incrementa 30 minutos
        }
      
        return intervaloTempo;
      };

    function handleHorarioChange(itemValue) {
        setHorarioSelecionado(itemValue);
        const [hour, minute] = itemValue.split(':');
        const novoHorario = new Date();
        novoHorario.setHours(parseInt(hour), parseInt(minute), 0, 0);
        setHorarioEdit(novoHorario);
        setShowPickerModal(false);
    }

    function editHorario(hora, id, data) {
        checkDisponibilidade(data, horarioSelecionado).then(isAvailable => {
            if (!isAvailable) {
                Alert.alert('Horário Indisponível', 'Este horário já está agendado. Escolha outro horário.');
                return;
            }

            const HorarioDocRef = doc(database, "agendamento", id);
            const dataDocRef = doc(database, "agendamento", id);

            const horaFormatada = hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const offset = data.getTimezoneOffset() * 60000;
            const dataLocal = new Date(data.getTime() - offset);
            const dataFormatada = dataLocal.toISOString().split('T')[0];

            updateDoc(HorarioDocRef, { horario: horaFormatada })
                .then(() => {
                    console.log("Horário atualizado com sucesso!");
                    updateDoc(dataDocRef, { data: dataFormatada })
                        .then(() => {
                            console.log("Data atualizada com sucesso!");
                            Alert.alert("Sucesso", "Os dados foram salvos com sucesso.");
                            navigation.navigate('Home');
                        })
                        .catch(error => console.error("Erro ao atualizar data:", error));
                })
                .catch(error => console.error("Erro ao atualizar horário:", error));
        });
    }

    const showTimepicker = () => {
        setShowTime(true);
      };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.banner}>
                <Image
                    source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs7WRs_S875bpXggXPJ7A748m8J7XmKX08dQ&s' }}
                    style={styles.image}
                />
                <Text style={styles.bannerText}>MAJESTOSO</Text>
            </View>
            <View style={styles.contentWrapper}>
                <View style={styles.content}>
                    <Text style={styles.txtdescription}>Editar Horário</Text>

                    <TouchableOpacity style={styles.timeButton} onPress={() => setShowPickerModal(true)}>
                        <Text style={styles.timeButtonText}>Selecione o Horário</Text>
                    </TouchableOpacity>

                    <Text style={styles.selectedText}>
                        Horário selecionado: {horarioSelecionado}
                    </Text>

                    <TouchableOpacity style={styles.timeButton} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.timeButtonText}>Selecione a Data</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={dataEdit}
                            mode={'date'}
                            is24Hour={true}
                            minimumDate={new Date()}
                            display="spinner"
                            onChange={handleDateChange}
                        />
                    )}

                    <Text style={styles.selectedText}>
                        Data selecionada: {dayjs(dataEdit).format('DD/MM/YYYY')}
                    </Text>

                    <TouchableOpacity
                        style={styles.btnsave}
                        onPress={() => editHorario(horarioEdit, idagendamento, dataEdit)}>
                        <Text style={styles.txtbtnsave}>Salvar horário</Text>
                    </TouchableOpacity>

                    {/* Modal para o Picker */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showPickerModal}
                        onRequestClose={() => setShowPickerModal(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Picker
                                    selectedValue={horarioSelecionado}
                                    onValueChange={handleHorarioChange}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Selecione o Horário" value="" />
                                    {horariosDisponiveis.map((horario, index) => (
                                        <Picker.Item key={index} label={horario} value={horario} />
                                    ))}
                                </Picker>
                                <TouchableOpacity onPress={() => setShowPickerModal(false)} style={styles.closeButton}>
                                    <Text style={styles.closeButtonText}>Fechar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    banner: {
        alignItems: 'center',
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#000',
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
    contentWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 20,
    },
    txtdescription: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    btnsave: {
        width: '100%',
        backgroundColor: '#b69045',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        marginTop: 20,
        borderRadius: 20,
    },
    txtbtnsave: {
        color: '#FFF',
        fontSize: 25,
        fontWeight: 'bold',
    },
    timeButton: {
        backgroundColor: '#b69045',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginVertical: 10,
        alignItems: 'center',
        width: '100%',
        maxWidth: 300,
    },
    timeButtonText: {
        color: '#fff',
        width: '100%',
        maxWidth: 300,
    },
    selectedText: {
        marginTop: 10,
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        height: '50%',
        borderRadius: 20,
        padding: 20,
        backgroundColor: '#8c8c8c',
    },
    closeButton: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#b69045',
        borderRadius: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    picker: {
        flex: 1,
        justifyContent: 'center',
    },
});
