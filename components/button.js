import { StyleSheet, View, Text, TouchableOpacity, Pressable, Image } from "react-native"
import { LinearGradient } from 'expo-linear-gradient'
import Assets from "../assets/index"


const Button=({
    width,
    height,
    backgroundColor,
    color,
    icon,
    iconVariant,
    iconSize,
    iconRotation,
    text,
    paddingHorizontal,
    elevation,
    onPress,
    disabled,
    borderRadius,
    fontSize,
    justifyContent,
    gradient,
    fontFamily,
    textOpacity,
    overflow,
    shadowColor,
    image
    })=>{
    const CustomIcon = icon ? Assets.icons[icon] : ''

    return (
        <Pressable
            disabled={disabled}
            onPress={()=>onPress()}
            style={({ pressed })=>[
                styles.container,
                {justifyContent: justifyContent ? justifyContent : 'center'},
                {width, height, elevation, shadowColor, backgroundColor},
                paddingHorizontal && {paddingHorizontal: 15},
                pressed && {opacity: 0.8},
                disabled && {opacity: 0.8},
                {borderRadius: borderRadius ? borderRadius : 15},
                overflow && {overflow: 'hidden'}
            ]}
        >
            {
                gradient &&
                <LinearGradient
                    colors={gradient}
                    style={styles.gradient}
                />
            }
            {text && <Text numberOfLines={1} style={[styles.text, {color, fontSize: fontSize ? fontSize : 14, fontFamily: fontFamily ? fontFamily : 'Inter-SemiBold', opacity: textOpacity ? textOpacity : 1}]}>{text}</Text>}
            {icon && <CustomIcon color={color} variant={iconVariant} size={iconSize} style={iconRotation && { transform: [{ rotate: iconRotation } ] }} /> }
            {image}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container:{
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'red',
        overflow: 'hidden'
    },
    text:{
    },
    gradient:{
        position: 'absolute',
        height: '100%', 
        width: '100%'
    }
})

export default Button
