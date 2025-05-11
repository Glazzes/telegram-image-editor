import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";
import {
  Canvas,
  Circle,
  Group,
  Path,
  Rect,
  Skia,
} from "@shopify/react-native-skia";

import type { RGB } from "../../utils/types";
import { useColorPickerDimensions } from "@color-picker/hooks/useColorPickerDimensions";

type OpacitySliderIndicatorProps = {
  color: SharedValue<RGB>;
  opacity: SharedValue<number>;
  translateX: SharedValue<number>;
};

const OpacitySliderIndicator: React.FC<OpacitySliderIndicatorProps> = ({
  color,
  opacity,
  translateX,
}) => {
  const { indicatorSize } = useColorPickerDimensions();

  const checkerSize = 3;
  const columns = Math.ceil(indicatorSize / checkerSize);
  const checkers = new Array(columns ** 2).fill(0);

  const radius = indicatorSize / 2;
  const colors = ["#fff", "#000"];

  const upperDivider = Skia.Path.MakeFromSVGString(
    `M 0 0 l ${indicatorSize + 1} 0 l ${-1 * indicatorSize} ${indicatorSize} z`,
  )!;

  const lowerDivider = Skia.Path.MakeFromSVGString(
    `M 0 ${indicatorSize} l ${indicatorSize} 0 l 0 ${-1 * indicatorSize} z`,
  )!;

  const clipPath = Skia.Path.Make();
  clipPath.addCircle(radius, radius, radius);

  const backgroundColor = useDerivedValue(() => {
    const [r, g, b] = color.value;
    return `rgba(${r}, ${g}, ${b}, 1)`;
  }, [color]);

  const animatedStyles = useAnimatedStyle(
    () => ({
      transform: [{ translateX: translateX.value }],
    }),
    [translateX],
  );

  const styles = StyleSheet.create({
    root: {
      width: indicatorSize,
      height: indicatorSize,
      position: "absolute",
    },
    canvas: {
      width: indicatorSize,
      height: indicatorSize,
    },
  });

  return (
    <Animated.View style={[styles.root, animatedStyles]}>
      <Canvas style={styles.canvas}>
        <Group clip={clipPath}>
          {checkers.map((_, index) => {
            const x = index % columns;
            const y = Math.floor(index / columns);

            let checkerColor = x % 2 === 0 ? colors[0] : colors[1];
            if (y % 2 === 1) {
              checkerColor = checkerColor === colors[0] ? colors[1] : colors[0];
            }

            return (
              <Rect
                key={`checker-${index}`}
                x={x * checkerSize}
                y={y * checkerSize}
                width={checkerSize}
                height={checkerSize}
                color={checkerColor}
              />
            );
          })}
          <Path path={upperDivider} color={backgroundColor} antiAlias={true} />
          <Path
            path={lowerDivider}
            color={backgroundColor}
            antiAlias={true}
            opacity={opacity}
          />

          <Circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            color={"#fff"}
            strokeWidth={4}
            style={"stroke"}
          />
        </Group>
      </Canvas>
    </Animated.View>
  );
};

export default OpacitySliderIndicator;
