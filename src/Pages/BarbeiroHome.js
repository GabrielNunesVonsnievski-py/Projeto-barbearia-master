import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView, Alert} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
  const [filtroAtual, setFiltroAtual] = useState('todos');
  const [formasPagamento, setFormasPagamento] = useState({});

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

  const isAgendamentoHoje = (data) => {
    const hoje = dayjs().format('DD-MM-YYYY');
    return data === hoje;
  };

  const agendamentosFiltrados = agendamentos.filter((agendamento) => {
    if (filtroAtual === 'hoje') {
      return isAgendamentoHoje(agendamento.data); // somente agendamentos do dia
    }
    return true; // Mostra todos os agendamentos
  });
  
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
        console.log('Valor do serviço encontrado:', servicoData.valor);
        return servicoData.valor;  
      } else {
        console.error('Serviço não encontrado');
        return 0;
      }
    } catch (error) {
      console.error('Erro ao buscar o valor do serviço:', error);
      return 0;
    }
  };
  

  
  const acumularFaturamentoDiario = async (valor, barbeiroId, formaPagamento) => {
  try {
    const hoje = dayjs().format('DD-MM-YYYY');
    const barbeiroDocRef = doc(database, 'faturamento_diario', `${barbeiroId}_${hoje}`); //doc(database, 'faturamento_diario', barbeiro.id); 
    const barbeiroDocSnap = await getDoc(barbeiroDocRef);

    if (barbeiroDocSnap.exists()) {
      const barbeiroData = barbeiroDocSnap.data();
      const novoFaturamento = {
        ...barbeiroData.faturamento,
        [formaPagamento]: (barbeiroData.faturamento[formaPagamento] || 0) + valor,
      };
      await updateDoc(barbeiroDocRef, { faturamento: novoFaturamento });
      console.log('Faturamento diário atualizado:', novoFaturamento);
    } else {
      const novoFaturamento = { [formaPagamento]: valor };
      await setDoc(barbeiroDocRef, { faturamento: novoFaturamento, data: hoje });
      console.log('Novo faturamento diário criado:', novoFaturamento);
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

  const handleConfirmacao = async (idAgendamento, servico, veio, data, hora, formaPagamento = '') => {
    try {
      // Converte a data para o formato ISO
      const dataAgendamentoISO = dayjs(data, 'DD-MM-YYYY').format('YYYY-MM-DD');
      const dataAgendamento = dayjs(`${dataAgendamentoISO} ${hora}`, 'YYYY-MM-DD HH:mm');
      const agora = dayjs();
  
      console.log('Data do Agendamento (ISO):', dataAgendamentoISO);
      console.log('Data e Hora do Agendamento:', dataAgendamento.toISOString());
      console.log('Agora:', agora.toISOString());
  
      // Verifica se o agendamento ainda não passou
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
  
      Alert.alert('Confirmação', mensagem, [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            if (veio) {
              const valorServico = await getServicoValor(servico);
              await acumularFaturamentoDiario(valorServico, barbeiroLogado, formaPagamento);
            }
            await excluirAgendamento(idAgendamento);
            await getAgendamentos();
          },
        },
      ]);
    } catch (error) {
      console.error('Erro em handleConfirmacao:', error);
    }
  };
  
  
  
  const atualizarFormaPagamento = (id, forma) => {
    setFormasPagamento((prevState) => ({
      ...prevState,
      [id]: forma,
    }));
  };
  

  const isAgendamentoPassado = (data, hora) => {
    try {
        console.log('Data recebida:', data);
        console.log('Hora recebida:', hora);

        // Verifica se os parâmetros estão presentes
        if (!data || !hora) {
            throw new Error('Data ou hora estão ausentes.');
        }

        // Ajusta o formato da hora caso necessário (exemplo: 1330 -> 13:30)
        if (!hora.includes(':') && hora.length === 4) {
            hora = `${hora.slice(0, 2)}:${hora.slice(2)}`;
        }

        // Divide a hora em partes e valida o formato HH:mm
        const [horaStr, minutoStr] = hora.split(':');
        const horas = parseInt(horaStr, 10);
        const minutos = parseInt(minutoStr, 10);

        if (
            isNaN(horas) || isNaN(minutos) ||
            horas < 0 || horas > 23 ||
            minutos < 0 || minutos > 59
        ) {
            throw new Error('Hora no formato inválido. Use HH:mm.');
        }

        // Divide a data no formato DD-MM-YYYY
        const [diaStr, mesStr, anoStr] = data.split('-');
        const dia = parseInt(diaStr, 10);
        const mes = parseInt(mesStr, 10) - 1; // O mês no objeto Date começa em 0
        const ano = parseInt(anoStr, 10);

        // Verifica se os valores da data são válidos
        if (
            isNaN(dia) || isNaN(mes) || isNaN(ano) ||
            mes < 0 || mes > 11 ||
            dia < 1 || dia > 31
        ) {
            throw new Error('Data no formato inválido. Use DD-MM-YYYY.');
        }

        // Cria o objeto Date do agendamento
        const dataAgendamento = new Date(ano, mes, dia, horas, minutos);

        // Verifica se a data gerada é válida
        if (isNaN(dataAgendamento.getTime())) {
            throw new Error('Data gerada é inválida.');
        }

        // Validação adicional: Verifica se a data realmente existe no calendário
        if (dataAgendamento.getDate() !== dia) {
            throw new Error('Data inválida (exemplo: 31 de fevereiro).');
        }

        // Obtém a data e hora atuais
        const agora = new Date();

        console.log('Data do Agendamento:', dataAgendamento.toString());
        console.log('Agora:', agora.toString());

        // Retorna verdadeiro se o agendamento já passou
        return dataAgendamento < agora;

    } catch (error) {
        //console.error('Erro ao verificar se o agendamento já passou:', error.message);
        return false; // Retorna falso em caso de erro
    }
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

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filtroAtual === 'hoje' && styles.filterButtonActive]}
          onPress={() => setFiltroAtual('hoje')}
        >
          <Text style={styles.filterButtonText}>Agendamentos do Dia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filtroAtual === 'todos' && styles.filterButtonActive]}
          onPress={() => setFiltroAtual('todos')}
        >
          <Text style={styles.filterButtonText}>Todos os Agendamentos</Text>
        </TouchableOpacity>
      </View>


      {/* Conteúdo Principal */}
      <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {agendamentosFiltrados.length > 0 ? (
          agendamentosFiltrados.map((agendamento) => {
            const agendamentoPassado = isAgendamentoPassado(agendamento.data, agendamento.horario);
            const formaPagamento = formasPagamento[agendamento.id] || '';
            return (
              <View key={agendamento.id} style={[styles.agendamentoContainer, agendamentoPassado ? {} : styles.containerDisabled]}>
              <Text style={styles.agendamentoText}>Data: {agendamento.data}</Text>
              <Text style={styles.agendamentoText}>Horário: {agendamento.horario}</Text>
              <Text style={styles.agendamentoText}>Serviço: {agendamento.servico}</Text>
              <Text style={styles.agendamentoText}>Cliente: {agendamento.nomeCliente}</Text>

              <Picker
                selectedValue={formaPagamento}
                onValueChange={(itemValue) => atualizarFormaPagamento(agendamento.id, itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione a Forma de Pagamento" value="" />
                <Picker.Item label="Cartão" value="Cartão" />
                <Picker.Item label="Pix" value="Pix" />
                <Picker.Item label="Dinheiro" value="Dinheiro" />
              </Picker>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.buttonConfirm,
                    agendamentoPassado && formaPagamento ? {} : styles.buttonDisabled,
                  ]}
                  onPress={() =>
                    handleConfirmacao(
                      agendamento.id,
                      agendamento.servico,
                      true,
                      agendamento.data,
                      agendamento.horario,
                      formaPagamento
                    )
                  }
                  disabled={!agendamentoPassado || formaPagamento === ''}
                >
                  <Text style={styles.buttonText}>Cliente veio</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.buttonCancel,
                    agendamentoPassado ? {} : styles.buttonDisabled,
                  ]}
                  onPress={() =>
                    handleConfirmacao(
                      agendamento.id,
                      agendamento.servico,
                      false,
                      agendamento.data,
                      agendamento.horario
                    )
                  }
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#b69045',
  },
  filterButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc', // Cinza para botões desabilitados
    color: '#999',
    opacity: 0.5, 
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