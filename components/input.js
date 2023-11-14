//custom input component

import React from 'react'
import { View, TextInput, Pressable, StyleSheet, Text } from 'react-native'
import { Controller } from 'react-hook-form'
import Assets from "../assets/index"

const Input=React.forwardRef(({control, color, multiline, editable, keyboardType, name, height, width, handleEndEditing, maxLength, fontSize, backgroundColor, placeholder, defaultValue, secureTextEntry, handleChange, error, icon, iconColor, iconVariant, iconSize, textCenter, label, paddingRight}, ref)=>{
    const CustomIcon = icon ? Assets.icons[icon] : ''

    return(
        <View style={[styles.container, {height, width}]}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>                
            </View>

            {icon && 
                <View style={[styles.iconContainer, multiline === true ? {paddingTop: 10} : {justifyContent: 'center'}]}>
                    {icon && <CustomIcon color={iconColor} variant={iconVariant} size={iconSize} /> }
                </View>
            }
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                render={({field: { onBlur, onChange, value }}) =>
                    <TextInput
                        ref={ref}
                        placeholder={placeholder}
                        editable={editable}
                        placeholderTextColor="#9B9B9B"
                        onBlur={onBlur}
                        keyboardType={keyboardType}
                        maxLength={maxLength}
                        onChangeText={(value)=>{
                            onChange(value)
                            handleChange && handleChange({name, value})
                        }}
                        onEndEditing={handleEndEditing && handleEndEditing()}
                        value={value}
                        multiline={multiline}
                        secureTextEntry={secureTextEntry}
                        style={[styles.input,
                            !icon && textCenter && {textAlign: 'center'},
                            {fontSize: fontSize ? fontSize : 15, paddingRight},
                            {opacity: editable === false ? 0.4 : 1, color: color ? color : 'black'},                            
                        ]}
                    />
                }
            />
        </View>
    )
})

const styles = StyleSheet.create({
    container:{
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1.2,
        borderColor: 'lightgray',
    },
    input:{
        flex: 1,
        height: '100%',
        fontFamily: 'Inter-Regular',
        paddingHorizontal: 15
    },
    iconContainer:{
        width: 40,
        alignItems: 'center',
        height: '100%',
    },
    labelContainer:{
        position: 'absolute',
        top: -18,
        left: 12,
        backgroundColor: 'white',
        paddingHorizontal: 6,
        paddingVertical: 5
    },
    label:{
        color: 'black',
        opacity: 0.5,
        fontFamily: 'Inter-Medium',
        fontSize: 13,
    }
})

export default Input