import React from "react";
import { View, StyleSheet, Text, Keyboard } from "react-native";
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";

import type { RGB } from "../utils/types";
import AnimatedText from "./AnimatedText";
import { useColorPickerDimensions } from "@color-picker/hooks/useColorPickerDimensions";
import { theme } from "@commons/theme";

type ChannelSliderProps = {
  color: SharedValue<RGB>;
  colorName: string;
  activeChannel: "r" | "g" | "b";
  activeSelector: SharedValue<0 | 1 | 2>;
};

const getGradient = (color: RGB, channel: "r" | "g" | "b"): string[] => {
  "worklet";
  if (channel === "r") {
    const start = `rgba(0, ${color[1]}, ${color[2]}, 1)`;
    const end = `rgba(255, ${color[1]}, ${color[2]}, 1)`;
    return [start, end];
  }

  if (channel === "g") {
    const start = `rgba(${color[0]}, 0, ${color[2]}, 1)`;
    const end = `rgba(${color[0]}, 255, ${color[2]}, 1)`;
    return [start, end];
  }

  const start = `rgba(${color[0]}, ${color[1]}, 0, 1)`;
  const end = `rgba(${color[0]}, ${color[1]}, 255, 1)`;
  return [start, end];
};

const ChannelSlider: React.FC<ChannelSliderProps> = ({
  color,
  colorName,
  activeChannel,
  activeSelector,
}) => {
  let index = 0;
  if (activeChannel === "g") index = 1;
  if (activeChannel === "b") index = 2;

  const { width, height, cellSize } = useColorPickerDimensions();

  const indicatorSize = cellSize * 1.2;
  const sliderWidth = width * 0.75;
  const sliderHeight = cellSize / 2;
  const boundary = (sliderWidth - indicatorSize) / 2;

  const translate = useSharedValue<number>(0);
  const offset = useSharedValue<number>(0);

  // Important memoization for increased performance (+30fps)
  // This garbage memoization keeps the gama color picker running smoothly at
  // 60 fps
  const lastChannelValue = useSharedValue<number>(color.value[index]!);

  const lastBackgroundColor = useSharedValue<string>(
    `rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 1)`,
  );

  const lastGradient = useSharedValue<string[]>(
    getGradient(color.value, activeChannel),
  );

  const channelValue = useDerivedValue(() => {
    if (activeSelector.value !== 2) {
      return `${Math.floor(lastChannelValue.value)}`;
    }

    lastChannelValue.value = Math.floor(color.value[index]!);
    return `${lastChannelValue.value}`;
  });

  const backgroundColor = useDerivedValue<string>(() => {
    if (activeSelector.value !== 2) {
      return lastBackgroundColor.value;
    }

    lastBackgroundColor.value = `rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 1)`;
    return lastBackgroundColor.value;
  });

  const gradient = useDerivedValue(() => {
    if (activeSelector.value !== 2) {
      return lastGradient.value;
    }

    lastGradient.value = getGradient(color.value, activeChannel);
    return lastGradient.value;
  });

  function onChangeText(
    text: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
  ) {
    const matches = text.match(/\d{1,3}/gi);
    if (matches === null) {
      setValue(text);
      return;
    }

    const rgbValue = Math.min(parseInt(matches[0], 10), 255);
    translate.value = interpolate(
      rgbValue,
      [0, 255],
      [-1 * boundary, boundary],
    );

    if (activeChannel === "r") {
      color.value = [rgbValue, color.value[1], color.value[2]];
    }

    if (activeChannel === "g") {
      color.value = [color.value[0], rgbValue, color.value[2]];
    }

    if (activeChannel === "b") {
      color.value = [color.value[0], color.value[1], rgbValue];
    }

    setValue(rgbValue.toString(10));
  }

  function dismissKeyboard() {
    Keyboard.dismiss();
  }

  const pan = Gesture.Pan()
    .onBegin((e) => {
      runOnJS(dismissKeyboard)();
      offset.value = e.x - sliderWidth / 2;
    })
    .onChange((e) => {
      translate.value = clamp(
        offset.value + e.translationX,
        -1 * boundary,
        boundary,
      );
      const newColor = 255 * ((translate.value + boundary) / (boundary * 2));

      let colorIndex = 0;
      if (activeChannel === "g") colorIndex = 1;
      if (activeChannel === "b") colorIndex = 2;

      color.value[colorIndex] = newColor;
      color.value = [...color.value];
    });

  const indicatorStyles = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
    transform: [{ translateX: translate.value }],
  }));

  useAnimatedReaction(
    () => ({ isActive: activeSelector.value === 2, currentColor: color }),
    ({ isActive, currentColor }) => {
      if (!isActive) return;

      let channel = currentColor.value[0];
      if (activeChannel === "g") channel = currentColor.value[1];
      if (activeChannel === "b") channel = currentColor.value[2];
      translate.value = interpolate(
        channel,
        [0, 255],
        [-1 * boundary, boundary],
      );
    },
    [activeSelector, color],
  );

  const styles = StyleSheet.create({
    root: {
      paddingHorizontal: theme.spacing.m,
    },
    color: {
      color: "#A8A8A8",
      fontSize: 14,
      fontWeight: "700",
    },
    selectorContainer: {
      flexDirection: "row",
      gap: theme.spacing.m,
    },
    sliderContainer: {
      height: indicatorSize,
      width: sliderWidth,
      justifyContent: "center",
      alignItems: "center",
    },
    canvasContainer: {
      borderRadius: theme.spacing.m,
      overflow: "hidden",
    },
    canvas: {
      width: sliderWidth,
      height: sliderHeight,
    },
    indicator: {
      width: indicatorSize,
      height: indicatorSize,
      borderRadius: indicatorSize / 2,
      borderWidth: 4,
      borderColor: "#fff",
      position: "absolute",
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
      <Text style={styles.color}>{colorName}</Text>

      <GestureDetector gesture={pan}>
        <Animated.View style={styles.selectorContainer}>
          <View style={styles.sliderContainer}>
            <View style={styles.canvasContainer}>
              <Canvas style={styles.canvas}>
                <Rect x={0} y={0} width={width} height={height}>
                  <LinearGradient
                    colors={gradient}
                    start={vec(0, 0)}
                    end={vec(sliderWidth, 0)}
                  />
                </Rect>
              </Canvas>
            </View>

            <Animated.View style={[styles.indicator, indicatorStyles]} />
          </View>

          <AnimatedText
            text={channelValue}
            style={[styles.input]}
            keyboardType={"numeric"}
            onChangeText={onChangeText}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default ChannelSlider;
