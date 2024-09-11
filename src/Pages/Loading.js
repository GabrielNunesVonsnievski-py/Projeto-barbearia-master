import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const Loading = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFF" />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // fundo branco
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
  },
});

export default Loading;
