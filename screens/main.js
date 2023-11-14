import { OPENAI_API_KEY } from "@env"
import { useEffect, useState } from 'react'
import { Image, SafeAreaView, StatusBar, StyleSheet, View, Text, FlatList, ActivityIndicator, ImageBackground, Dimensions, Pressable, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { LinearGradient } from 'expo-linear-gradient'
import * as Speech from 'expo-speech'
import axios from "axios"
import Voice from '@react-native-voice/voice'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown, FadeOutLeft, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import Colors from '../components/colors'
import Assets from '../assets/index'
import Input from '../components/input'
import loadFont from '../components/fontsLoader'
import Button from '../components/button'


const Main =({route})=>{
    const [listening, setListening] = useState(false)
    const [speech, setSpeech] = useState(false)
    const [recognized, setRecognized] = useState(false)
    const [endPoint, setEndPoint] = useState({
        name: 'Text',
        model: 'gpt-3.5-turbo',
        url: 'https://api.openai.com/v1/chat/completions'
    })
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState([])
    const [error, setError] = useState(null)
    const {user, locale} = route.params

    useEffect(()=>{
        //console.log('locale ', locale)
        //Voice.onSpeechStart = onSpeechStart
        Voice.onSpeechEnd = onSpeechEnd
        Voice.onSpeechRecognized = onSpeechRecognized
        Voice.onSpeechError = onSpeechError
        Voice.onSpeechResults = onSpeechResults
        
        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
          }
    }, [messages, endPoint])

    const startRecording = async() =>{
        setError(null)
        setSpeech(false)
        setRecognized(false)
        try {
            if(!listening){
                setListening(true)
                await Voice.start("fr-FR")                
            }
        } catch (error) {
            console.log(error)
            setListening(false)
        }
    }

    const onSpeechRecognized =()=>{
        setRecognized(true)
    }

    const onSpeechError = (e) => {
        setError(e.error)
        setSpeech(false)
        setRecognized(false)
        setListening(false)
    }

    const onSpeechEnd =()=> {
        setSpeech(false)
        setListening(false)
    }

    const onSpeechResults =async(e)=>{
        setSpeech(false)
        setListening(false)
        setLoading(true)
        if(e.value){
            let currentDate = new Date()
            let data = {
                id: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}_${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}_${user}`,
                sender: user,
                role: 'user',
                message: e.value[0],
            }
            setMessages(prev => [...prev, data])

            const updatedMessages = [...messages, data]
            let context = []
            let body = null

            if(endPoint.name === 'Text'){
                context = updatedMessages.map((msg) => ({
                    role: msg.sender === user ? 'user' : 'assistant',
                    content: msg.message,
                }))
                context.unshift({
                    role: 'system',
                    content: `Your name is Ava and your interlocutor is ${user}`
                })
                body = {
                    model : endPoint.model,
                    messages : context
                }
            }else{
                body = {
                    model : endPoint.model,
                    prompt : e.value[0],
                    n : 1,
                    size : "1024x1024"                    
                }
            }

            try {
                await Voice.stop()
                const apiKey = OPENAI_API_KEY
                const response = await axios.post(
                    endPoint.url,
                    body,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                        },
                    }
                )

                if(response.data){
                    let data = null

                    if(endPoint.name === 'Text'){
                        data = {
                            id: response.data.choices[0].id,
                            sender: 'Ava',
                            message: response.data.choices[0].message.content,
                        }
                    }else{
                        data = {
                            id: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}_${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}_Ava`,
                            sender: 'Ava',
                            image: response.data.data[0].url,
                        }
                    }
                    
                    setMessages(prev => [...prev, data])
                    await Speech.stop()
                    setSpeech(true)
                    Speech.speak(endPoint.name === 'Text' ? data.message : 'Voici votre image' , {language: locale})  
                }
                setLoading(false)

            } catch (error) {
                console.log(error)
                setLoading(false)
            }            
        }
    }


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' translucent backgroundColor='transparent' />
            <View style={styles.header}>
                <Text style={{fontFamily: 'Inter-SemiBold', fontSize: 18, color: 'black', textAlign: 'center'}}>Hello {user},</Text>
                <Text style={{fontFamily: 'Inter-Regular', fontSize: 14, color: 'black', opacity: 0.7, textAlign: 'center'}}>what are you thinking today?</Text>
                <View style={styles.separator} />
                <ModelSlider endPoint={endPoint} setEndPoint={setEndPoint} setMessages={setMessages} />
            </View>
            <View style={styles.main}>
                {
                    messages.length === 0 &&
                    <View style={{height: '80%', width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                        <Image source={Assets.images.hand_w_phone} style={{height: 250, width: 250}} />
                    </View>
                }
                <FlatList
                    data={messages}
                    renderItem={({item})=> <BubbleChat item={item} user={user} endPoint={endPoint} />}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    ListHeaderComponent={<View style={{height: 50, width: '100%'}} />}
                    ListFooterComponent={
                        <View>
                            {
                                loading && <BubbleLoading />
                            }
                        </View>
                    }
                />
            </View>
            <View style={styles.footer}>
                <Button
                    icon='Pause'
                    color='white'
                    iconVariant='Bold'
                    iconSize={20}
                    height={40}
                    width={40}
                    disabled={!speech}
                    backgroundColor='#bfbfbf'
                    borderRadius={100}
                    onPress={()=> {
                        setSpeech(false)
                        Speech.stop()
                    }}
                />                  
                <View style={styles.button}>
                    {listening && <AnimatedButtonContainer endPoint={endPoint} />}
                    <Button
                        image={<Image source={!listening ? Assets.images.mic : Assets.images.icon_animation} style={[{position: 'absolute'}, !listening ? {height: 40, width: 40} : {height: 100, width: 100}]}/>}
                        height={60}
                        width={60}
                        backgroundColor={endPoint.name === 'Text' ? Colors.base : Colors.pink}
                        borderRadius={100}
                        elevation={8}
                        disabled={listening || loading}
                        shadowColor={endPoint.name === 'Text' ? Colors.base : Colors.pink}
                        onPress={()=> startRecording()}
                    />
                </View>  
                <Button
                    icon='Trash'
                    color='white'
                    iconVariant='Bold'
                    iconSize={25}
                    height={40}
                    width={40}
                    disabled={messages.length === 0}
                    backgroundColor='#bfbfbf'
                    borderRadius={100}
                    onPress={()=> setMessages([])}
                />  
            </View>
        </SafeAreaView>
    )
}

const BubbleChat =({item, user, endPoint})=>{
    const isUser = item.sender === user
    const [imageLoaded, setImageLoaded] = useState(false)
    const navigation = useNavigation()

    return (
        <View style={{width: '100%', marginBottom: 10}}>
            <Animated.View entering={FadeInDown} style={[styles.bubble, isUser ? senderStyle : recipientStyle, isUser && {backgroundColor: endPoint.name === 'Text' ? Colors.base : Colors.pink}]}>
                {item.message && <Text style={{fontSize: 14, fontFamily: 'Inter-Regular', color: isUser ? 'white' : 'black'}}>{item.message}</Text>}
                {item.image && 
                    <TouchableOpacity onPress={()=> navigation.navigate('imageViewer', {uri: item.image})}>
                        <Image onLoad={()=> setImageLoaded(true)} source={{uri: item.image}} style={{height: 250, width: 250, borderRadius: 12}}  />
                        {
                            !imageLoaded &&
                            <View style={{height: '100%', width: '100%', position: 'absolute', alignItems: 'center', justifyContent: 'center'}}>
                                <ActivityIndicator size='small' color='black' />
                            </View>
                        }
                    </TouchableOpacity>
                }
            </Animated.View>
            {!isUser && <Text style={{fontSize: 13, fontFamily: 'Inter-Regular', color: 'black', opacity: 0.6}}>Ava</Text>}
        </View>
    )
}

const BubbleLoading =()=>{
    return (
        <Animated.View entering={FadeInDown} exiting={FadeOutLeft} style={[styles.bubble, recipientStyle, {flexDirection: 'row', gap: 4}]}>
            <Image source={Assets.images.typing_animation} style={{height: 20, width: 40}} />
        </Animated.View>
    )
}

const ModelSlider =({endPoint, setEndPoint, setMessages})=>{
    const posX = useSharedValue(1)

    const changeModel =()=>{
        if(endPoint.name === 'Text'){
            setEndPoint({
                name: 'Image',
                model: 'dall-e-3',
                url: 'https://api.openai.com/v1/images/generations'
            })
            setMessages([])
            posX.value = withTiming(75, {duration: 300})
        }else{
            setEndPoint({
                name: 'Text',
                model: 'gpt-3.5-turbo',
                url: 'https://api.openai.com/v1/chat/completions'
            })
            setMessages([])
            posX.value = withTiming(1, {duration: 300})
        }
    }

    const animatedStyle = useAnimatedStyle(()=>{
        return {
            transform:[
                {translateX: posX.value}
            ]
        }
    })

    return (
        <View style={styles.sliderContainer}>
            <Animated.View style={[{position: 'absolute', height: '100%', width: '50%', left: 0}, animatedStyle]}>
                <LinearGradient 
                    colors={endPoint.name === 'Text' ? [Colors.base, '#e75114'] : [Colors.pink, '#ed4758']}
                    style={{height: '100%', width: '100%', borderRadius: 100}}
                />                
            </Animated.View>

            <Button
                text='Text'
                color={endPoint.name === 'Text' ? 'white' : 'gray'}
                fontFamily='Inter-Medium'
                height='100%'
                width='50%'
                onPress={()=> changeModel()}
            />
            <Button
                text='Image'
                color={endPoint.name === 'Image' ? 'white' : 'gray'}
                height='100%'
                width='50%'
                fontFamily='Inter-Medium'
                //gradient={[Colors.base, '#e75114']}
                onPress={()=> changeModel()}
            />
        </View>
    )
}

const AnimatedButtonContainer =({endPoint})=>{
    const scale_1 = useSharedValue(1)
    const scale_2 = useSharedValue(1)

    useEffect(()=>{
        scale_1.value = withRepeat(
            withSequence(
                withTiming(1.2, {duration: 2000}),
                withTiming(1, {duration: 2000})
            ),
            -1,
            true     
        )
        scale_2.value = withRepeat(
            withSequence(
                withTiming(1.2, {duration: 1000}),
                withTiming(1.1, {duration: 1200})
            ),
            -1,
            true     
        )

    }, [])

    const animatedStyle_1 = useAnimatedStyle(()=>{
        return {
            transform:[
                {scale: scale_1.value}
            ]
        }
    })

    const animatedStyle_2 = useAnimatedStyle(()=>{
        return {
            transform:[
                {scale: scale_2.value}
            ]
        }
    })

    return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={{position: 'absolute', alignItems: 'center', justifyContent: 'center'}}>
            <Animated.View style={[styles.buttonContainer, {opacity: 0.4, height: 61, width: 61, backgroundColor: endPoint.name === 'Text' ? Colors.base : Colors.pink }, animatedStyle_1]} />
            <Animated.View style={[styles.buttonContainer, {opacity: 0.7, height: 60, width: 60, backgroundColor: endPoint.name === 'Text' ? Colors.base : Colors.pink }, animatedStyle_2]} />            
        </Animated.View>
    )
}

const senderStyle = {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignSelf: 'flex-end'
}

const recipientStyle = {
    backgroundColor: '#f1f1f1',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignSelf: 'flex-start'
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'white',
    },
    header:{
        paddingTop: 50,
        paddingHorizontal: 25,
        height: 200,
        width: '100%',
        backgroundColor: 'white',
    },
    footer:{
        position: 'absolute', 
        bottom: 10, 
        flexDirection: 'row',
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 25,
    },
    main:{
        flex: 0.85, 
        paddingHorizontal: 25,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40
    },
    button:{
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer:{
        position: 'absolute',
        borderRadius: 100
    },
    bubble:{
        maxWidth: '85%',
        minWidth: '20%',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 0,
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    separator:{
        height: 5,
        width: 30,
        borderRadius: 100,
        alignSelf: 'center',
        marginTop: 10,
        backgroundColor: Colors.pink,
        opacity: 0.8
    },
    sliderContainer:{
        flexDirection: 'row',
        marginTop: 15,
        alignSelf: 'center',
        height: 45,
        width: 150,
        backgroundColor: '#f1f1f1',
        borderRadius: 100,
        overflow: 'hidden'
    }
})

export default Main