import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  clamp,
  Extrapolation,
  interpolate,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";

import { theme } from "@commons/theme";
import { useColorPickerDimensions } from "@color-picker/hooks/useColorPickerDimensions";

import type { RGB } from "../../utils/types";
import OpacitySliderIndicator from "./OpacitySliderIndicator";
import { listenToUpdateColorPickerColor } from "@color-picker/utils/emitter";
import { parseRGBA } from "@color-picker/utils/colors";
import { getStrokeColorByType } from "@freehand-draw/store/strokeStorage";

type OpacitySliderProps = {
  color: SharedValue<RGB>;
  opacity: SharedValue<number>;
};

const colors = ["#000", "#fff"];

const OpacitySlider: React.FC<OpacitySliderProps> = ({ color, opacity }) => {
  const { width, cellSize, indicatorSize } = useColorPickerDimensions();

  const boundary = (width - indicatorSize) / 2;
  const checkerSize = cellSize / 4;
  const columns = Math.ceil(width / checkerSize);
  const checkers = new Array(columns * 2).fill(0);

  const translateX = useSharedValue<number>(boundary);
  const offset = useSharedValue<number>(0);

  const sliderGradient = useDerivedValue(() => {
    const [r, g, b] = color.value;
    const start = `rgba(${r!}, ${g!}, ${b!}, 0.2)`;
    const end = `rgba(${r!}, ${g!}, ${b!}, 0.9)`;

    return [start, end];
  }, [color]);

  function setValuesByColor(color: string) {
    const channels = parseRGBA(color);

    opacity.value = channels.a;
    translateX.value = interpolate(
      channels.a,
      [0, 1],
      [-1 * boundary, boundary],
      Extrapolation.CLAMP,
    );
  }

  const pan = Gesture.Pan()
    .onStart((e) => {
      offset.value = e.x - width / 2;
    })
    .onUpdate((e) => {
      const toX = offset.value + e.translationX;
      translateX.value = clamp(toX, -1 * boundary, boundary);
      opacity.value = interpolate(
        translateX.value,
        [-1 * boundary, boundary],
        [0, 1],
      );
    });

  useEffect(() => {
    const strokeColor = getStrokeColorByType("simple");
    if (strokeColor !== undefined) {
      setValuesByColor(strokeColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updateColorSub = listenToUpdateColorPickerColor(setValuesByColor);
    return () => updateColorSub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opacity, translateX, boundary]);

  const styles = StyleSheet.create({
    canvasContainer: {
      width: width,
      height: indicatorSize,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginTop: theme.spacing.m,
    },
    canvas: {
      width: width,
      height: cellSize / 2,
    },
    canvasBorder: {
      borderRadius: width / 2,
      overflow: "hidden",
    },
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={styles.canvasContainer}>
        <View style={styles.canvasBorder}>
          <Canvas style={styles.canvas}>
            {checkers.map((_, index) => {
              const x = index % columns;
              const y = Math.floor(index / columns);

              let checkerColor = x % 2 === 0 ? colors[0] : colors[1];
              if (y % 2 === 1) {
                checkerColor =
                  checkerColor === colors[0] ? colors[1] : colors[0];
              }

              return (
                <Rect
                  key={`checker-${index}`}
                  x={x * checkerSize}
                  y={y * checkerSize}
                  width={checkerSize}
                  height={checkerSize}
                  color={checkerColor}
                />
              );
            })}

            <Rect x={0} y={0} width={width} height={cellSize / 2}>
              <LinearGradient
                colors={sliderGradient}
                start={vec(0, 0)}
                end={vec(width, 0)}
              />
            </Rect>
          </Canvas>
        </View>

        <OpacitySliderIndicator
          color={color}
          opacity={opacity}
          translateX={translateX}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default OpacitySlider;
