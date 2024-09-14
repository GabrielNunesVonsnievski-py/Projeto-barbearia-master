import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { database, doc, updateDoc } from "../Config/firebaseconfig";
import DateTimePicker from '@react-native-community/datetimepicker';
import Loading from './Loading';

export default function Details({ navigation, route }) {

    const [isLoading, setIsLoading] = useState(true);
    const [horarioEdit, setHorarioEdit] = useState(new Date(route.params.hora)); // hora inicial
    const [dataEdit, setDataEdit] = useState(new Date(route.params.data)); // data inicial
    const [showHorarioPicker, setShowHorarioPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const idagendamento = route.params.id;

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 2000); // 2 segundos de delay
    }, []);

    function handleHorarioChange(event, selectedTime) {
        setShowHorarioPicker(false);
        if (selectedTime) {
            setHorarioEdit(selectedTime);
        }
    }

    function handleDateChange(event, selectedDate) {
        setShowDatePicker(false);
        if (selectedDate) {
            setDataEdit(selectedDate);
        }
    }

    function editHorario(hora, id, data) {
        const HorarioDocRef = doc(database, "agendamento", id);
        const dataDocRef = doc(database, "agendamento", id);

        updateDoc(HorarioDocRef, { horario: hora })
            .then(() => {
                console.log("Horário atualizado com sucesso!");
                updateDoc(dataDocRef, { data: data })
                    .then(() => {
                        console.log("Data atualizada com sucesso!");
                        Alert.alert("Sucesso", "Os dados foram salvos com sucesso.");
                        navigation.navigate('Home');
                    })
                    .catch((error) => {
                        console.error("Erro ao atualizar data:", error);
                    });
            })
            .catch((error) => {
                console.error("Erro ao atualizar horário:", error);
            });
    }

    if (isLoading) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.banner}>
                <Image
                    source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs7WRs_S875bpXggXPJ7A748m8J7XmKX08dQ&s' }}
                    style={styles.image}
                />
                <Text style={styles.bannerText}>MAJESTOSO</Text>
            </View>
            <View style={styles.contentWrapper}>
                <View style={styles.content}>
                    <Text style={styles.txtdescription}> Editar Horário </Text>

                    <TouchableOpacity style={styles.timeButton} onPress={() => setShowHorarioPicker(true)}>
                        <Text style={styles.timeButtonText}>Selecione o Horário</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.timeButton} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.timeButtonText}>Selecione a Data</Text>
                    </TouchableOpacity>

                    {showHorarioPicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={horarioEdit}
                            mode={'time'}
                            is24Hour={true}
                            onChange={handleHorarioChange}
                        />
                    )}

                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={dataEdit}
                            mode={'date'}
                            is24Hour={true}
                            onChange={handleDateChange}
                        />
                    )}

                    <TouchableOpacity
                        style={styles.btnsave}
                        onPress={() => { editHorario(horarioEdit, idagendamento, dataEdit) }}>
                        <Text style={styles.txtbtnsave}> Salvar horário </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
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
    }
});
