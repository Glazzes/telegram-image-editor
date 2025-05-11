import React from "react";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { theme } from "@commons/theme";
import { Size } from "@commons/types";

import { useStrokeWidthStore } from "@freehand-draw/store/useStrokeWidthStore";

type StrokeWidthSliderProps = {
  canvasSize: Size<number>;
};

const StrokeWidthSlider = (props: StrokeWidthSliderProps) => {
  const { width } = useCustomDimensions();

  const progress = useStrokeWidthStore((state) => state.progress);

  const size = (width - theme.spacing.s * 9 - theme.spacing.m * 2) / 8;
  const upperRadius = (size * 1.2) / 2;
  const lowerRadius = upperRadius * 0.25;
  const distance = props.canvasSize.height * 0.4 - upperRadius - lowerRadius;

  const sliderHeight = upperRadius * 2 + lowerRadius * 2 + distance;
  const sliderWidth = lowerRadius * 2;
  const backgroundColor = "rgba(255, 255, 255, 0.5)";
  const borderRadius = lowerRadius;

  const lowerBound = -1 * (sliderHeight / 2 - upperRadius);
  const upperBound = sliderHeight / 2 - lowerRadius;

  const translateY = useDerivedValue(() => {
    return interpolate(
      progress.value,
      [0, 1],
      [upperBound, lowerBound],
      Extrapolation.CLAMP,
    );
  }, [progress, lowerBound, upperBound]);

  const animatedStyles = useAnimatedStyle(() => {
    const size = lowerRadius * 4;
    return {
      width: size,
      height: size,
      backgroundColor: "#fff",
      borderRadius: "50%",
      transform: [{ translateY: translateY.value }],
    };
  }, [translateY, lowerRadius]);

  return (
    <View
      style={{
        width: sliderWidth,
        height: sliderHeight,
        backgroundColor,
        borderRadius,
        position: "absolute",
        alignSelf: "flex-start",
        justifyContent: "center",
        alignItems: "center",
        transform: [{ translateX: -1 * (sliderWidth / 2) }],
      }}
    >
      <Animated.View style={animatedStyles} />
    </View>
  );
};

export default StrokeWidthSlider;
