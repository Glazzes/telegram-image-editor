import React, { useEffect } from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import {
  getStrokeColorByType,
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

const StrokeButton = (props: StrokeButtonProps) => {
  const setActiveStrokeType = useStrokeStore((state) => state.setActiveType);
  const color = useStrokeWidthStore((state) => state.color);

  function onPress() {
    setActiveStrokeType(props.type);

    const savedColor = getStrokeColorByType(props.type)!;
    color.value = savedColor;
  }

  useEffect(() => {
    const strokeData = getStrokeWidthByType(props.type);
    if (strokeData !== undefined) return;

    setStrokeWidthByType(props.type, 0.5);
    setStrokeColorByType(props.type, "rgba(0, 255, 255, 1)");

    // Workaround to force the color to start at this color, when there's nothing
    // on localstorage
    if (props.type === "simple") {
      color.value = "rgba(0, 255, 255, 1)";
    }
  }, [props.type, color]);

  return (
    <Pressable style={props.style} onPress={onPress}>
      <View style={[{ width: props.size, height: props.size }, styles.center]}>
        <View
          style={[
            { width: props.size / 2, height: props.size / 2 },
            styles.iconContainer,
            styles.center,
          ]}
        >
          <Icon
            name={props.icon}
            size={props.size * 0.4}
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
