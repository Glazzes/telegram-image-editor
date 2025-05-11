import React from "react";
import { View, StyleSheet } from "react-native";

import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { theme } from "@commons/theme";

import ColorSelector from "./strokes/ColorSelector";
import StrokeRow from "./StrokeRow";

const BottomTab = () => {
  const { width } = useCustomDimensions();

  const usableSpace = width - theme.spacing.s * 2 - theme.spacing.m * 2;
  const availableSpace = usableSpace / 8;
  const size = Math.min(32, availableSpace - theme.spacing.s);

  return (
    <View
      style={[
        styles.container,
        {
          width: width - theme.spacing.m,
          borderRadius: size + theme.spacing.s * 2,
        },
      ]}
    >
      <ColorSelector size={size} availableSpace={availableSpace} />

      <StrokeRow itemSize={size} availableSpace={availableSpace} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.s + 4,
    paddingHorizontal: theme.spacing.m,
    marginHorizontal: theme.spacing.s,
    marginVertical: theme.spacing.m,
  },
});

export default BottomTab;
