import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Canvas,
  CornerPathEffect,
  Path,
  Skia,
} from "@shopify/react-native-skia";
import { useShallow } from "zustand/react/shallow";

import { randomUUID } from "@commons/utils/uuid";
import { useVector } from "@commons/hooks/useVector";
import { useStrokeWidthStore } from "@freehand-draw/store/useStrokeWidthStore";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import { useRecordStore } from "@commons/store/useRecordStore";
import { useShapeStore } from "@freehand-draw/store/useShapeStore";

import { rotate2D } from "@commons/utils/math";
import { INDICATOR_SIZE, MIN_SHAPE_RADIUS, CORNER_PATH } from "../../constants";

import { StarShape } from "@freehand-draw/types";
import { Size, Vector } from "@commons/types";

type StarShapePreviewProps = {
  canvasSize: Size<number>;
};

const ANGLE_STEP = (2 * Math.PI) / 5;
const ANGLE_OFFSET = ANGLE_STEP / 2;

const HALF_PI = Math.PI / 2;
const TAU = 2 * Math.PI;

const getPolarPoint = (
  center: Vector<number>,
  radius: number,
  positionAngle: number,
  rotationAngle: number,
): Vector<number> => {
  "worklet";

  const x = radius * Math.cos(positionAngle);
  const y = -1 * (radius * Math.sin(positionAngle));

  const rotated = rotate2D({ x, y }, rotationAngle);

  return {
    x: center.x + rotated.x,
    y: center.y + rotated.y,
  };
};

const getNormalizedAngle = (x: number, y: number): number => {
  "worklet";
  const angle = Math.atan2(y, x);
  return (angle + TAU) % TAU;
};

const StarShapePreview: React.FC<StarShapePreviewProps> = ({ canvasSize }) => {
  const pushToRecord = useRecordStore((state) => state.add);
  const resetShapeStore = useShapeStore((state) => state.resetShapeStore);
  const { color, strokeWidth } = useStrokeWidthStore();

  const strokeStore = useStrokeStore(
    useShallow((state) => ({
      add: state.add,
      setActiveType: state.setActiveType,
    })),
  );

  const center: Vector<number> = {
    x: canvasSize.width / 2,
    y: canvasSize.height / 2,
  };

  const initialRadius = Math.min(canvasSize.width, canvasSize.height) / 4;
  const initialX =
    (initialRadius - INDICATOR_SIZE / 2) * Math.cos(HALF_PI + ANGLE_STEP * 4);
  const initialY =
    -1 *
    ((initialRadius - INDICATOR_SIZE / 2) * Math.sin(HALF_PI + ANGLE_STEP * 4));

  const starTranslate = useVector(0, 0);
  const starOffset = useVector(0, 0);
  const canTranslate = useSharedValue<boolean>(true);

  const indicatorTranslate = useVector(initialX, initialY);
  const indicatorOffset = useVector(initialX, initialY);
  const angle = useSharedValue<number>(0);
  const radius = useSharedValue<number>(initialRadius);

  const isFirst = useSharedValue<boolean>(true);
  const angleOffset = useSharedValue<number>(0);

  function saveShapeAsStroke() {
    const id = randomUUID();
    const stroke: StarShape = {
      type: "star-shape",
      id: id,
      path: path.value,
      cornerPath: CORNER_PATH,
      strokeWidth: strokeWidth.value,
      color: color.value,
    };

    strokeStore.add(stroke);
    pushToRecord({ type: "stroke", id: id });
  }

  // Upon calling it will cause this component to unmoment turning it into a stroke
  function unmountComponent() {
    strokeStore.setActiveType("simple");
    resetShapeStore();
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: indicatorTranslate.x.value + starTranslate.x.value },
        { translateY: indicatorTranslate.y.value + starTranslate.y.value },
      ],
    };
  }, [indicatorTranslate, starTranslate]);

  const path = useDerivedValue(() => {
    const startAngle = HALF_PI;

    const starCenter = {
      x: canvasSize.width / 2 + starTranslate.x.value,
      y: canvasSize.height / 2 + starTranslate.y.value,
    };

    const p1 = getPolarPoint(starCenter, radius.value, startAngle, angle.value);
    const p2 = getPolarPoint(
      starCenter,
      radius.value,
      startAngle + ANGLE_STEP,
      angle.value,
    );
    const p3 = getPolarPoint(
      starCenter,
      radius.value,
      startAngle + ANGLE_STEP * 2,
      angle.value,
    );
    const p4 = getPolarPoint(
      starCenter,
      radius.value,
      startAngle + ANGLE_STEP * 3,
      angle.value,
    );
    const p5 = getPolarPoint(
      starCenter,
      radius.value,
      startAngle + ANGLE_STEP * 4,
      angle.value,
    );

    const halfRadius = radius.value / 2;
    const cStartAngle = startAngle + ANGLE_OFFSET;
    const c1 = getPolarPoint(starCenter, halfRadius, cStartAngle, angle.value);
    const c2 = getPolarPoint(
      starCenter,
      halfRadius,
      cStartAngle + ANGLE_STEP,
      angle.value,
    );
    const c3 = getPolarPoint(
      starCenter,
      halfRadius,
      cStartAngle + ANGLE_STEP * 2,
      angle.value,
    );
    const c4 = getPolarPoint(
      starCenter,
      halfRadius,
      cStartAngle + ANGLE_STEP * 3,
      angle.value,
    );
    const c5 = getPolarPoint(
      starCenter,
      halfRadius,
      cStartAngle + ANGLE_STEP * 4,
      angle.value,
    );

    const startPath = Skia.Path.Make();

    startPath.moveTo(p1.x, p1.y);
    startPath.lineTo(c1.x, c1.y);
    startPath.lineTo(p2.x, p2.y);
    startPath.lineTo(c2.x, c2.y);
    startPath.lineTo(p3.x, p3.y);
    startPath.lineTo(c3.x, c3.y);
    startPath.lineTo(p4.x, p4.y);
    startPath.lineTo(c4.x, c4.y);
    startPath.lineTo(p5.x, p5.y);
    startPath.lineTo(c5.x, c5.y);
    startPath.close();

    return startPath;
  }, [canvasSize, starTranslate, radius, angle]);

  const starPanGesture = Gesture.Pan()
    .onBegin((e) => {
      starOffset.x.value = starTranslate.x.value;
      starOffset.y.value = starTranslate.y.value;

      const starCenterX = center.x + starOffset.x.value;
      const starCenterY = center.y + starOffset.y.value;

      const centerDistance = Math.hypot(e.x - starCenterX, e.y - starCenterY);
      canTranslate.value = centerDistance <= radius.value;

      const isNotInRadius = !(centerDistance <= radius.value);
      if (isNotInRadius) {
        runOnJS(unmountComponent)();
      }
    })
    .onUpdate((e) => {
      if (!canTranslate.value) return;

      starTranslate.x.value = starOffset.x.value + e.translationX;
      starTranslate.y.value = starOffset.y.value + e.translationY;
    });

  const indicatorPanGesture = Gesture.Pan()
    .hitSlop({ vertical: 44 - INDICATOR_SIZE, horizontal: 44 - INDICATOR_SIZE })
    .onBegin(() => {
      indicatorOffset.x.value = indicatorTranslate.x.value;
      indicatorOffset.y.value = indicatorTranslate.y.value;

      if (isFirst.value) {
        angleOffset.value = getNormalizedAngle(
          indicatorOffset.x.value,
          indicatorOffset.y.value,
        );
        isFirst.value = false;
      }
    })
    .onUpdate((e) => {
      const toX = indicatorOffset.x.value + e.translationX;
      const toY = indicatorOffset.y.value + e.translationY;

      const currentAngle = getNormalizedAngle(toX, toY);
      const currentRadius = Math.max(MIN_SHAPE_RADIUS, Math.hypot(toX, toY));

      indicatorTranslate.x.value =
        (currentRadius - INDICATOR_SIZE / 2) * Math.cos(currentAngle);
      indicatorTranslate.y.value =
        (currentRadius - INDICATOR_SIZE / 2) * Math.sin(currentAngle);
      radius.value = currentRadius;
      angle.value = currentAngle - angleOffset.value;
    });

  useEffect(() => {
    return () => saveShapeAsStroke();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[{ ...canvasSize }, styles.root]}>
      <GestureDetector gesture={starPanGesture}>
        <Canvas style={{ ...canvasSize }}>
          <Path
            path={path}
            color={color}
            strokeWidth={strokeWidth}
            strokeJoin={"round"}
            strokeCap={"round"}
            style={"stroke"}
          >
            <CornerPathEffect r={CORNER_PATH} />
          </Path>
        </Canvas>
      </GestureDetector>

      <GestureDetector gesture={indicatorPanGesture}>
        <Animated.View style={[styles.indicator, animatedStyle]} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: INDICATOR_SIZE + 2,
    height: INDICATOR_SIZE + 2,
    backgroundColor: "#3366ff",
    borderRadius: "50%",
    borderWidth: 2,
    borderColor: "#fff",
    position: "absolute",
  },
});

export default StarShapePreview;
