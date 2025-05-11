import React, { useEffect } from "react";
import Animated, {
  runOnJS,
  useAnimatedRef,
  useSharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { View, StyleSheet } from "react-native";
import {
  Canvas,
  Image,
  Skia,
  SkImage,
  SkPath,
  useCanvasRef,
} from "@shopify/react-native-skia";

import { useRecordStore } from "@commons/store/useRecordStore";
import { Size, Vector } from "@commons/types";

import { useStrokeWidthStore } from "@freehand-draw/store/useStrokeWidthStore";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import { useShapeStore } from "@freehand-draw/store/useShapeStore";
import { createNewStroke, getArrowHead } from "@freehand-draw/utils/stroke";
import StrokeList from "@freehand-draw/components/StrokeList";
import StrokePreview from "@freehand-draw/components/previews/StrokePreview";
import ThicknessContainer from "@freehand-draw/components/stroke-width-slider/ThicknessContainer";
import CircleShapePreview from "@freehand-draw/components/previews/CircleShapePreview";
import StarShapePreview from "@freehand-draw/components/previews/StarShapePreview";
import ArrowShapePreview from "@freehand-draw/components/previews/ArrowShapePreview";
import {
  emitCanvasSnapshotEvent,
  listenToOpenSheetEvent,
} from "@color-picker/utils/emitter";

type DrawingLayerProps = {
  baseLayer: SkImage;
  canvasSize: Size<number>;
  containerSize: Size<number>;
};

const getMiddlePoint = (
  p1: Vector<number>,
  p2: Vector<number>,
): Vector<number> => {
  "worklet";

  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
};

const DrawingLayer: React.FC<DrawingLayerProps> = ({
  baseLayer,
  canvasSize,
  containerSize,
}) => {
  const canvasRef = useCanvasRef();
  const canvasContainerRef = useAnimatedRef();

  const { activeStrokeType, strokes, addStroke } = useStrokeStore();
  const { color, strokeWidth, doubleStrokeWidth } = useStrokeWidthStore();

  const shapes = useShapeStore((state) => state.shapeTypes);
  const pushToRecord = useRecordStore((state) => state.pushToRecord);

  const path = useSharedValue<SkPath>(Skia.Path.Make());
  const snapshot = useSharedValue<SkImage>(baseLayer);
  const lastPoint = useSharedValue<Vector<number>>({ x: 0, y: 0 });

  function takeCanvasSnapshot() {
    let nextSnapshot: SkImage | undefined = baseLayer;
    if (strokes.length !== 0) {
      const currentSnapshot = canvasRef.current?.makeImageSnapshot();
      nextSnapshot = currentSnapshot ?? baseLayer;
    }

    snapshot.value = nextSnapshot;
  }

  function onStrokeEnd() {
    const pathCopy = path.value.copy();
    path.value.reset();
    path.modify((prev) => {
      "worklet";
      return prev;
    });

    const newStroke = createNewStroke({
      type: activeStrokeType,
      path: pathCopy,
      color: color.value,
      strokeWidth: strokeWidth.value,
      baseLayer: baseLayer,
      currentSnapshot: snapshot.value,
    });

    // If the eraser is the very first stroke, do not append it.
    if (strokes.length === 0 && activeStrokeType === "eraser") return;

    addStroke(newStroke);
    pushToRecord({ type: "stroke", id: newStroke.id });
  }

  //  Used lazy brush demo as reference for line smoothing
  //  https://github.com/dulnan/lazy-brush-demo/blob/master/src/classes/Scene.js
  const pan = Gesture.Pan()
    .onBegin((e) => {
      path.value.moveTo(e.x, e.y);
      lastPoint.value = { x: e.x, y: e.y };
    })
    .onUpdate((e) => {
      const current: Vector<number> = { x: e.x, y: e.y };

      const mid = getMiddlePoint(lastPoint.value, current);
      path.value.quadTo(lastPoint.value.x, lastPoint.value.y, mid.x, mid.y);

      path.modify((prev) => {
        "worklet";
        return prev;
      });

      lastPoint.value = { x: e.x, y: e.y };
    })
    .onEnd(() => {
      if (activeStrokeType === "arrow") {
        const pointCount = path.value.countPoints();
        const last = path.value.getPoint(pointCount - 1);
        const beforeLast = path.value.getPoint(pointCount - 3);

        const arrowHead = getArrowHead(last, beforeLast);
        path.value.lineTo(arrowHead[0].x, arrowHead[0].y);
        path.value.moveTo(last.x, last.y);
        path.value.lineTo(arrowHead[1].x, arrowHead[1].y);
      }

      runOnJS(onStrokeEnd)();
    });

  useEffect(() => {
    const openSheetSub = listenToOpenSheetEvent(() => {
      const currentSnapshot = canvasRef.current?.makeImageSnapshot()!;
      const base64 = currentSnapshot.encodeToBase64();
      emitCanvasSnapshotEvent(`data:image/png;base64,${base64}`);
    });

    return () => openSheetSub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  // Debounce canvas snapshot on stroke change
  useEffect(() => {
    const handler = setTimeout(() => {
      takeCanvasSnapshot();
    }, 125);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStrokeType, strokes.length, canvasSize.width, canvasSize.height]);

  const isLastACircle = shapes[shapes.length - 1] === "circle";
  const isLastAStar = shapes[shapes.length - 1] === "star";
  const isLastArrow = shapes[shapes.length - 1] === "arrow";

  return (
    <View style={styles.container}>
      <View style={styles.layerContainer}>
        <GestureDetector gesture={pan}>
          <Animated.View ref={canvasContainerRef} collapsable={false}>
            <Canvas ref={canvasRef} style={{ ...canvasSize }}>
              <Image
                image={baseLayer}
                x={0}
                y={0}
                width={canvasSize.width}
                height={canvasSize.height}
                fit={"cover"}
              />

              <StrokeList strokes={strokes} canvasSize={canvasSize} />

              <StrokePreview
                type={activeStrokeType}
                path={path}
                color={color}
                strokeWidth={strokeWidth}
                baseLayer={baseLayer}
                currentSnapshot={snapshot}
                canvasSize={canvasSize}
                doubleStrokeWidth={doubleStrokeWidth}
              />
            </Canvas>
          </Animated.View>
        </GestureDetector>

        {activeStrokeType === "circle-shape" && isLastACircle ? (
          <CircleShapePreview key={shapes.length} canvasSize={canvasSize} />
        ) : null}

        {activeStrokeType === "star-shape" && isLastAStar ? (
          <StarShapePreview key={shapes.length} canvasSize={canvasSize} />
        ) : null}

        {activeStrokeType === "arrow-shape" && isLastArrow ? (
          <ArrowShapePreview key={shapes.length} canvasSize={canvasSize} />
        ) : null}
      </View>

      {containerSize.width === 1 && containerSize.height === 1 ? null : (
        <ThicknessContainer canvasSize={containerSize} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  layerContainer: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});

export default DrawingLayer;
