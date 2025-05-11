import React from "react";
import { StyleSheet, Pressable } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";

import { theme } from "@commons/theme";
import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";

import { useShapeMenu } from "./useShapeMenu";
import ShapeMenuItem from "./ShapeMenuItem";

const ShapeMenu = () => {
  const { width, height } = useCustomDimensions();
  const { dissmisMenu } = useShapeMenu();

  return (
    <Pressable
      onPress={dissmisMenu}
      style={[styles.root, { width, height, cursor: "auto" }]}
    >
      <Animated.View
        entering={FadeInDown.delay(100).duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.menuContainer}
      >
        <ShapeMenuItem
          strokeType="circle-shape"
          shapeType="circle"
          icon="circle-outline"
        />

        <ShapeMenuItem
          strokeType="star-shape"
          shapeType="star"
          icon="star-outline"
        />

        <ShapeMenuItem
          strokeType="arrow-shape"
          shapeType="arrow"
          icon="arrow-top-right"
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    height: "100%",
    position: "absolute",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: theme.spacing.s,
  },
  menuContainer: {
    borderRadius: theme.spacing.s,
    backgroundColor: theme.colors.menu,
    paddingHorizontal: theme.spacing.m,
  },
});

export default ShapeMenu;
