import { useEffect, useState } from 'react'
import { Image, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Colors from '../components/colors'
import Assets from '../assets/index'
import loadFont from '../components/fontsLoader'





const Splash =()=>{
    const navigation = useNavigation()

    useEffect(()=>{
        let timeout = null
        loadFont()
        .then( async()=>{
            const user = await AsyncStorage.getItem('user') 
            const locale = await AsyncStorage.getItem('locale') 
            if(user && locale){
                timeout = setTimeout(()=>{
                    navigation.replace('main', {user, locale})
                }, 1000)
            }else{
                timeout = setTimeout(()=>{
                    navigation.replace('register')
                }, 1000)
            }
        })
        .catch((error)=>{
            console.log(error)
        })

        return()=>{
            clearTimeout(timeout)
        }
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='light-content' translucent backgroundColor='transparent' />
            <View>
                <Image source={Assets.images.icon_animation} style={{height: 300, width: 300}} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: Colors.base,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

export default Splash