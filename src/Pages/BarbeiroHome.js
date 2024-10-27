import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView, Alert} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { auth, database, getDocs, deleteDoc, updateDoc, doc } from '../Config/firebaseconfig';
import Loading from './Loading';
import { collection, query, where, getDoc, setDoc } from 'firebase/firestore';

export default function BarbeiroHome({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiroLogado, setBarbeiroLogado] = useState(null);
  const [barbeiros, setBarbeiros] = useState([]);

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

    fetchCurrentUser();
    getBarbeiros();
  }, []);

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
      console.error("Erro ao buscar barbeiros: ", error);
    }
  };

  
  const getAgendamentos = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const barbeiroIndex = barbeiros.findIndex(barbeiro => barbeiro.email === currentUser.email);
      if (barbeiroIndex !== -1) {
        const barbeiroNome = barbeiros[barbeiroIndex].nome;
        const q = query(useAgendamentosRef, where('barbeiro', '==', barbeiroNome));
        const agendamentosData = await getDocs(q);
        const agendamentoList = agendamentosData.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        agendamentoList.sort((a, b) => {
          const dataA = dayjs(`${a.data} ${a.horario}`, 'YYYY-MM-DD HH:mm');
          const dataB = dayjs(`${b.data} ${b.horario}`, 'YYYY-MM-DD HH:mm');
          return dataA - dataB;
        });
  
        setAgendamentos(agendamentoList);
        console.log(agendamentoList);
      } else {
        console.log('Barbeiro não encontrado na lista.');
      }
    }
  };

  useEffect(() => {
    getAgendamentos();
  }, [barbeiros]);

  // Função para obter o valor do serviço a partir da tabela 'servico'
  const getServicoValor = async (servico) => {
    try {
      const servicoRef = query(
        collection(database, "servico"),
        where("tipo", "==", servico)
      );
      const servicoSnap = await getDocs(servicoRef);
      if (!servicoSnap.empty) {
        const servicoData = servicoSnap.docs[0].data();
        return servicoData.valor; // Retorna o valor do serviço
      } else {
        console.error('Serviço não encontrado');
        return 0;
      }
    } catch (error) {
      console.error('Erro ao buscar o valor do serviço:', error);
      return 0;
    }
  };

  // Função para acumular o valor no faturamento diário do barbeiro
  const acumularFaturamentoDiario = async (valor, barbeiroId) => {
    try {
      const barbeiroDocRef = doc(database, "faturamento_diario", barbeiroId); 
      const barbeiroDocSnap = await getDoc(barbeiroDocRef);
  
      if (barbeiroDocSnap.exists()) {
        const barbeiroData = barbeiroDocSnap.data();
        const novoFaturamento = (barbeiroData.faturamento || 0) + valor; 
        await updateDoc(barbeiroDocRef, { faturamento: novoFaturamento });
        console.log('Faturamento diário atualizado:', novoFaturamento);
      } else {
        await setDoc(barbeiroDocRef, { faturamento: valor });
        console.log('Novo faturamento diário criado:', valor);
      }
    } catch (error) {
      console.error('Erro ao atualizar o faturamento diário do barbeiro:', error);
    }
  };

  const excluirAgendamento = async (idAgendamento) => {
    try {
      const agendamentoRef = doc(database, "agendamento", idAgendamento);
      await deleteDoc(agendamentoRef);
      console.log(`Agendamento ${idAgendamento} excluído com sucesso`);
    } catch (error) {
      console.error("Erro ao excluir o agendamento:", error);
    }
  };

  const handleConfirmacao = async (idAgendamento, servico, veio, data, hora) => {
    const dataAgendamento = dayjs(`${data} ${hora}`, 'YYYY-MM-DD HH:mm');
    const agora = dayjs();
    
    // Verifica se o agendamento já passou
    if (agora.isBefore(dataAgendamento)) {
      Alert.alert(
        'Horário Expirado',
        'O horário do agendamento ainda não passou. Não é possível manipular o status do agendamento.'
      );
      return;
    }
  
    const mensagem = veio
      ? 'Você confirma que o cliente veio?'
      : 'Você confirma que o cliente não veio?';
  
    Alert.alert(
      'Confirmação',
      mensagem,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            if (veio) {
              const valorServico = await getServicoValor(servico);
              await acumularFaturamentoDiario(valorServico, barbeiroLogado);
            } else {
              await excluirAgendamento(idAgendamento);
            }
            getAgendamentos();
          },
        },
      ],
    );
  };
  
  // Verifica se o agendamento já passou para desabilitar o botão
  const isAgendamentoPassado = (data, hora) => {
    const dataAgendamento = dayjs(`${data} ${hora}`, 'YYYY-MM-DD HH:mm');
    const agora = dayjs();
    return agora.isAfter(dataAgendamento);
  };
  

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {/* Banner */}
      <View style={styles.banner}>
        <Image
          source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs7WRs_S875bpXggXPJ7A748m8J7XmKX08dQ&s' }}
          style={styles.image}
        />
        <Text style={styles.bannerText}>MAJESTOSO</Text>
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {agendamentos.length > 0 ? (
          agendamentos.map((agendamento) => {
            const agendamentoPassado = isAgendamentoPassado(agendamento.data, agendamento.horario);
            return (
              <View key={agendamento.id} style={[styles.agendamentoContainer, agendamentoPassado ? {} : styles.containerDisabled]}>
                <Text style={styles.agendamentoText}>Data: {agendamento.data}</Text>
                <Text style={styles.agendamentoText}>Horário: {agendamento.horario}</Text>
                <Text style={styles.agendamentoText}>Serviço: {agendamento.servico}</Text>
                <Text style={styles.agendamentoText}>Cliente: {agendamento.nomeCliente}</Text>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.buttonConfirm,
                      agendamentoPassado ? {} : styles.buttonDisabled
                    ]}
                    onPress={() => handleConfirmacao(agendamento.id, agendamento.servico, true, agendamento.data, agendamento.horario)}
                    disabled={!agendamentoPassado}
                  >
                    <Text style={styles.buttonText}>Cliente veio</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.buttonCancel,
                      agendamentoPassado ? {} : styles.buttonDisabled
                    ]}
                    onPress={() => handleConfirmacao(agendamento.id, agendamento.servico, false, agendamento.data, agendamento.horario)}
                    disabled={!agendamentoPassado}
                  >
                    <Text style={styles.buttonText}>Cliente não veio</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noAgendamentoText}>Nenhum agendamento encontrado</Text>
        )}
      </ScrollView>

        {/* Footer */}
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
  buttonDisabled: {
    backgroundColor: '#ef4444',
  },
  containerDisabled: {
    backgroundColor: 'gray',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendamentoContainer: {
    marginBottom: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#b69045',
    borderRadius: 10,
    backgroundColor: '#fff',
    width: 300,
    marginTop: 20,
  },
  agendamentoText: {
    color: '#000',
  },
  noAgendamentoText: {
    color: '#b69045',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonConfirm: {
    backgroundColor: '#84cc16',
    padding: 10,
    borderRadius: 5,
  },
  buttonCancel: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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
});