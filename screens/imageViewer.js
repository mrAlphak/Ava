import { useEffect, useState } from "react"
import { SafeAreaView, StatusBar, StyleSheet, View, Text, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import Button from "../components/button"
import * as Progress from 'react-native-progress'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'



const ImageViewer =({route})=>{
    const navigation = useNavigation()
    const [downloading, setDownloading] = useState(false)
    const [imageDownloaded, setImageDownloaded] = useState(null)
    const [loading, setLoading] = useState(false)
    const {uri} = route.params

    const downloadImage =async()=>{
        const {granted} = await MediaLibrary.requestPermissionsAsync()
        if(!granted){
            return null
        }

        setImageDownloaded(null)
        setLoading(true)
        const currentDate = new Date()
        const ImageName = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}_${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}_AvaImage.png`     
          try {
            setLoading(false)
            setDownloading(true)
            const results = await FileSystem.downloadAsync(uri, FileSystem.cacheDirectory + ImageName, {
                cache: false
            })
            if(results){
                const album = await MediaLibrary.getAlbumAsync('Ava')
                const asset = await MediaLibrary.createAssetAsync(results.uri)
                if(!album){
                    await MediaLibrary.createAlbumAsync('Ava', asset)
                    console.log('album created')
                }else{
                    await MediaLibrary.addAssetsToAlbumAsync([asset], album)
                    console.log('file added')
                }
                setDownloading(false)
                setImageDownloaded(results.uri)
                setTimeout(()=>{
                    setImageDownloaded(null)              
                }, 1000)                
                console.log('Image Downloaded at', results.uri)
            }
          } catch (e) {
            setLoading(false)
            setDownloading(false)
            setImageDownloaded(null)
            console.error('Error downloading image:', e)
          }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent backgroundColor='transparent' barStyle="light-content"  />
            <View style={styles.header}>
                <Button
                    icon='ArrowLeft'
                    iconSize={22}
                    color='white'
                    iconVariant='Linear'
                    height={35}
                    width={35}
                    disabled={loading || downloading}
                    onPress={()=> navigation.goBack()}
                />
                <Text style={{color: 'white', fontFamily: 'Inter-Medium', fontSize: 14}}>Preview image</Text>
                <Button
                    icon='DocumentDownload'
                    iconSize={22}
                    color='white'
                    iconVariant='Linear'
                    height={35}
                    width={35}
                    disabled={loading || downloading}
                    onPress={()=> downloadImage()}
                />
            </View>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>  
                <Image source={{uri: uri}} style={{height: '50%', width: '100%'}} />
            </View>
            <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.footer}>
                <Text style={{fontSize: 13, fontFamily: "Inter-Medium", color: 'white'}}>{loading ? 'Preparing your download..' : downloading && 'Downloading your image..'}</Text>
                {downloading && <Progress.Bar indeterminate width={120} />}
            </Animated.View>
            {
                imageDownloaded &&
                <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.footer}>
                    <Text style={{fontSize: 13, fontFamily: "Inter-Medium", color: 'white'}}>Image downloaded</Text>
                </Animated.View>                
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'black',
    },
    header:{
        width: '100%',
        height: 80,
        paddingTop: 50,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    footer:{
        position: 'absolute',
        bottom: 6,
        width: '100%',
        alignItems: 'center',
        height: 60,
        gap: 10
    }
})

export default ImageViewer