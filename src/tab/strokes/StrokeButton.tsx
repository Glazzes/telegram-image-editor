import React, { useEffect } from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import {
  getStrokecolorByType,
  getStrokeWidthByType,
  setStrokeColorByType,
  setStrokeWidthByType,
} from "@freehand-draw/store/strokeStorage";

import { Stroke } from "@freehand-draw/types";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import { useStrokeWidthStore } from "@freehand-draw/store/useStrokeWidthStore";

type StrokeButtonProps = {
  size: number;
  icon: string;
  type: Stroke["type"];
  style: ViewStyle;
};

const StrokeButton: React.FC<StrokeButtonProps> = ({
  size,
  icon,
  type,
  style,
}) => {
  const setActiveStrokeType = useStrokeStore(
    (state) => state.setActiveType,
  );

  const color = useStrokeWidthStore((state) => state.color);

  function onPress() {
    setActiveStrokeType(type);

    const savedColor = getStrokecolorByType(type)!;
    color.value = savedColor;
  }

  useEffect(() => {
    const strokeData = getStrokeWidthByType(type);
    if (strokeData !== undefined) return;

    setStrokeWidthByType(type, 0.5);
    setStrokeColorByType(type, "red");
  }, [type]);

  return (
    <Pressable style={style} onPress={onPress}>
      <View style={[{ width: size, height: size }, styles.center]}>
        <View
          style={[
            { width: size / 2, height: size / 2 },
            styles.iconContainer,
            styles.center,
          ]}
        >
          <Icon
            name={icon}
            size={size * 0.4}
            color={"#fff"}
            style={styles.icon}
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    borderRadius: "50%",
    borderColor: "#fff",
    borderWidth: 1.5,
  },
  icon: {
    margin: 0,
    padding: 0,
  },
});

export default StrokeButton;
