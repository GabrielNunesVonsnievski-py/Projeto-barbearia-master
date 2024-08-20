import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { database, doc, updateDoc } from "../Config/firebaseconfig";

export default function Details({ navigation, route }) {

    const [horarioEdit, setHorarioEdit] = useState(route.params.hora);
    const [dataEdit, setdataEdit] = useState(route.params.data);
    const idagendamento = route.params.id;

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

    return (
        <View style={styles.container}>
            <Text style={styles.txtdescription}> Description </Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: 1500 (15:00)"
                onChangeText={setHorarioEdit}
                value={horarioEdit}
            />
            <TextInput
                style={styles.input}
                placeholder="Ex: 1500 (15:00)"
                onChangeText={setdataEdit}
                value={dataEdit}
            />
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
    }
});