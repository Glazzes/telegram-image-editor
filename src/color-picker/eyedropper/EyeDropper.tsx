import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  AlphaType,
  Canvas,
  ClipOp,
  ColorType,
  createPicture,
  Fill,
  ImageShader,
  PaintStyle,
  Picture,
  rect,
  Shader,
  Skia,
  type SkImage,
} from "@shopify/react-native-skia";

import { useVector } from "@commons/hooks/useVector";
import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { Size } from "@commons/types";

import { EYE_DROPPER_SHADER } from "./utils";
import { emitSelectedColorEvent } from "../utils/emitter";

type EyeDropperProps = {
  image: SkImage;
  setImage: React.Dispatch<React.SetStateAction<SkImage | null>>;
  canvasSize: Size<number>;
};

const SHADER = Skia.RuntimeEffect.Make(EYE_DROPPER_SHADER)!;

const EyeDropper: React.FC<EyeDropperProps> = (props) => {
  const { width, height } = useCustomDimensions();
  const previewSize =
    Math.min(props.canvasSize.width, props.canvasSize.height) / 2;

  // Draw grid manually instead of  the shader to prevent artifacts
  const picture = createPicture((canvas) => {
    const cellSize = previewSize / 11;

    const path = Skia.Path.Make();
    path.addCircle(previewSize / 2, previewSize / 2, previewSize * 0.35);
    canvas.clipPath(path, ClipOp.Intersect, true);

    const paint = Skia.Paint();
    paint.setColor(Skia.Color("#fff"));
    paint.setStrokeWidth(2);

    for (let i = 1; i <= 10; i++) {
      const x = i * cellSize;
      const y = i * cellSize;
      canvas.drawLine(x, 0, x, previewSize, paint);
      canvas.drawLine(0, y, previewSize, y, paint);
    }

    const paint2 = Skia.Paint();
    paint2.setColor(Skia.Color("#fff"));
    paint2.setStyle(PaintStyle.Stroke);
    paint2.setStrokeWidth(4);
    canvas.drawRect(
      rect(
        previewSize / 2 - cellSize / 2,
        previewSize / 2 - cellSize / 2,
        cellSize,
        cellSize,
      ),
      paint2,
    );
  });

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const scale = useSharedValue(0);

  function onEnd() {
    const resizerX = props.image.width() / width;
    const resizerY = props.image.height() / height;
    const x = (width / 2 + translate.x.value) * resizerX;
    const y = (height / 2 + translate.y.value) * resizerY;

    const pixels = props.image.readPixels(x, y, {
      colorType: ColorType.RGBA_F32,
      alphaType: AlphaType.Premul,
      height: 1,
      width: 1,
    });

    if (pixels === null) return;

    const r = clamp(Math.round(pixels[0]! * 255), 0, 255);
    const g = clamp(Math.round(pixels[1]! * 255), 0, 255);
    const b = clamp(Math.round(pixels[2]! * 255), 0, 255);
    emitSelectedColorEvent(`rgba(${r}, ${g}, ${b}, 1)`);

    translate.x.value = 0;
    translate.y.value = 0;
    props.setImage(null);
  }

  const uniforms = useDerivedValue(() => {
    return {
      size: [previewSize, previewSize],
      nestedSize: [width, height],
      gesturePos: [
        width / 2 + translate.x.value,
        height / 2 + translate.y.value,
      ],
    };
  }, [previewSize, width, height, translate]);

  const pan = Gesture.Pan()
    .onStart((e) => {
      offset.x.value = e.x - width / 2;
      offset.y.value = e.y - height / 2;
    })
    .onUpdate((e) => {
      translate.x.value = offset.x.value + e.translationX;
      translate.y.value = offset.y.value + e.translationY;
    })
    .onEnd(() => {
      scale.value = withTiming(0, undefined, () => {
        runOnJS(onEnd)();
      });
    });

  const selectorStyles = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
        { scale: scale.value },
      ],
    }),
    [translate, scale],
  );

  useEffect(() => {
    scale.value = withTiming(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const styles = StyleSheet.create({
    root: {
      width,
      height,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      overflow: "hidden",
    },
    container: {
      width: previewSize,
      height: previewSize,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={styles.root}>
        <Animated.View style={[styles.container, selectorStyles]}>
          <Canvas style={{ width: previewSize, height: previewSize }}>
            <Fill>
              <Shader source={SHADER} uniforms={uniforms}>
                <ImageShader
                  image={props.image}
                  fit={"cover"}
                  x={0}
                  y={0}
                  width={width}
                  height={height}
                />
              </Shader>
            </Fill>
            <Picture picture={picture} />
          </Canvas>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

export default EyeDropper;
