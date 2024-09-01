import React, {useState, useEffect} from "react";
import {SafeAreaView, Text, View, TouchableOpacity,FlatList, StyleSheet} from 'react-native';
import { collection, onSnapshot, query,where } from 'firebase/firestore';
import AntDesign from '@expo/vector-icons/AntDesign';
import { signOut } from "firebase/auth";
import { database, auth , doc , deleteDoc} from "../Config/firebaseconfig";
import Loading from './Loading';


export default function Horario ({navigation}){

    const [isLoading, setIsLoading] = useState(true);
    const [horario, setHorario] = useState([])
   
    useEffect(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 2000); // 2 segundos de delay que o marcos não gosta
      }, []);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            console.error('nenhum user logado');
            return;
        }

        const agendamentoCollection = collection(database, "agendamento");
        const q = query(agendamentoCollection, where("idUser", "==", user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const list = [];
            querySnapshot.forEach((doc) => {
                list.push({ ...doc.data(), id: doc.id });
            });
            setHorario(list);
        });

        return () => unsubscribe();
    }, [])

    function deleteHorario(id){
        
        //database.collection("Tasks").doc(id).deleteDoc()
        const HorarioDocRef = doc(database, "agendamento", id);
        deleteDoc(HorarioDocRef)
        
    }
    const logout = async () => {
        try {
            await signOut(auth);
            navigation.replace("Login"); // ureplace para que o usuário não possa voltar para a tela de tarefas com o botão de voltar
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    if (isLoading) {
        return <Loading />;
    }
    
    return(
        <SafeAreaView style={styles.container}>
          <FlatList
          showsVerticalScrollIndicator={false}
          data={horario}
          renderItem={({item} )=>{
            return(
            <View style={styles.tasks}>
                <TouchableOpacity
                    style={styles.btnDeleteTask}
                    onPress={()=>{
                        deleteHorario(item.id)
                    }}>
                    <AntDesign name="delete" size={24} color="#b69045" />
                </TouchableOpacity>
                <Text
                style={styles.txtdescription}
                onPress={()=> {
                    navigation.navigate("Details",{
                        id:item.id,
                        data:item.data,
                        horario:item.horario
                    })
                }}>
                    {item.data +'       ' + item.horario}
                </Text>
            </View>
            )
        }}
        />

          <TouchableOpacity style={styles.btnNewTask}>
            <Text 
            style={styles.iconBtn}
            onPress={()=> navigation.navigate("Agendamento")}> + </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnLogout} onPress={logout}>
                <Text style={styles.txtbtnLogout}>Logout</Text>
            </TouchableOpacity>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        backgroundColor: '#EFF1ED',
        paddingTop: 20,
    },
    btnNewTask:
    {
        backgroundColor: '#b69045',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        height: 60,
        width: 60,
        bottom: 30,
        left: 20,
        borderRadius: 20,
        
    },
    iconBtn:
    {
        color: '#EFF1ED',
        fontSize: 25,
        fontWeight: 'bold',
    },
    tasks: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    btnDeleteTask: {
        justifyContent: 'center',
        paddingLeft: 15,

    },
    txtdescription:{
        width: '80%',
        alignContent: 'flex-start',
        backgroundColor: '#bcbd8b',
        padding: 12,
        paddingHorizontal: 20,
        marginBottom: 5,
        marginRight: 15,
        color: '#766153',
    },
    btnLogout: {
        backgroundColor: '#FF0000',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        height: 50,
        width: '60%',
        bottom: 30,
        right: 20,
        borderRadius: 20,
    },
    txtbtnLogout: {
        color: '#EFF1ED',
        fontSize: 18,
        fontWeight: 'bold',
    },
        

})