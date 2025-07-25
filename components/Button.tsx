import React from "react";
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import Colors from "@/constants/colors";

interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export default function Button({
  title,
  children,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case "primary":
        buttonStyle.backgroundColor = Colors.light.primary;
        break;
      case "secondary":
        buttonStyle.backgroundColor = Colors.light.secondary;
        break;
      case "outline":
        buttonStyle.backgroundColor = "transparent";
        buttonStyle.borderWidth = 1;
        buttonStyle.borderColor = Colors.light.primary;
        break;
      case "danger":
        buttonStyle.backgroundColor = Colors.light.error;
        break;
      case "ghost":
        buttonStyle.backgroundColor = "transparent";
        break;
    }
    
    // Size styles
    switch (size) {
      case "small":
        buttonStyle.paddingVertical = 8;
        buttonStyle.paddingHorizontal = 16;
        buttonStyle.borderRadius = 6;
        break;
      case "medium":
        buttonStyle.paddingVertical = 12;
        buttonStyle.paddingHorizontal = 24;
        buttonStyle.borderRadius = 8;
        break;
      case "large":
        buttonStyle.paddingVertical = 16;
        buttonStyle.paddingHorizontal = 32;
        buttonStyle.borderRadius = 10;
        break;
    }
    
    // Disabled style
    if (disabled) {
      buttonStyle.opacity = 0.5;
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyleObj: TextStyle = {};
    
    // Variant text styles
    switch (variant) {
      case "outline":
        textStyleObj.color = Colors.light.primary;
        break;
      case "ghost":
        textStyleObj.color = Colors.light.primary;
        break;
      default:
        textStyleObj.color = "white";
        break;
    }
    
    // Size text styles
    switch (size) {
      case "small":
        textStyleObj.fontSize = 14;
        break;
      case "medium":
        textStyleObj.fontSize = 16;
        break;
      case "large":
        textStyleObj.fontSize = 18;
        break;
    }
    
    return textStyleObj;
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? Colors.light.primary : "white"} />
      ) : children ? (
        children
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
});
