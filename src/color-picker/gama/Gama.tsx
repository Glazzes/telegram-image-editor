import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  clamp,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";

import { useVector } from "@commons/hooks/useVector";

import { GAMA_SHADER, hsl2xy } from "./utils";
import { hsl2rgb, rgb2hsl, stringifyRGB } from "../utils/colors";

import type { RGB } from "../utils/types";
import { useColorPickerDimensions } from "@color-picker/hooks/useColorPickerDimensions";
import { theme } from "@commons/theme";

type GamaProps = {
  activeSelector: SharedValue<0 | 1 | 2>;
  color: SharedValue<RGB>;
};

const shader = Skia.RuntimeEffect.Make(GAMA_SHADER)!;
const INDICATOR_SIZE = 30;

const hslColor = hsl2rgb(180, 1, 1);
const startingColor = stringifyRGB(hslColor);

const Gama: React.FC<GamaProps> = ({ color, activeSelector }) => {
  const { width, height } = useColorPickerDimensions();

  const uniforms = { size: [width, height] };

  const translate = useVector(0, 0);
  const backgroundColor = useSharedValue<string>(startingColor);

  const pan = Gesture.Pan()
    .hitSlop(14)
    .onBegin((_) => {
      activeSelector.value = 1;
    })
    .onUpdate((e) => {
      const boundX = (width - INDICATOR_SIZE) / 2;
      const boundY = (height - INDICATOR_SIZE) / 2;

      const toX = clamp(e.x - width / 2, -1 * boundX, boundX);
      const toY = clamp(e.y - height / 2, -1 * boundY, boundY);
      translate.x.value = toX;
      translate.y.value = toY;

      const hue = 360 * ((toY + boundY) / (boundY * 2));
      const luminosity = 1 - (toX + boundX) / (boundX * 2);

      const rgbColor = hsl2rgb(hue, 1, luminosity);
      color.value = rgbColor;

      backgroundColor.value = stringifyRGB(rgbColor);
    });

  const indicatorStyles = useAnimatedStyle(
    () => ({
      backgroundColor: backgroundColor.value,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
      ],
    }),
    [backgroundColor, translate],
  );

  useAnimatedReaction(
    () => ({
      isActive: activeSelector.value === 1,
    }),
    ({ isActive }) => {
      if (!isActive) return;

      const hsl = rgb2hsl(color.value);
      const xy = hsl2xy(hsl, {
        width: width - INDICATOR_SIZE,
        height: height - INDICATOR_SIZE,
      });

      translate.x.value = xy.x;
      translate.y.value = xy.y;
      backgroundColor.value = stringifyRGB(color.value);
    },
    [activeSelector],
  );

  const styles = StyleSheet.create({
    root: {
      width: width + theme.spacing.m * 2,
      height: height,
      borderRadius: theme.spacing.m / 2,
      justifyContent: "center",
      alignItems: "center",
    },
    border: {
      borderRadius: theme.spacing.m / 2,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    canvas: {
      width: width,
      height: height,
    },
    indicator: {
      width: INDICATOR_SIZE,
      height: INDICATOR_SIZE,
      borderWidth: 4,
      borderColor: "#fff",
      borderRadius: INDICATOR_SIZE / 2,
      position: "absolute",
    },
  });

  return (
    <View style={styles.root}>
      <GestureDetector gesture={pan}>
        <Animated.View style={styles.border}>
          <Canvas style={styles.canvas}>
            <Fill>
              <Shader source={shader} uniforms={uniforms} />
            </Fill>
          </Canvas>

          <Animated.View style={[styles.indicator, indicatorStyles]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default Gama;
