import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import Animated, {
  Extrapolation,
  clamp,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Canvas, Path, Skia, rect } from "@shopify/react-native-skia";

import { StrokeWidthSliderRef } from "@freehand-draw/types";
import { getStrokeWidthByType } from "@freehand-draw/store/strokeStorage";

type StrokeWidthSliderProps = {
  upperRadius: number;
  lowerRadius: number;
  distance: number;
  color: string;
  onStart?: () => void;
  onUpdate?: (value: number) => void;
  onEnd?: (value: number) => void;
};

const RAG2DEG = 180 / Math.PI;

/**
 * @component
 * @property props.upperRadius Radius of the upper circle
 * @property props.lowerRadius Radius of the lower circle
 * @property props.distance Distance between the circunference of both circles
 * @property props.onStart function fired as the user starts interacting with the slider.
 * @property props.onUpdate Worklet function fired as the slider moves, receives a value between 0 and 1
 * 0 at the bottom and 1 at the top
 * @property props.onEnd function fired as the user stops interacting with the slider.
 */
const StrokeWidthSlider = forwardRef<
  StrokeWidthSliderRef,
  StrokeWidthSliderProps
>((props, ref) => {
  const {
    upperRadius,
    lowerRadius,
    distance,
    color,
    onStart,
    onUpdate,
    onEnd,
  } = props;

  const canvasHeight = upperRadius * 2 + lowerRadius * 2 + distance;
  const upperBound = -1 * (canvasHeight / 2 - upperRadius);
  const lowerBound = canvasHeight / 2 - lowerRadius;

  const progress = useSharedValue<number>(0);
  const radius = useSharedValue<number>(lowerRadius);
  const size = useSharedValue<number>(lowerRadius * 2);

  const translate = useSharedValue<number>(0);
  const offset = useSharedValue<number>(0);

  function translateToValue(progress: number) {
    "worklet";

    const toPositionY = interpolate(
      progress,
      [0, 1],
      [lowerBound, upperBound],
      Extrapolation.CLAMP,
    );

    translate.value = withTiming(toPositionY);
  }

  function getOutputValue(translateY: number) {
    "worklet";
    return interpolate(
      translateY,
      [upperBound, lowerBound],
      [1, 0],
      Extrapolation.CLAMP,
    );
  }

  const path = useDerivedValue(() => {
    const skPath = Skia.Path.Make();

    // Common tangent of two circles calculations
    const cRadius = radius.value;
    const hipotenuse = canvasHeight - lowerRadius - cRadius;
    const adjacent = cRadius - lowerRadius;
    const angle = Math.acos(adjacent / hipotenuse);
    const remainingAngle = Math.PI / 2 - angle;

    // Upper section
    const upperCenterX = upperRadius;
    const upperCenterY = radius.value;

    const upperLeftAngle = Math.PI + remainingAngle;
    const upperLX = upperCenterX + cRadius * Math.cos(upperLeftAngle);
    const upperLY = upperCenterY + -1 * (cRadius * Math.sin(upperLeftAngle));

    const upperRightAngle = -1 * remainingAngle;
    const upperRX = upperCenterX + cRadius * Math.cos(upperRightAngle);
    const upperRY = upperCenterY + -1 * (cRadius * Math.sin(upperRightAngle));

    // Lower section
    const bottomCenterX = upperRadius;
    const bottomCenterY = upperRadius * 2 + lowerRadius + distance;

    const bottomLeftAngle = Math.PI + remainingAngle;
    const bottomLX = bottomCenterX + lowerRadius * Math.cos(bottomLeftAngle);
    const bottomLY =
      bottomCenterY + -1 * (lowerRadius * Math.sin(bottomLeftAngle));

    const bottomRightAngle = -1 * remainingAngle;
    const bottomRX = bottomCenterX + lowerRadius * Math.cos(bottomRightAngle);
    const bottomRY =
      bottomCenterY + -1 * (lowerRadius * Math.sin(bottomRightAngle));

    const x = upperRadius - cRadius;
    const start = (Math.PI - remainingAngle) * RAG2DEG;
    const end = (Math.PI + remainingAngle * 2) * RAG2DEG;
    skPath.addArc(rect(x, 0, cRadius * 2, cRadius * 2), start, end);

    skPath.moveTo(upperRX, upperRY);
    skPath.lineTo(upperLX, upperLY);
    skPath.lineTo(bottomLX, bottomLY);
    skPath.lineTo(bottomRX, bottomRY);
    skPath.lineTo(upperRX, upperRY);

    const start2 = remainingAngle * RAG2DEG;
    const end2 = (Math.PI - remainingAngle * 2) * RAG2DEG;
    skPath.addArc(
      rect(
        upperRadius - lowerRadius,
        upperRadius * 2 + distance,
        lowerRadius * 2,
        lowerRadius * 2,
      ),
      start2,
      end2,
    );

    return skPath;
  }, [lowerRadius, upperRadius, distance]);

  useAnimatedReaction(
    () => translate.value,
    (val) => {
      const outputValue = getOutputValue(val);
      onUpdate && onUpdate(outputValue);
    },
    [translate],
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      progress.value = withTiming(1);
      radius.value = withTiming(upperRadius);
      offset.value = translate.value;

      if (onStart !== undefined) {
        runOnJS(onStart)();
      }
    })
    .onUpdate((e) => {
      const to = offset.value + e.translationY;
      const finalSize = interpolate(
        to,
        [upperBound, lowerBound],
        [upperRadius, lowerRadius],
        Extrapolation.CLAMP,
      );

      translate.value = clamp(to, upperBound, lowerBound);
      size.value = lowerRadius + (finalSize - lowerRadius) * progress.value;
    })
    .onEnd(() => {
      radius.value = withTiming(lowerRadius);
      size.value = withTiming(lowerRadius * 2);
      progress.value = withTiming(0);

      const outputValue = getOutputValue(translate.value);
      if (onEnd !== undefined) {
        runOnJS(onEnd)(outputValue);
      }
    });

  const canvasStyle: ViewStyle = {
    width: upperRadius * 2,
    height: canvasHeight,
  };

  const indicatorStyles = useAnimatedStyle(() => {
    return {
      width: size.value * 2,
      height: size.value * 2,
      borderRadius: size.value,
      backgroundColor: color,
      position: "absolute",
      transform: [{ translateY: translate.value }],
    };
  }, [size, translate, color]);

  useImperativeHandle(ref, () => ({
    animateToValue: translateToValue,
  }));

  useEffect(() => {
    const width = getStrokeWidthByType("simple");
    if (width !== undefined) {
      translateToValue(width);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.center, canvasStyle]}>
      <Canvas style={canvasStyle} pointerEvents="none">
        <Path path={path} color={color} style={"fill"} opacity={0.5} />
      </Canvas>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={indicatorStyles} />
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

StrokeWidthSlider.displayName = "StrokeWidthSlider";

export default StrokeWidthSlider;
