import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  clamp,
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { randomUUID } from "expo-crypto";

import { useVector } from "@commons/hooks/useVector";
import { useRecordStore } from "@commons/store/useRecordStore";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import { useShapeStore } from "@freehand-draw/store/useShapeStore";
import { useStrokeWidthStore } from "@freehand-draw/store/useStrokeWidthStore";

import {
  getNormalizedAngle,
  getAngleBetweenVectors,
  quadraticBezierTangentAsAngle,
  rotate2D,
  quadraticBezier,
} from "@commons/utils/math";

import { Size, Vector } from "@commons/types";
import { ArrowShape } from "@freehand-draw/types";

type AnimatedVector = Vector<SharedValue<number>>;
type PanGestureEvent = GestureUpdateEvent<PanGestureHandlerEventPayload>;

const mapToCartesianCoords = (
  coord: Vector<number>,
  center: Vector<number>,
): Vector<number> => {
  "worklet";

  const x = coord.x - center.x;
  const y = coord.y - center.y;

  return { x, y };
};

const onStart = (vector: AnimatedVector, offset: AnimatedVector) => {
  "worklet";

  offset.x.value = vector.x.value;
  offset.y.value = vector.y.value;
};

const onUpdate = (
  vector: AnimatedVector,
  offset: AnimatedVector,
  event: PanGestureEvent,
) => {
  "worklet";

  vector.x.value = offset.x.value + event.translationX;
  vector.y.value = offset.y.value + event.translationY;
};

const HEAD_SIDE = 45;
const INDICATOR_SIZE = 16;
const HITSLOP = {
  vertical: 44 - INDICATOR_SIZE,
  horizontal: 44 - INDICATOR_SIZE,
};

type ArrowShapePreviewProps = {
  canvasSize: Size<number>;
};

const ArrowShapePreview = ({ canvasSize }: ArrowShapePreviewProps) => {
  const pushToRecord = useRecordStore((state) => state.push);
  const resetShapeStore = useShapeStore((state) => state.resetShapeStore);
  const { color, strokeWidth } = useStrokeWidthStore();
  const { add: addStroke, setActiveType: setActiveStrokeType } = useStrokeStore();

  const center: Vector<number> = {
    x: canvasSize.width / 2,
    y: canvasSize.height / 2,
  };

  const start = useVector(center.x, center.y - 75);
  const startOffset = useVector(center.x, center.y - 75);

  const head = useVector(center.x, center.y - 75 * 0.75);
  const headOffset = useVector(center.x, center.y - 75 * 0.75);
  const t = useSharedValue(0.25);

  const control = useVector(center.x, center.y);
  const controlOffset = useVector(center.x, center.y);

  const end = useVector(center.x, center.y + 75);
  const endOffset = useVector(center.x, center.y + 75);

  const canTranslate = useSharedValue<boolean>(false);

  const quadPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    path.moveTo(start.x.value, start.y.value);
    path.quadTo(control.x.value, control.y.value, end.x.value, end.y.value);

    return path;
  }, [start, control, end]);

  const arrowHeadPath = useDerivedValue(() => {
    const side = interpolate(
      t.value,
      [0, 0.25, 0.5],
      [HEAD_SIDE * 0.3, HEAD_SIDE, HEAD_SIDE * 3],
      Extrapolation.CLAMP,
    );

    const arrowHeight = Math.cos(Math.PI / 6) * side;
    const centerHeight = Math.tan(Math.PI / 6) * (side / 2);

    const path = Skia.Path.Make();
    const p0x = start.x.value - side / 2;
    const p0y = start.y.value + centerHeight;

    const p1x = start.x.value + side / 2;
    const p1y = start.y.value + centerHeight;

    const p2x = start.x.value;
    const p2y = start.y.value - (arrowHeight - centerHeight);

    const center = { x: start.x.value, y: start.y.value };
    const normP0 = mapToCartesianCoords({ x: p0x, y: p0y }, center);
    const normP1 = mapToCartesianCoords({ x: p1x, y: p1y }, center);
    const normP2 = mapToCartesianCoords({ x: p2x, y: p2y }, center);

    const angle = quadraticBezierTangentAsAngle(
      { x: start.x.value, y: start.y.value },
      { x: control.x.value, y: control.y.value },
      { x: end.x.value, y: end.y.value },
    );

    const currentAngle = angle - Math.PI / 2;

    const rP0 = rotate2D(normP0, currentAngle);
    const rP1 = rotate2D(normP1, currentAngle);
    const rP2 = rotate2D(normP2, currentAngle);

    const finalP0x = rP0.x + center.x;
    const finalP0y = rP0.y + center.y;
    const finalP1x = rP1.x + center.x;
    const finalP1y = rP1.y + center.y;
    const finalP2x = rP2.x + center.x;
    const finalP2y = rP2.y + center.y;

    path.moveTo(finalP0x, finalP0y);
    path.lineTo(finalP1x, finalP1y);
    path.lineTo(finalP2x, finalP2y);

    return path;
  }, [start, control, end, t]);

  const jointPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    path.moveTo(start.x.value, start.y.value);
    path.lineTo(control.x.value, control.y.value);
    path.lineTo(end.x.value, end.y.value);

    return path;
  }, [start, control, end]);

  function saveShapeAsStroke() {
    const id = randomUUID();
    const newStroke: ArrowShape = {
      type: "arrow-shape",
      id: id,
      color: color.value,
      path: quadPath.value,
      headPath: arrowHeadPath.value,
      strokeWidth: strokeWidth.value,
    };

    addStroke(newStroke);
    pushToRecord({ type: "stroke", id: id });
  }

  function updateHeadIndicatorPosition() {
    "worklet";

    const distanceStartControl = mapToCartesianCoords(
      { x: control.x.value, y: control.y.value },
      { x: start.x.value, y: start.y.value },
    );

    const distX = distanceStartControl.x * t.value;
    const distY = distanceStartControl.y * t.value;

    head.x.value = start.x.value + distX;
    head.y.value = start.y.value + distY;
  }

  function unmountComponent() {
    setActiveStrokeType("simple");
    resetShapeStore();
  }

  const canvasPan = Gesture.Pan()
    .onBegin((e) => {
      startOffset.x.value = start.x.value;
      startOffset.y.value = start.y.value;

      headOffset.x.value = head.x.value;
      headOffset.y.value = head.y.value;

      controlOffset.x.value = control.x.value;
      controlOffset.y.value = control.y.value;

      endOffset.x.value = end.x.value;
      endOffset.y.value = end.y.value;

      const startX = start.x.value - control.x.value;
      const startY = -1 * (start.y.value - control.y.value);

      const endX = end.x.value - control.x.value;
      const endY = -1 * (end.y.value - control.y.value);

      const pointerX = e.x - control.x.value;
      const pointerY = -1 * (e.y - control.y.value);

      const angle1 = getNormalizedAngle(startX, startY);
      const angle2 = getNormalizedAngle(endX, endY);

      const currentAngle = getNormalizedAngle(pointerX, pointerY);
      const minAngle = Math.min(angle1, angle2);
      const maxAngle = Math.max(angle1, angle2);

      let inValidRange = false;
      if (maxAngle - minAngle > Math.PI) {
        const inLowerRange =
          currentAngle >= maxAngle && currentAngle <= 2 * Math.PI;
        const inUpperRange = currentAngle >= 0 && currentAngle <= minAngle;
        inValidRange = inLowerRange || inUpperRange;
      } else {
        inValidRange = currentAngle >= minAngle && currentAngle <= maxAngle;
      }

      if (!inValidRange) {
        runOnJS(unmountComponent)();
        return;
      }

      const startEndAngle = getAngleBetweenVectors(
        { x: startX, y: startY },
        { x: endX, y: endY },
      );

      const startPointerAngle = getAngleBetweenVectors(
        { x: startX, y: startY },
        { x: pointerX, y: pointerY },
      );

      const t = startPointerAngle / startEndAngle;
      const curvePoint = quadraticBezier(
        { x: start.x.value, y: start.y.value },
        { x: control.x.value, y: control.y.value },
        { x: end.x.value, y: end.y.value },
        t,
      );

      const curveX = curvePoint.x - control.x.value;
      const curveY = -1 * (curvePoint.y - control.y.value);

      const curvePointLength = Math.hypot(curveX, curveY);
      const pointerLength = Math.hypot(pointerX, pointerY);

      const isInCurveArea = pointerLength <= curvePointLength;
      canTranslate.value = isInCurveArea;

      if (!isInCurveArea) {
        runOnJS(unmountComponent)();
      }
    })
    .onUpdate((e) => {
      if (!canTranslate.value) return;

      start.x.value = startOffset.x.value + e.translationX;
      start.y.value = startOffset.y.value + e.translationY;

      head.x.value = headOffset.x.value + e.translationX;
      head.y.value = headOffset.y.value + e.translationY;

      control.x.value = controlOffset.x.value + e.translationX;
      control.y.value = controlOffset.y.value + e.translationY;

      end.x.value = endOffset.x.value + e.translationX;
      end.y.value = endOffset.y.value + e.translationY;
    })
    .onEnd(() => {
      canTranslate.value = false;
    });

  const startPan = Gesture.Pan()
    .hitSlop(HITSLOP)
    .onStart(() => onStart(start, startOffset))
    .onUpdate((e) => {
      onUpdate(start, startOffset, e);
      updateHeadIndicatorPosition();
    });

  /*
   * SDF of a line segment, for more context see https://www.youtube.com/watch?v=PMltMdi1Wzg
   */
  const headPan = Gesture.Pan()
    .onStart(() => onStart(head, headOffset))
    .onUpdate((e) => {
      const x = headOffset.x.value + e.translationX;
      const y = headOffset.y.value + e.translationY;

      const distanceStartControl = mapToCartesianCoords(
        { x: control.x.value, y: control.y.value },
        { x: start.x.value, y: start.y.value },
      );

      const distanceStartPointer = mapToCartesianCoords(
        { x, y },
        { x: start.x.value, y: start.y.value },
      );

      const dot =
        distanceStartControl.x * distanceStartPointer.x +
        distanceStartControl.y * distanceStartPointer.y;

      const startControlLength = Math.hypot(
        distanceStartControl.x,
        distanceStartControl.y,
      );

      const ratio = clamp(dot / startControlLength ** 2, 0, 0.5);

      const distX = distanceStartControl.x * ratio;
      const distY = distanceStartControl.y * ratio;

      head.x.value = start.x.value + distX;
      head.y.value = start.y.value + distY;
      t.value = ratio;
    });

  const controlPointPan = Gesture.Pan()
    .hitSlop(HITSLOP)
    .onStart(() => onStart(control, controlOffset))
    .onUpdate((e) => {
      onUpdate(control, controlOffset, e);
      updateHeadIndicatorPosition();
    });

  const endPan = Gesture.Pan()
    .hitSlop(HITSLOP)
    .onStart(() => onStart(end, endOffset))
    .onUpdate((e) => onUpdate(end, endOffset, e));

  const startStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: "lime",
      transform: [{ translateX: start.x.value }, { translateY: start.y.value }],
    };
  }, [start]);

  const headStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: head.x.value }, { translateY: head.y.value }],
    };
  }, [head]);

  const controlStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: control.x.value },
        { translateY: control.y.value },
      ],
    };
  }, [control]);

  const endStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: end.x.value }, { translateY: end.y.value }],
    };
  }, [end]);

  useEffect(() => {
    return () => saveShapeAsStroke();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ ...canvasSize, position: "absolute" }}>
      <GestureDetector gesture={canvasPan}>
        <Canvas style={{ ...canvasSize }}>
          <Path path={arrowHeadPath} color={color} />

          <Path
            path={quadPath}
            color={color}
            strokeWidth={strokeWidth}
            strokeCap={"round"}
            style={"stroke"}
          />

          <Path
            path={jointPath}
            color={"#fff"}
            strokeWidth={2}
            style={"stroke"}
          />
        </Canvas>
      </GestureDetector>

      <GestureDetector gesture={startPan}>
        <Animated.View style={[styles.indicator, startStyles]} />
      </GestureDetector>

      <GestureDetector gesture={headPan}>
        <Animated.View style={[styles.indicator, headStyles]} />
      </GestureDetector>

      <GestureDetector gesture={controlPointPan}>
        <Animated.View style={[styles.indicator, controlStyles]} />
      </GestureDetector>

      <GestureDetector gesture={endPan}>
        <Animated.View style={[styles.indicator, endStyles]} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  indicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: "#3366ff",
    borderColor: "#fff",
    borderWidth: 2,
    position: "absolute",
    top: -1 * (INDICATOR_SIZE / 2),
    left: -1 * (INDICATOR_SIZE / 2),
  },
});

export default ArrowShapePreview;
