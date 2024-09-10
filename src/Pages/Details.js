import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { database, doc, updateDoc } from "../Config/firebaseconfig";
import DateTimePicker from '@react-native-community/datetimepicker';
import Loading from './Loading';

export default function Details({ navigation, route }) {

    const [isLoading, setIsLoading] = useState(true);
    const [horarioEdit, setHorarioEdit] = useState(new Date(route.params.hora)); // Define a data inicial
    const [dataEdit, setDataEdit] = useState(new Date(route.params.data)); // Define a data inicial
    const [showHorarioPicker, setShowHorarioPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const idagendamento = route.params.id;

    useEffect(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 2000); // 2 segundos de delay que o marcos não gosta
      }, []);
    

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
            <Text style={styles.txtdescription}> Editar Horário </Text>

            <TouchableOpacity style={styles.timeButton} onPress={() => setShowHorarioPicker(true)}>
                <Text>Selecione o Horário</Text> 
            </TouchableOpacity>

            <TouchableOpacity style={styles.timeButton} onPress={() => setShowDatePicker(true)}>
                <Text>Selecione a Data</Text> 
            </TouchableOpacity>

            {showHorarioPicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={horarioEdit}
                    mode={'time'}
                    is24Hour={true}
                    onChange={editHorario()}
                />
            )}

            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={dataEdit}
                    mode={'date'}
                    is24Hour={true}
                    onChange={editHorario()}
                />
            )}
    
            <TouchableOpacity
                style={styles.btnsave}
                onPress={() => { editHorario(horarioEdit, idagendamento, dataEdit) }}>
                <Text style={styles.txtbtnsave}> Save HORARIO </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        backgroundColor: '#EFF1ED',
    },
    txtdescription: {
        width: '90%',
        marginTop: 20,
        marginLeft: 20,
        fontSize: 16,
        color: '#373D20'
    },
    input: {
        width: '90%',
        marginTop: 10,
        padding: 10,
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#373D20',
        margin: 'auto'
    },
    btnsave: {
        width: '60%',
        backgroundColor: '#373D20',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        height: 50,
        bottom: '5%',
        left: '20%',
        borderRadius: 20,
    },
    txtbtnsave: {
        color: '#EFF1ED',
        fontSize: 25,
        fontWeight: 'bold',
    },
    DateTimePicker: {
        height: 100,
        width: 100,
        borderRadius: 5,
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
      }
});