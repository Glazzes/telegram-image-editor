import React, { useEffect } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import {
  getStrokeColorByType,
  getStrokeWidthByType,
  setStrokeColorByType,
  setStrokeWidthByType,
} from "@freehand-draw/store/strokeStorage";
import { Shape, useShapeStore } from "@freehand-draw/store/useShapeStore";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";

import { theme } from "@commons/theme";
import { Stroke } from "@freehand-draw/types";

import { useShapeMenu } from "./useShapeMenu";

type ShapeMenuItemProps = {
  strokeType: Stroke["type"];
  shapeType: Shape;
  icon: string;
};

const ShapeMenuItem: React.FC<ShapeMenuItemProps> = ({
  strokeType,
  shapeType,
  icon,
}) => {
  const { dissmisMenu } = useShapeMenu();

  const addShapeType = useShapeStore((state) => state.addShapeType);
  const setActiveStrokeType = useStrokeStore((state) => state.setActiveType);

  function setNewShape() {
    addShapeType(shapeType);
    setActiveStrokeType(strokeType);
    dissmisMenu();
  }

  useEffect(() => {
    const savedColor = getStrokeColorByType(strokeType);
    const savedWidth = getStrokeWidthByType(strokeType);

    const baseColor = "rgba(0, 255, 255, 1)";
    if (savedColor === undefined) setStrokeColorByType(strokeType, baseColor);
    if (savedWidth === undefined) setStrokeWidthByType(strokeType, 0.5);
  }, [strokeType]);

  return (
    <Pressable style={styles.row} onPress={setNewShape}>
      <Icon name={icon} size={24} color={"#fff"} style={styles.icon} />
      <Text style={styles.text}>{shapeType}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    alignItems: "center",
    cursor: "pointer",
  },
  icon: {
    width: 24,
    height: 24,
    margin: 0,
    padding: 0,
  },
  text: {
    fontFamily: "sans-serif",
    fontWeight: "bold",
    color: "#fff",
    textTransform: "capitalize",
  },
});

export default ShapeMenuItem;
