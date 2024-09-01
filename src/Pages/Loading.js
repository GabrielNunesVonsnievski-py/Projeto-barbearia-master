import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const Loading = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#373d20" />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffff', // fundo branco
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
  },
});

export default Loading;
