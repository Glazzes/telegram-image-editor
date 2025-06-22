import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
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

import { useVector } from "@commons/hooks/useVector";
import {
  dotProduct,
  normalizeAngle,
  normalizeVector,
  rotate2D,
} from "@commons/utils/math";
import { Size, Vector } from "@commons/types";
import { INDICATOR_SIZE } from "@freehand-draw/constants";
import { useShallow } from "zustand/react/shallow";
import { useStrokeWidthStore } from "@freehand-draw/store/useStrokeWidthStore";

type RectangleShapePreviewProps = {
  canvasSize: Size<number>;
};

type RectangleUpdateOptions = {
  current: Vector<SharedValue<number>>;
  currentOffset: Vector<SharedValue<number>>;
  anchor: Vector<SharedValue<number>>;
  vertical: Vector<SharedValue<number>>;
  horizontal: Vector<SharedValue<number>>;
  event: { translationX: number; translationY: number };
};

function rotateVectorAroundCenter(
  vector: Vector<number>,
  center: Vector<number>,
  angle: number,
): Vector<number> {
  "worklet";

  const x = vector.x - center.x;
  const y = -1 * (vector.y - center.y);
  const rotated = rotate2D({ x, y }, angle);

  return { x: center.x + rotated.x, y: center.y - rotated.y };
}

const RectangleShapePreview = ({ canvasSize }: RectangleShapePreviewProps) => {
  const stroke = useStrokeWidthStore(
    useShallow((state) => ({
      color: state.color,
      width: state.strokeWidth,
    })),
  );

  const initialSize = Math.min(canvasSize.width, canvasSize.height) * 0.6;

  const left = canvasSize.width / 2 - initialSize / 2;
  const right = canvasSize.width / 2 + initialSize / 2;
  const top = canvasSize.height / 2 - initialSize / 2;
  const bottom = canvasSize.height / 2 + initialSize / 2;

  const topLeft = useVector(left, top);
  const topLeftOffset = useVector(left, top);
  const topRight = useVector(right, top);
  const topRightOffset = useVector(right, top);
  const bottomLeft = useVector(left, bottom);
  const bottomLeftOffset = useVector(left, bottom);
  const bottomRight = useVector(right, bottom);
  const bottomRightOffset = useVector(right, bottom);

  const angle = useSharedValue<number>(0);
  const angleOffset = useSharedValue<number>(0);

  const center = useVector(0, 0);
  const indicator = useVector(right, (top + bottom) / 2);

  const verticalDirection = useSharedValue<Vector<number>>({ x: 0, y: 0 });
  const horizontalDirection = useSharedValue<Vector<number>>({ x: 0, y: 0 });

  const canTranslate = useSharedValue<boolean>(false);

  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    p.moveTo(topLeft.x.value, topLeft.y.value);
    p.lineTo(topRight.x.value, topRight.y.value);
    p.lineTo(bottomRight.x.value, bottomRight.y.value);
    p.lineTo(bottomLeft.x.value, bottomLeft.y.value);
    p.close();

    return p;
  }, [topLeft, topRight, bottomLeft, bottomRight, canvasSize]);

  function onStart() {
    "worklet";

    topLeftOffset.x.value = topLeft.x.value;
    topLeftOffset.y.value = topLeft.y.value;
    topRightOffset.x.value = topRight.x.value;
    topRightOffset.y.value = topRight.y.value;
    bottomLeftOffset.x.value = bottomLeft.x.value;
    bottomLeftOffset.y.value = bottomLeft.y.value;
    bottomRightOffset.x.value = bottomRight.x.value;
    bottomRightOffset.y.value = bottomRight.y.value;

    angleOffset.value = angle.value;

    center.x.value = (topRight.x.value + bottomLeft.x.value) / 2;
    center.y.value = (topRight.y.value + bottomLeft.y.value) / 2;

    indicator.x.value = (topRight.x.value + bottomRight.x.value) / 2;
    indicator.y.value = (topRight.y.value + bottomRight.y.value) / 2;
  }

  // Gets and sets the unit vector from anchor to vertical and horizontal vectors
  function onIndicatorStartSetDirections(
    vertical: Vector<number>,
    horizontal: Vector<number>,
    anchor: Vector<number>,
  ) {
    "worklet";

    verticalDirection.value = normalizeVector({
      x: vertical.x - anchor.x,
      y: -1 * (vertical.y - anchor.y),
    });

    horizontalDirection.value = normalizeVector({
      x: horizontal.x - anchor.x,
      y: -1 * (horizontal.y - anchor.y),
    });
  }

  function onIndicatorUpdate(options: RectangleUpdateOptions) {
    "worklet";

    const { current, currentOffset, anchor, vertical, horizontal, event } =
      options;

    current.x.value = currentOffset.x.value + event.translationX;
    current.y.value = currentOffset.y.value + event.translationY;

    // Dot product calculations
    const pointDiagonalX = current.x.value - anchor.x.value;
    const pointDiagonalY = -1 * (current.y.value - anchor.y.value);

    const vecticalProjection = dotProduct(
      { x: verticalDirection.value.x, y: verticalDirection.value.y },
      { x: pointDiagonalX, y: pointDiagonalY },
    );

    if (Math.sign(vecticalProjection) === -1) {
      const rotatedDirection = rotate2D(verticalDirection.value, Math.PI);
      anchor.x.value += Math.abs(vecticalProjection) * rotatedDirection.x;
      anchor.y.value -= Math.abs(vecticalProjection) * rotatedDirection.y;
    }

    const horizontalProjection = dotProduct(
      { x: horizontalDirection.value.x, y: horizontalDirection.value.y },
      { x: pointDiagonalX, y: pointDiagonalY },
    );

    if (Math.sign(horizontalProjection) === -1) {
      const rotatedDirection = rotate2D(horizontalDirection.value, Math.PI);
      anchor.x.value += Math.abs(horizontalProjection) * rotatedDirection.x;
      anchor.y.value -= Math.abs(horizontalProjection) * rotatedDirection.y;
    }

    // Calculate parallel and perpendicular points distance
    const distanceX = current.x.value - anchor.x.value;
    const distanceY = -1 * (current.y.value - anchor.y.value);
    const rotatedDiagonal = rotate2D(
      { x: distanceX, y: distanceY },
      -1 * angle.value,
    );

    const br = rotate2D({ x: rotatedDiagonal.x, y: 0 }, angle.value);
    const tl = rotate2D({ x: 0, y: rotatedDiagonal.y }, angle.value);

    vertical.x.value = anchor.x.value + tl.x;
    vertical.y.value = anchor.y.value - tl.y;
    horizontal.x.value = anchor.x.value + br.x;
    horizontal.y.value = anchor.y.value - br.y;
  }

  const canvasPan = Gesture.Pan()
    .onStart((e) => {
      onStart();

      const topLeftTopRight: Vector<number> = {
        x: topRight.x.value - topLeft.x.value,
        y: topRight.y.value - topLeft.y.value,
      };

      const topLeftBottomLeft: Vector<number> = {
        x: bottomLeft.x.value - topLeft.x.value,
        y: bottomLeft.y.value - topLeft.y.value,
      };

      const point: Vector<number> = {
        x: e.x - topLeft.x.value,
        y: e.y - topLeft.y.value,
      };

      const lenght1 = dotProduct(topLeftTopRight, topLeftTopRight);
      const lenght2 = dotProduct(topLeftBottomLeft, topLeftBottomLeft);

      const dot1 = dotProduct(point, topLeftTopRight) / lenght1;
      const dot2 = dotProduct(point, topLeftBottomLeft) / lenght2;

      const isWithinBounds = dot1 >= 0 && dot1 <= 1 && dot2 >= 0 && dot2 <= 1;
      canTranslate.value = isWithinBounds;

      if (!isWithinBounds) {
      }
    })
    .onUpdate((e) => {
      if (!canTranslate.value) return;

      topLeft.x.value = topLeftOffset.x.value + e.translationX;
      topLeft.y.value = topLeftOffset.y.value + e.translationY;
      topRight.x.value = topRightOffset.x.value + e.translationX;
      topRight.y.value = topRightOffset.y.value + e.translationY;
      bottomLeft.x.value = bottomLeftOffset.x.value + e.translationX;
      bottomLeft.y.value = bottomLeftOffset.y.value + e.translationY;
      bottomRight.x.value = bottomRightOffset.x.value + e.translationX;
      bottomRight.y.value = bottomRightOffset.y.value + e.translationY;
    });

  const indicatorPan = Gesture.Pan()
    .onStart(onStart)
    .onUpdate((e) => {
      const toX = indicator.x.value + e.translationX;
      const toY = indicator.y.value + e.translationY;

      const opposite = -1 * (toY - center.y.value);
      const adjacent = toX - center.x.value;

      const normalized = normalizeAngle(Math.atan2(opposite, adjacent));
      const actualAngle = normalized - angleOffset.value;

      const rotatedTopLeft = rotateVectorAroundCenter(
        { x: topLeftOffset.x.value, y: topLeftOffset.y.value },
        { x: center.x.value, y: center.y.value },
        actualAngle,
      );

      const rotatedTopRight = rotateVectorAroundCenter(
        { x: topRightOffset.x.value, y: topRightOffset.y.value },
        { x: center.x.value, y: center.y.value },
        actualAngle,
      );

      const rotatedBottomLeft = rotateVectorAroundCenter(
        { x: bottomLeftOffset.x.value, y: bottomLeftOffset.y.value },
        { x: center.x.value, y: center.y.value },
        actualAngle,
      );

      const rotatedBottomRight = rotateVectorAroundCenter(
        { x: bottomRightOffset.x.value, y: bottomRightOffset.y.value },
        { x: center.x.value, y: center.y.value },
        actualAngle,
      );

      angle.value = normalized;
      topLeft.x.value = rotatedTopLeft.x;
      topLeft.y.value = rotatedTopLeft.y;
      topRight.x.value = rotatedTopRight.x;
      topRight.y.value = rotatedTopRight.y;
      bottomLeft.x.value = rotatedBottomLeft.x;
      bottomLeft.y.value = rotatedBottomLeft.y;
      bottomRight.x.value = rotatedBottomRight.x;
      bottomRight.y.value = rotatedBottomRight.y;
    });

  /*
   * Each of the following indicator pan gestures follow the same behaviour:
   *
   * When Panning a Point This Is the Logic:
   * 1. Get the distance between the point the user is panning and it's respective diagonal, for
   * instance: top left's diagonal is bottom right.
   * 2. The distance between the previous points it's not rotated, therefore it does match the
   * current coordinate system of the all other points, by rotating by the inverse of the angle we get
   * the distance in the current coordinate system we're working with.
   * 3. Given the values x and y of the previous distance (now transformed), we can feed them as a couple
   *  of basis vectors to the rotate2D function in order to get the current offset in the coordinate
   *  space the rest of the points are at.
   */

  const topLeftPan = Gesture.Pan()
    .maxPointers(1)
    .hitSlop({ vertical: 20, horizontal: 20 })
    .onStart(() => {
      onStart();
      onIndicatorStartSetDirections(
        { x: topRight.x.value, y: topRight.y.value },
        { x: bottomLeft.x.value, y: bottomLeft.y.value },
        { x: bottomRight.x.value, y: bottomRight.y.value },
      );
    })
    .onUpdate((e) =>
      onIndicatorUpdate({
        current: topLeft,
        currentOffset: topLeftOffset,
        anchor: bottomRight,
        vertical: topRight,
        horizontal: bottomLeft,
        event: e,
      }),
    );

  const topRightPan = Gesture.Pan()
    .maxPointers(1)
    .hitSlop({ vertical: 20, horizontal: 20 })
    .onStart(() => {
      onStart();
      onIndicatorStartSetDirections(
        { x: topLeft.x.value, y: topLeft.y.value },
        { x: bottomRight.x.value, y: bottomRight.y.value },
        { x: bottomLeft.x.value, y: bottomLeft.y.value },
      );
    })
    .onUpdate((e) =>
      onIndicatorUpdate({
        current: topRight,
        currentOffset: topRightOffset,
        anchor: bottomLeft,
        vertical: topLeft,
        horizontal: bottomRight,
        event: e,
      }),
    );

  const bottomLeftPan = Gesture.Pan()
    .maxPointers(1)
    .hitSlop({ vertical: 20, horizontal: 20 })
    .onStart(() => {
      onStart();
      onIndicatorStartSetDirections(
        { x: bottomRight.x.value, y: bottomRight.y.value },
        { x: topLeft.x.value, y: topLeft.y.value },
        { x: topRight.x.value, y: topRight.y.value },
      );
    })
    .onUpdate((e) =>
      onIndicatorUpdate({
        current: bottomLeft,
        currentOffset: bottomLeftOffset,
        anchor: topRight,
        vertical: bottomRight,
        horizontal: topLeft,
        event: e,
      }),
    );

  const bottomRightPan = Gesture.Pan()
    .maxPointers(1)
    .hitSlop({ vertical: 20, horizontal: 20 })
    .onStart(() => {
      onStart();
      onIndicatorStartSetDirections(
        { x: bottomLeft.x.value, y: bottomLeft.y.value },
        { x: topRight.x.value, y: topRight.y.value },
        { x: topLeft.x.value, y: topLeft.y.value },
      );
    })
    .onUpdate((e) =>
      onIndicatorUpdate({
        current: bottomRight,
        currentOffset: bottomRightOffset,
        anchor: topLeft,
        vertical: bottomLeft,
        horizontal: topRight,
        event: e,
      }),
    );

  const indicatorStyles = useAnimatedStyle(() => {
    const x = (topRight.x.value + bottomRight.x.value) / 2;
    const y = (topRight.y.value + bottomRight.y.value) / 2;

    return {
      backgroundColor: "lime",
      transform: [
        { translateX: x - INDICATOR_SIZE / 2 },
        { translateY: y - INDICATOR_SIZE / 2 },
      ],
    };
  }, [topRight, bottomRight]);

  const topLeftStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: topLeft.x.value - INDICATOR_SIZE / 2 },
        { translateY: topLeft.y.value - INDICATOR_SIZE / 2 },
      ],
    };
  }, [topLeft]);

  const topRightStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: topRight.x.value - INDICATOR_SIZE / 2 },
        { translateY: topRight.y.value - INDICATOR_SIZE / 2 },
      ],
    };
  }, [topRight]);

  const bottomLeftStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: bottomLeft.x.value - INDICATOR_SIZE / 2 },
        { translateY: bottomLeft.y.value - INDICATOR_SIZE / 2 },
      ],
    };
  }, [bottomLeft]);

  const bottomRightStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: bottomRight.x.value - INDICATOR_SIZE / 2 },
        { translateY: bottomRight.y.value - INDICATOR_SIZE / 2 },
      ],
    };
  }, [bottomRight]);

  return (
    <View style={[styles.root, { ...canvasSize }]}>
      <GestureDetector gesture={canvasPan}>
        <Canvas style={{ ...canvasSize }}>
          <Path
            path={path}
            strokeWidth={stroke.width}
            style={"stroke"}
            color={stroke.color}
          >
            <CornerPathEffect r={8} />
          </Path>
        </Canvas>
      </GestureDetector>

      <GestureDetector gesture={topLeftPan}>
        <Animated.View style={[styles.indicator, topLeftStyles]} />
      </GestureDetector>

      <GestureDetector gesture={topRightPan}>
        <Animated.View style={[styles.indicator, topRightStyles]} />
      </GestureDetector>

      <GestureDetector gesture={bottomLeftPan}>
        <Animated.View style={[styles.indicator, bottomLeftStyles]} />
      </GestureDetector>

      <GestureDetector gesture={bottomRightPan}>
        <Animated.View style={[styles.indicator, bottomRightStyles]} />
      </GestureDetector>

      <GestureDetector gesture={indicatorPan}>
        <Animated.View style={[styles.indicator, indicatorStyles]} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: "absolute",
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

export default RectangleShapePreview;
