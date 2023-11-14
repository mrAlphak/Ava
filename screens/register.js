import { useEffect, useState } from 'react'
import { Image, SafeAreaView, StatusBar, StyleSheet, View, Text, ActivityIndicator, ImageBackground, Dimensions, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Modal from 'react-native-modal'
import Colors from '../components/colors'
import Assets from '../assets/index'
import Input from '../components/input'
import loadFont from '../components/fontsLoader'
import Button from '../components/button'




const Register =()=>{
    const { control, getValues } = useForm()
    const [loading, setLoading] = useState(false)
    const [canSubmit, setCanSubmit] = useState(false)
    const [locale, setLocale] = useState("fr-FR")
    const [openModal, setOpenModal] = useState(false)
    const navigation = useNavigation()

    const onChange =({name, value})=>{
        const chars = /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/
        if(value){
            if(!value.match(chars) && value.length > 2){
                setCanSubmit(true)
            }
        }
    }

    const onSubmit = async()=> {
        const username = getValues('username')
        let timeout = null
        if(username){
            try {
                setLoading(true)
                await AsyncStorage.setItem('user', username.trim())
                await AsyncStorage.setItem('locale', locale)
                timeout = setTimeout(()=>{
                    setLoading(false)  
                    navigation.replace('main', {user: username, locale})
                }, 1000)
            } catch (error) {
                console.log(error)
            }
        }
        return()=>{
            timeout && clearTimeout(timeout)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' translucent backgroundColor='transparent' />

            {openModal && <LocaleModal setOpenModal={setOpenModal} setLocale={setLocale} />}
            <View style={styles.main}>
                <View>
                    <Text style={{color: 'black', fontFamily: 'Inter-SemiBold', fontSize: 24, opacity: 0.9}}>Hey, i'm Ava</Text>
                    <Text style={{color: 'black', fontFamily: 'Inter-Regular', fontSize: 14, opacity: 0.5}}>Choose a username to continue</Text>
                </View>
                <View style={{marginTop: 30}}>
                    <Input
                        control={control}
                        name="username"
                        label="Username"
                        height={55}
                        width='100%'
                        handleChange={({name, value})=> onChange({name, value})}
                    />
                </View>
                <View style={{marginTop: 10}}>
                    <Text style={{color: 'black', fontFamily: 'Inter-Medium', fontSize: 14}}>Locale:  {locale}</Text>
                </View>
                <View style={{marginTop: 30}}>
                    <Button
                        text={"Voice language"}
                        height={55}
                        gradient={[Colors.pink, '#ed4758']}
                        elevation={7}
                        borderRadius={100}
                        shadowColor={Colors.pink}
                        color="white"
                        disabled={loading}
                        onPress={()=> setOpenModal(true)}
                    />
                </View>    
                <View style={{marginTop: 10}}>
                    <Button
                        text={!loading ? "Get started" : <ActivityIndicator size="small" color='white' />}
                        height={55}
                        gradient={[Colors.base, '#e75114']}
                        elevation={7}
                        borderRadius={100}
                        shadowColor={Colors.base}
                        color="white"
                        disabled={!canSubmit || loading}
                        onPress={()=> onSubmit()}
                    />
                </View>             
            </View>

            <ImageBackground source={Assets.images.background_1} style={styles.background} blurRadius={20} />
        </SafeAreaView>
    )
}

const LocaleModal =({setOpenModal, setLocale})=>{
    const [locales, setLocales] = useState([
        {id: 'en-US'},
        {id: 'fr-FR'}
    ])

    const onPress =async(item)=>{
        setLocale(item.id)
        setOpenModal(false)
    }

    return (
        <Modal isVisible={true} onBackdropPress={()=>setOpenModal(false)} backdropOpacity={0.4} deviceHeight={Dimensions.get('screen').height} statusBarTranslucent>
            <View style={styles.modal}>
                <Text style={{color: 'black', fontFamily: 'Inter-Medium', fontSize: 14, opacity: 0.9, textAlign: 'center'}}>Change your default speech language</Text>
                <View style={{marginTop: 30}}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {
                            locales.map((item)=>
                            <View style={{marginBottom: 15}}>
                                <Button
                                    key={item.id}
                                    text={item.id}
                                    fontFamily='Inter-Medium'
                                    color='black'
                                    onPress={()=> onPress(item)}
                                />                                
                            </View>
                            )
                        }
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'white',
    },
    main:{
        position: 'absolute',
        width: Dimensions.get('screen').width,
        paddingHorizontal: 25,
        top: 100,
        zIndex: 3
    },
    background:{
        zIndex: 2,
        height: Dimensions.get('screen').height,
        width: Dimensions.get('screen').width,
        position: 'absolute',
        opacity: 0.6
    },
    modal:{
        backgroundColor: 'white',
        height: 200,
        width: '90%',
        borderRadius: 20,
        alignSelf: 'center',
        elevation: 3,
        paddingTop: 30,
        paddingHorizontal: 20
    }
})

export default Register