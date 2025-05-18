import React, { useEffect } from "react";
import { View, Text, Keyboard, StyleSheet } from "react-native";
import {
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

import AnimatedText from "./AnimatedText";
import ChannelSlider from "./ChannelSlider";

import type { RGB } from "../utils/types";
import { hex2rgb, rgb2hex } from "./utils";
import { useColorPickerDimensions } from "@color-picker/hooks/useColorPickerDimensions";
import { theme } from "@commons/theme";

type SlidersProps = {
  color: SharedValue<RGB>;
  activeSelector: SharedValue<0 | 1 | 2>;
};

const Sliders: React.FC<SlidersProps> = ({ color, activeSelector }) => {
  const { width, height, cellSize } = useColorPickerDimensions();

  const isEditing = useSharedValue<boolean>(false);

  // Color memoization for increasing performance (+30 fps)
  const lastHexColor = useSharedValue<string>(rgb2hex(color.value));
  const hexColor = useDerivedValue<string>(() => {
    if (activeSelector.value !== 2 || isEditing.value) {
      return lastHexColor.value;
    }

    lastHexColor.value = rgb2hex(color.value);
    return lastHexColor.value;
  }, [isEditing, lastHexColor]);

  function onChangeText(text: string, setValue: any) {
    isEditing.value = true;
    const trimmedText = text.substring(0, 6);

    setValue(trimmedText);
    const rgbColor = hex2rgb(text);
    if (rgbColor !== undefined) {
      color.value = rgbColor;
      lastHexColor.value = trimmedText;
    }
  }

  useEffect(() => {
    const listener = Keyboard.addListener("keyboardDidHide", () => {
      isEditing.value = false;
    });

    return () => {
      listener.remove();
    };
  }, [isEditing]);

  const styles = StyleSheet.create({
    root: {
      width: width + theme.spacing.m * 2,
      borderRadius: theme.spacing.m / 2,
      gap: theme.spacing.m,
    },
    canvas: {
      width: width,
      height: height,
      backgroundColor: "orange",
      borderRadius: theme.spacing.m / 2,
    },
    hexContainer: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.m,
      justifyContent: "flex-end",
      alignItems: "center",
      gap: theme.spacing.m,
    },
    title: {
      color: "#A8A8A8",
      fontSize: 14,
      fontWeight: "700",
    },
    input: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
      backgroundColor: "#5B5B5B",
      borderRadius: theme.spacing.m / 4,
      textAlign: "center",
      width: width - width * 0.75 - theme.spacing.m,
      height: cellSize * 1.2,
    },
  });

  return (
    <View style={styles.root}>
      <ChannelSlider
        color={color}
        colorName={"RED"}
        activeChannel="r"
        activeSelector={activeSelector}
      />
      <ChannelSlider
        color={color}
        colorName={"GREEN"}
        activeChannel="g"
        activeSelector={activeSelector}
      />
      <ChannelSlider
        color={color}
        colorName={"BLUE"}
        activeChannel="b"
        activeSelector={activeSelector}
      />

      <View style={styles.hexContainer}>
        <Text style={styles.title}>HEX COLOR #</Text>
        <AnimatedText
          text={hexColor}
          style={[styles.input]}
          keyboardType="default"
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
};

export default Sliders;
