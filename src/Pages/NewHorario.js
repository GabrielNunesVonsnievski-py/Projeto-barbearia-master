import React, {useState} from "react";
import {View, Text, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import {database, doc, auth } from "firebase/auth";
import {collection, addDoc } from "firebase/firestore";

export default function NewHorario ({navigation}){

    const [data, setData] = useState(null);
    const [hora, setHora] = useState(null);

    const addHorario = async () => {
        try {
          const user = auth.currentUser; // Obtém o usuário atualmente autenticado
          if (!user) {
            throw new Error('No user is authenticated');
          }
          const agendamentoCollection = collection(database, "agendamento");
          await addDoc(agendamentoCollection, {
            data: data,
            horario: hora,
            idUser: user.uid, // Inclui o ID do usuário
          });
          navigation.navigate('Barbearia');
        } catch (error) {
          console.error("Erro ao adicionar agendamento: ", error);
        }
      };
    return(
        <View style={styles.container}>
            <Text style={styles.txtdescription}> AGENDAMENTO </Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: 1500 (15:00)"
                onChangeText={setHora}
                value={hora}
            />
            <TextInput
                style={styles.input}
                placeholder="Ex: 50624 (05/06/24)"
                onChangeText={setData}
                value={data}
            />
            <TouchableOpacity 
            style={styles.btnsave}
            onPress={()=> {addHorario()}}>
                <Text style={styles.txtbtnsave}> Save </Text>
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
    input:{
        width: '90%',
        marginTop: 10,
        padding: 10, 
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#373D20',
        margin: 'auto'
    },
    btnsave:{
        width: '60%',
        backgroundColor: '#373D20',
        justifyContent: 'center',
        alignItems:'center',
        position:'absolute',
        height: 50,
        bottom: '5%',
        left: '20%',
        borderRadius: 20,
    },
    txtbtnsave:{
        color: '#EFF1ED',
        fontSize: 25,
        fontWeight: 'bold',
    }
})