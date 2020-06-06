import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, ImageBackground } from 'react-native';
import { RectButton } from 'react-native-gesture-handler'
import {Feather as Icon} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

interface ResIBGEUFs {
  sigla: string;
}

interface ResIBGECitys {
  nome: string;
}

const Home = () => {

    const navigation = useNavigation();

    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');

    useEffect(() => {
      axios.get<ResIBGEUFs[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
          const ufInicials = res.data.map(uf => uf.sigla );

          setUfs(ufInicials);
      })
    }, []);

    useEffect(() => {
        axios.get<ResIBGECitys[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res => {
            const cityInicials = res.data.map(city => city.nome );

            setCities(cityInicials);
        })
    }, [selectedUf]);

    function handleNavigationPoints(){
        navigation.navigate('Points', {
          uf: selectedUf,
          city: selectedCity,
        });
    }

    function handleSelectedUf(uf: string){
      setSelectedUf(uf);
    };

    function handleSelectedCity(city: string){
        setSelectedCity(city);
    };

    return (
        <ImageBackground 
            source={require('../../assets/home-background.png')}
            style={styles.container}
            imageStyle={{width: 274, height: 364}}
        >
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <Text style={styles.title}>Seu marketplace de coleta de resíduos.</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>       
            </View>

            <View style={styles.footer}>
                <RNPickerSelect 
                    onValueChange={handleSelectedUf}
                    items={ufs.map(uf =>({ label: uf, value: uf }))}
                />
                <RNPickerSelect 
                    onValueChange={handleSelectedCity}
                    items={cities.map(cities =>({ label: cities, value: cities }))}
                />
                <RectButton style={styles.button} onPress={handleNavigationPoints}>
                    <View style={styles.buttonIcon}>
                        <Text>
                            <Icon name="arrow-right" color="#FFF" />
                        </Text>
                    </View>
                    <Text style={styles.buttonText}>
                        Entrar
                    </Text>
                </RectButton>
            </View> 
        </ ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });

  export default Home;