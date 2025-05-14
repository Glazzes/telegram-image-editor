import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";
import {
  Canvas,
  Circle,
  Group,
  Rect,
  Shader,
  Skia,
  useCanvasRef,
} from "@shopify/react-native-skia";

import {
  emitColorSelectorSnapshotEvent,
  emitOpenSheetEvent,
  listenToSelectedColorEvent,
} from "@color-picker/utils/emitter";
import { useStrokeWidthStore } from "@freehand-draw/store/useStrokeWidthStore";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import {
  getStrokecolorByType,
  setStrokeColorByType,
} from "@freehand-draw/store/strokeStorage";

type ActiveColorProps = {
  size: number;
  availableSpace: number;
};

const HSB_SHADER = `
  uniform vec2 resolution;

  const float TWO_PI = 2.0 * 3.14159265359;

  vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
  }

  half4 main(vec2 coord){
    vec2 st = coord / resolution;
    vec3 color = vec3(0.0);

    // Use polar coordinates instead of cartesian
    vec2 toCenter = vec2(0.5)-st;
    float angle = atan(toCenter.y,toCenter.x);
    float radius = length(toCenter)*2.0;

    // Map the angle (-PI to PI) to the Hue (from 0 to 1)
    // and the Saturation to the radius
    color = hsb2rgb(vec3((angle/TWO_PI)+0.5,radius,1.0));

    return vec4(color,1.0);
  }
`;

const shader = Skia.RuntimeEffect.Make(HSB_SHADER)!;

const ColorSelector: React.FC<ActiveColorProps> = ({
  size,
  availableSpace,
}) => {
  const canvasRef = useCanvasRef();

  const { color, strokeWidth } = useStrokeWidthStore();
  const activeStrokeType = useStrokeStore((state) => state.activeType);

  const width = (size * 0.15) / 2;

  const clipPath = Skia.Path.Make();
  clipPath.addCircle(size / 2, size / 2, size / 2 - width / 2);
  clipPath.stroke({ width: (size * 0.15) / 2 });

  function onPress() {
    emitOpenSheetEvent();
    takeSnapshot();
  }

  function takeSnapshot() {
    setTimeout(() => {
      const snapshot = canvasRef.current?.makeImageSnapshot();
      if (snapshot === undefined) {
        console.log("Could not take snapshot of color selector");
        return;
      }

      const base64 = snapshot.encodeToBase64();
      emitColorSelectorSnapshotEvent(`data:image/png;base64,${base64}`);
    }, 200);
  }

  useAnimatedReaction(
    () => color.value,
    () => {
      runOnJS(takeSnapshot)();
    },
    [color],
  );

  useEffect(() => {
    const sub = listenToSelectedColorEvent((newColor) => {
      color.value = newColor;

      setStrokeColorByType(activeStrokeType, newColor);
    });

    return () => sub.remove();
  }, [color, strokeWidth, activeStrokeType]);

  useEffect(() => {
    const currentColor = getStrokecolorByType(activeStrokeType)!;
    color.value = currentColor;
  }, [activeStrokeType, color]);

  const styles = StyleSheet.create({
    container: {
      height: size,
      width: availableSpace,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Canvas ref={canvasRef} style={{ width: size, height: size }}>
        <Group clip={clipPath}>
          <Rect x={0} y={0} width={size} height={size}>
            <Shader source={shader} uniforms={{ resolution: [size, size] }} />
          </Rect>
        </Group>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - width * 2}
          color={color}
        />
      </Canvas>
    </Pressable>
  );
};

export default ColorSelector;
