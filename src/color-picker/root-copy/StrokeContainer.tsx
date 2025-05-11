import React, { useEffect, useState } from "react";
import { Image, View, StyleSheet } from "react-native";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { theme } from "@commons/theme";
import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import { useShapeStore } from "@freehand-draw/store/useShapeStore";
import { listentoColorSelectorSnapshotEvent } from "@color-picker/utils/emitter";

type StrokeButtonData = {
  type: string;
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

const StrokeContainer = () => {
  const { width } = useCustomDimensions();
  const activeStrokeType = useStrokeStore((state) => state.activeStrokeType);

  const lastShapeType = useShapeStore((state) => {
    const length = state.shapeTypes.length;
    return state.shapeTypes[length - 1];
  });

  const [image, setImage] = useState<string | undefined>(undefined);

  const usableSpace = width - theme.spacing.s * 2 - theme.spacing.m * 2;
  const availableSpace = usableSpace / 8;
  const size = Math.min(32, availableSpace - theme.spacing.s);

  let shapeIcon = "plus";
  if (lastShapeType === "circle") shapeIcon = "circle-outline";
  if (lastShapeType === "star") shapeIcon = "star-outline";
  if (lastShapeType === "arrow") shapeIcon = "arrow-top-right";

  useEffect(() => {
    const sub = listentoColorSelectorSnapshotEvent(setImage);

    return () => sub.remove();
  }, []);

  const styles = StyleSheet.create({
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      width: width - theme.spacing.m,
      borderRadius: size + theme.spacing.s * 2,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.secondary,
      paddingVertical: theme.spacing.s + 4,
      paddingHorizontal: theme.spacing.m,
      marginHorizontal: theme.spacing.s,
      marginVertical: theme.spacing.m,
    },
    icon: {
      padding: 0,
      margin: 0,
    },
    iconBorder: {
      width: size / 2,
      height: size / 2,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#fff",
      borderRadius: "50%",
    },
    activeIndicator: {
      width: size,
      height: size,
      backgroundColor: theme.colors.accent,
      borderRadius: "50%",
      position: "absolute",
    },
  });

  return (
    <View style={styles.container}>
      <View style={[{ width: availableSpace, height: size }, styles.center]}>
        {image !== undefined ? (
          <Image
            source={{ uri: image }}
            style={{ width: size, height: size }}
          />
        ) : null}
      </View>

      {buttons.map((item) => {
        const isActive = item.type === activeStrokeType;

        return (
          <View
            key={item.type}
            style={[{ width: availableSpace, height: size }, styles.center]}
          >
            {isActive ? <View style={styles.activeIndicator} /> : null}

            <View style={styles.iconBorder}>
              <Icon
                name={item.icon}
                size={size * 0.4}
                color={"#fff"}
                style={styles.icon}
              />
            </View>
          </View>
        );
      })}

      <View style={[{ width: availableSpace, height: size }, styles.center]}>
        {shapeIcon !== "plus" ? <View style={styles.activeIndicator} /> : null}
        <Icon name={shapeIcon} size={size * 0.75} color={"#fff"} />
      </View>
    </View>
  );
};

export default StrokeContainer;
