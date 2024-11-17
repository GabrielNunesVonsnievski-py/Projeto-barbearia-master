import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, View, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import AntDesign from '@expo/vector-icons/AntDesign';
import { signOut } from "firebase/auth";
import { database, auth, doc, deleteDoc } from "../Config/firebaseconfig";
import Loading from './Loading';

export default function Horario({ navigation }) {

    const [isLoading, setIsLoading] = useState(true);
    const [horario, setHorario] = useState([])

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, []);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            console.error('nenhum user logado');
            return;
        }

        const agendamentoCollection = collection(database, "agendamento");

        const q = query(
            agendamentoCollection, 
            where("idUser", "==", user.uid,
            //orderBy("data", "asc") //ordena os horarios do menor p maior (asc = ascendente, do menor pro maior)
        ));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const list = [];
            querySnapshot.forEach((doc) => {
                list.push({ ...doc.data(), id: doc.id });
            });

            const sortedList = list.sort((a, b) => {  // organiza os horarios em ordem crescente 
                return new Date(a.data) - new Date(b.data);
            });

            setHorario(list);
        });

        return () => unsubscribe();
    }, [])

    function deleteHorario(id) {
        const HorarioDocRef = doc(database, "agendamento", id);
        deleteDoc(HorarioDocRef)
    }

    const logout = async () => {
        try {
            await signOut(auth);
            navigation.replace("Login");
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.listContainer}>
                <FlatList tyle={styles.flat}
                    showsVerticalScrollIndicator={false}
                    data={horario}
                    renderItem={({ item }) => {
                        return (
                            <View style={styles.taskContainer}>
                                <TouchableOpacity
                                    style={styles.btnDeleteTask}
                                    onPress={() => {
                                        deleteHorario(item.id)
                                    }}>
                                    <AntDesign name="delete" size={24} color="#FF4C4C" />
                                </TouchableOpacity>
                                <Text
                                    style={styles.taskDescription}
                                    onPress={() => {
                                        navigation.navigate("Details", {
                                            id: item.id,
                                            data: item.data,
                                            horario: item.horario
                                        })
                                    }}>
                                    {item.data + '                    ' + item.horario}
                                </Text>
                            </View>
                        )
                    }}
                />
            </View>

            <TouchableOpacity style={styles.btnNewTask} onPress={() => navigation.navigate("Home")}>
                <Text style={styles.iconBtn}> Voltar </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnLogout} onPress={logout}>
                <Text style={styles.txtbtnLogout}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8e8e8',
        paddingTop: 20,
    },
    listContainer: {
        flex: 1, 
        marginBottom: 50, 
    },
    flat: {
        margin: 10,
        borderEndEndRadius: 30,
    },
    taskContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 12,
        marginHorizontal: 16,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    taskDescription: {
        flex: 1,
        color: '#000',
        fontSize: 16,
        marginRight: 10,
        marginLeft: 45
    },
    btnDeleteTask: {
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    btnNewTask: {
        backgroundColor: '#b69045',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        height: 50,
        width: 70,
        bottom: 30,
        left: 20,
        borderRadius: 30,
        marginTop: 100,
    },
    iconBtn: {
        color: '#FFF',
        fontSize: 25,
        fontWeight: 'bold',
    },
    btnLogout: {
        backgroundColor: '#b69045',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        height: 50,
        width: '30%',
        bottom: 30,
        right: 20,
        borderRadius: 25,
        marginTop: 10,
    },
    txtbtnLogout: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
