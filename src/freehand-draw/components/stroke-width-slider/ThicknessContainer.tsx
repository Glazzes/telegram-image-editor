import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { theme } from "@commons/theme";
import { Size } from "@commons/types";

import { useStrokeWidthStore } from "@freehand-draw/store/useStrokeWidthStore";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import {
  getStrokeWidthByType,
  setStrokeWidthByType,
} from "@freehand-draw/store/strokeStorage";
import { StrokeWidthSliderRef } from "@freehand-draw/types";

import StrokeWidthSlider from "./StrokeWidthSlider";

type ThicknessContainerProps = {
  canvasSize: Size<number>;
};

const ThicknessContainer: React.FC<ThicknessContainerProps> = ({
  canvasSize,
}) => {
  const sliderRef = useRef<StrokeWidthSliderRef>(null);

  const { width } = useCustomDimensions();
  const { progress, strokeWidth, doubleStrokeWidth } = useStrokeWidthStore();

  const strokeType = useStrokeStore((state) => state.activeType);

  const animationProgress = useSharedValue<number>(0);

  const size = (width - theme.spacing.s * 9 - theme.spacing.m * 2) / 8;
  const upperRadius = (size * 1.2) / 2;
  const lowerRadius = upperRadius * 0.25;
  const distance = canvasSize.height * 0.4 - upperRadius - lowerRadius;

  function onStart() {
    animationProgress.value = withTiming(1);
  }

  function onStrokeWidthUpdate(value: number) {
    "worklet";

    const finalWidth = interpolate(
      value,
      [0, 1],
      [lowerRadius * 1.9, upperRadius * 1.9],
      Extrapolation.CLAMP,
    );

    progress.value = value;
    strokeWidth.value = finalWidth;
    doubleStrokeWidth.value = finalWidth * 2;
  }

  function onEnd(strokeWidthPct: number) {
    animationProgress.value = withTiming(0);

    setStrokeWidthByType(strokeType, strokeWidthPct);
  }

  const sliderStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: -1 * upperRadius },
        {
          translateX: (theme.spacing.m + upperRadius) * animationProgress.value,
        },
      ],
    };
  }, [upperRadius, animationProgress]);

  const indicatorStyles = useAnimatedStyle(() => {
    return {
      width: strokeWidth.value,
      height: strokeWidth.value,
      opacity: animationProgress.value,
    };
  }, [strokeWidth, animationProgress]);

  useEffect(() => {
    let strokeWidth = getStrokeWidthByType(strokeType);
    if (strokeWidth === undefined) {
      strokeWidth = 0.5;
      setStrokeWidthByType(strokeType, 0.5);
    }

    sliderRef.current?.animateToValue(strokeWidth);
  }, [sliderRef, strokeType]);

  return (
    <React.Fragment>
      <Animated.View style={[styles.slider, sliderStyles]}>
        <StrokeWidthSlider
          ref={sliderRef}
          color={"#fff"}
          upperRadius={upperRadius}
          lowerRadius={lowerRadius}
          distance={distance}
          onStart={onStart}
          onUpdate={onStrokeWidthUpdate}
          onEnd={onEnd}
        />
      </Animated.View>

      {strokeType === "star-shape" ||
      strokeType === "circle-shape" ||
      strokeType === "arrow-shape" ? null : (
        <Animated.View style={[styles.indicator, indicatorStyles]} />
      )}
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  slider: {
    position: "absolute",
    alignSelf: "flex-start",
  },
  indicator: {
    position: "absolute",
    height: 10,
    width: 10,
    backgroundColor: "#fff",
    borderRadius: "50%",
    pointerEvents: "none",
  },
});

export default ThicknessContainer;
