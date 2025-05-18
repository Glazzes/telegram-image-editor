import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  clamp,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Canvas, Rect, Shader, Skia } from "@shopify/react-native-skia";

import { theme } from "@commons/theme";
import { useVector } from "@commons/hooks/useVector";
import { useColorPickerDimensions } from "@color-picker/hooks/useColorPickerDimensions";

import { getColorFromGrid, getLuminance, GRID_SHADER } from "./utils";
import type { RGB } from "../utils/types";
import { listenToSelectedColorEvent } from "@color-picker/utils/emitter";

type GridProps = {
  activeSelector: SharedValue<0 | 1 | 2>;
  color: SharedValue<RGB>;
};

function useBorder(initialValue: number) {
  const borderTL = useSharedValue<number>(initialValue);
  const borderTR = useSharedValue<number>(initialValue);
  const borderBL = useSharedValue<number>(initialValue);
  const borderBR = useSharedValue<number>(initialValue);

  return {
    tl: borderTL,
    tr: borderTR,
    bl: borderBL,
    br: borderBR,
  };
}

const source = Skia.RuntimeEffect.Make(GRID_SHADER)!;

const Grid: React.FC<GridProps> = ({ color, activeSelector }) => {
  const { width, height, cellSize } = useColorPickerDimensions();

  const translate = useVector(0, 0);
  const border = useBorder(0);

  const opacity = useSharedValue<number>(0);
  const borderWidth = useSharedValue<number>(1);
  const borderColor = useSharedValue<string>("#000");

  const pan = Gesture.Pan()
    .onStart(() => {
      activeSelector.value = 0;

      opacity.value = 1;
      borderWidth.value = withTiming(1);
    })
    .onUpdate((e) => {
      const clampedX = clamp(e.x, 0, width - cellSize);
      const clampedY = clamp(e.y, 0, height - cellSize);

      const indexX = Math.round(clampedX / cellSize);
      const indexY = Math.floor(clampedY / cellSize);

      translate.x.value = indexX * cellSize;
      translate.y.value = indexY * cellSize;

      const realIndex = indexX + indexY * 12;
      border.tl.value = realIndex === 0 ? theme.spacing.m / 2 : 0;
      border.tr.value = realIndex === 11 ? theme.spacing.m / 2 : 0;
      border.bl.value = realIndex === 108 ? theme.spacing.m / 2 : 0;
      border.br.value = realIndex === 119 ? theme.spacing.m / 2 : 0;

      const currentColor = getColorFromGrid(
        { x: e.x, y: e.y },
        { width, height },
      );

      color.value = currentColor!.rawColor;

      const currentLuminance = getLuminance(currentColor!.rawColor);
      const blackLuminance = getLuminance([0, 0, 0]);

      const ratio =
        currentLuminance > blackLuminance
          ? (blackLuminance + 0.05) / (currentLuminance + 0.05)
          : (currentLuminance + 0.05) / (blackLuminance + 0.05);

      borderColor.value = ratio < 1 / 6 ? "#000" : "#fff";
    })
    .onEnd(() => {
      borderWidth.value = withTiming(3);
    });

  const selectorStyles = useAnimatedStyle(
    () => ({
      borderWidth: borderWidth.value,
      borderColor: borderColor.value,
      borderTopLeftRadius: border.tl.value,
      borderTopRightRadius: border.tr.value,
      borderBottomLeftRadius: border.bl.value,
      borderBottomRightRadius: border.br.value,
      opacity: opacity.value,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
      ],
    }),
    [borderWidth, borderColor, border, translate, opacity],
  );

  useAnimatedReaction(
    () => activeSelector.value,
    (value) => {
      if (value !== 0) {
        opacity.value = withTiming(0);
      }
    },
    [activeSelector],
  );

  useEffect(() => {
    const onColorSelected = listenToSelectedColorEvent(() => {
      opacity.value = 0;
    });

    return () => onColorSelected.remove();
  }, [opacity]);

  const styles = StyleSheet.create({
    root: {
      width: width + theme.spacing.m * 2,
      height: height,
      alignItems: "center",
    },
    border: {
      overflow: "hidden",
      borderRadius: theme.spacing.m / 2,
    },
    canvas: {
      width: width,
      height: height,
    },
    selector: {
      width: cellSize,
      height: cellSize,
      borderWidth: 4,
      position: "absolute",
    },
  });

  return (
    <View style={styles.root}>
      <GestureDetector gesture={pan}>
        <Animated.View style={styles.border}>
          <Canvas style={styles.canvas}>
            <Rect x={0} y={0} width={width} height={height}>
              <Shader source={source} uniforms={{ size: [width, height] }} />
            </Rect>
          </Canvas>
          <Animated.View style={[styles.selector, selectorStyles]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default Grid;
