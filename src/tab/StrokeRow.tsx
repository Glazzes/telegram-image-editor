import React from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import { useShapeStore } from "@freehand-draw/store/useShapeStore";
import { Stroke } from "@freehand-draw/types";
import { theme } from "@commons/theme";

import StrokeButton from "./strokes/StrokeButton";
import { useShapeMenu } from "../menu/useShapeMenu";

type StrokeRowProps = {
  itemSize: number;
  availableSpace: number;
};

type StrokeButtonData = {
  type: Stroke["type"];
  icon: string;
};

const buttons: StrokeButtonData[] = [
  { type: "simple", icon: "grease-pencil" },
  { type: "arrow", icon: "arrow-up" },
  { type: "highlight", icon: "format-color-highlight" },
  { type: "double", icon: "magic-staff" },
  { type: "blur", icon: "blur" },
  { type: "eraser", icon: "eraser" },
];

const StrokeRow: React.FC<StrokeRowProps> = ({ itemSize, availableSpace }) => {
  const { openMenu } = useShapeMenu();
  const activeStrokeType = useStrokeStore((state) => state.activeType);

  const lastShapeType = useShapeStore((state) => {
    const length = state.shapeTypes.length;
    return state.shapeTypes[length - 1];
  });

  let shapeIcon = "plus";
  if (lastShapeType === "circle") shapeIcon = "circle-outline";
  if (lastShapeType === "star") shapeIcon = "star-outline";
  if (lastShapeType === "arrow") shapeIcon = "arrow-top-right";
  if (lastShapeType === "rectangle") shapeIcon = "square-outline";

  const offset = (availableSpace - itemSize) / 2;
  const translateX = useSharedValue<number>(offset);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  }, [translateX]);

  const style: ViewStyle = {
    height: itemSize,
    width: availableSpace,
    justifyContent: "center",
    alignItems: "center",
  };

  useAnimatedReaction(
    () => ({ space: availableSpace, type: activeStrokeType }),
    (current) => {
      let index = buttons.findIndex((stroke) => stroke.type === current.type);
      if (index === -1) index = 6;

      translateX.value = withTiming(index * current.space + offset);
    },
    [activeStrokeType, availableSpace],
  );

  return (
    <View style={styles.container}>
      {buttons.map((data) => {
        return (
          <StrokeButton
            key={data.type}
            type={data.type}
            icon={data.icon}
            size={itemSize}
            style={style}
          />
        );
      })}

      <Pressable style={style} onPress={openMenu}>
        <Icon name={shapeIcon} size={itemSize * 0.75} color={"#fff"} />
      </Pressable>

      <Animated.View
        style={[
          animatedStyle,
          styles.indicator,
          {
            width: itemSize,
            height: itemSize,
            transform: [{ translateX: (availableSpace - itemSize) / 2 }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  indicator: {
    position: "absolute",
    backgroundColor: theme.colors.accent,
    borderRadius: "50%",
    zIndex: -999,
  },
});

export default StrokeRow;
