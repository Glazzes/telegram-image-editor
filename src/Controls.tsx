import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SkImage } from "@shopify/react-native-skia";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";

import { theme } from "@commons/theme";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import { drawStrokesAsImage } from "@freehand-draw/utils/canvas";

type ControlsProps = {
  baseLayer: SkImage;
  canvasWidth: number;
};

const Controls: React.FC<ControlsProps> = ({ baseLayer, canvasWidth }) => {
  const strokes = useStrokeStore((state) => state.strokes);

  const onPress = () => {
    const scale = baseLayer.width() / canvasWidth;
    const base64 = drawStrokesAsImage({ baseLayer, strokes, scale });

    Clipboard.setStringAsync(base64);
  };

  return (
    <View style={styles.root}>
      <Icon name="close" size={24} color={"#fff"} style={styles.icon} />
      <View style={styles.optionsContainer}>
        <Text style={styles.text}>draw</Text>
        <Text style={[styles.text, { color: theme.colors.text.disabled }]}>
          sticker
        </Text>
        <Text style={[styles.text, { color: theme.colors.text.disabled }]}>
          text
        </Text>
      </View>
      <Pressable onPress={onPress}>
        <Icon name="check" size={24} color={"#fff"} style={styles.icon} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.m,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: theme.spacing.m,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },
  icon: {
    width: 24,
    height: 24,
    padding: 0,
    margin: 0,
  },
});

export default Controls;
