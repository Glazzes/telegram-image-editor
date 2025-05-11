import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { randomUUID } from "expo-crypto";

import { useVector } from "@commons/hooks/useVector";
import { useStrokeWidthStore } from "@freehand-draw/store/useStrokeWidthStore";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import { useRecordStore } from "@commons/store/useRecordStore";
import { useShapeStore } from "@freehand-draw/store/useShapeStore";

import { getNormalizedAngle } from "@commons/utils/math";
import { INDICATOR_SIZE, MIN_SHAPE_RADIUS } from "@freehand-draw/constants";

import { Size, Vector } from "@commons/types";
import { SimpleStroke } from "@freehand-draw/types";

type CircleShapePreviewProps = {
  canvasSize: Size<number>;
};

const CircleShapePreview: React.FC<CircleShapePreviewProps> = ({
  canvasSize,
}) => {
  const resetShapeStore = useShapeStore((state) => state.resetShapeStore);
  const pushToRecord = useRecordStore((state) => state.pushToRecord);
  const { color, strokeWidth } = useStrokeWidthStore();
  const { addStroke, setActiveStrokeType } = useStrokeStore();

  const center: Vector<number> = {
    x: canvasSize.width / 2,
    y: canvasSize.height / 2,
  };

  const initialRadius = Math.min(canvasSize.width, canvasSize.height) / 4;

  const initialX = initialRadius * Math.cos(0);
  const initialY = initialRadius * Math.sin(0);

  const indicatorTranslate = useVector(initialX, initialY);
  const indicatorOffset = useVector(initialX, initialY);

  const shapeTranslate = useVector(0, 0);
  const shapeOffset = useVector(0, 0);

  const radius = useSharedValue<number>(initialRadius);
  const canTranslate = useSharedValue<boolean>(true);

  function saveShapeAsStroke() {
    const id = randomUUID();
    const newStroke: SimpleStroke = {
      type: "simple",
      id: id,
      color: color.value,
      path: path.value,
      strokeWidth: strokeWidth.value,
    };

    addStroke(newStroke);
    pushToRecord({ type: "stroke", id: id });
  }

  function unmountComponent() {
    setActiveStrokeType("simple");
    resetShapeStore();
  }

  const path = useDerivedValue(() => {
    const center = {
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
    };

    const p = Skia.Path.Make();
    p.addCircle(
      center.x + shapeTranslate.x.value,
      center.y + shapeTranslate.y.value,
      radius.value,
    );

    return p;
  }, [canvasSize, shapeTranslate, radius]);

  const shapePanGesture = Gesture.Pan()
    .onBegin((e) => {
      shapeOffset.x.value = shapeTranslate.x.value;
      shapeOffset.y.value = shapeTranslate.y.value;

      const shapeCenterX = center.x + shapeOffset.x.value;
      const shapeCenterY = center.y + shapeOffset.y.value;

      const centerDistance = Math.hypot(e.x - shapeCenterX, e.y - shapeCenterY);
      canTranslate.value = centerDistance <= radius.value;

      if (centerDistance <= radius.value) {
        indicatorTranslate.x.value = radius.value * Math.cos(0);
        indicatorTranslate.y.value = radius.value * Math.sin(0);
      } else {
        runOnJS(unmountComponent)();
      }
    })
    .onUpdate((e) => {
      if (!canTranslate.value) return;

      shapeTranslate.x.value = shapeOffset.x.value + e.translationX;
      shapeTranslate.y.value = shapeOffset.y.value + e.translationY;
    });

  const indicatorPanGesture = Gesture.Pan()
    .onBegin(() => {
      indicatorOffset.x.value = indicatorTranslate.x.value;
      indicatorOffset.y.value = indicatorTranslate.y.value;
    })
    .onUpdate((e) => {
      const toX = indicatorOffset.x.value + e.translationX;
      const toY = indicatorOffset.y.value + e.translationY;

      const currentAngle = getNormalizedAngle(toX, toY);
      const currentRadius = Math.max(MIN_SHAPE_RADIUS, Math.hypot(toX, toY));

      radius.value = currentRadius;
      indicatorTranslate.x.value = currentRadius * Math.cos(currentAngle);
      indicatorTranslate.y.value = currentRadius * Math.sin(currentAngle);
    });

  const shapeTapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e) => {
      const shapeCenterX = center.x + shapeTranslate.x.value;
      const shapeCenterY = center.y + shapeTranslate.y.value;

      const centerDistance = Math.hypot(e.x - shapeCenterX, e.y - shapeCenterY);
      const isInRadius = centerDistance <= radius.value;

      if (isInRadius) return;

      unmountComponent();
    });

  const indicatorStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: indicatorTranslate.x.value + shapeTranslate.x.value },
        { translateY: indicatorTranslate.y.value + shapeTranslate.y.value },
      ],
    };
  }, [indicatorTranslate, shapeTranslate]);

  const composedGesture = Gesture.Exclusive(shapePanGesture, shapeTapGesture);

  useEffect(() => {
    return () => saveShapeAsStroke();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[{ ...canvasSize }, styles.root]}>
      <GestureDetector gesture={composedGesture}>
        <Canvas style={{ ...canvasSize }}>
          <Path
            path={path}
            color={color}
            strokeWidth={strokeWidth}
            style={"stroke"}
          />
        </Canvas>
      </GestureDetector>

      <GestureDetector gesture={indicatorPanGesture}>
        <Animated.View style={[styles.indicator, indicatorStyles]} />
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

export default CircleShapePreview;
