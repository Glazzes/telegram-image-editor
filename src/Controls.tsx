import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Skia, SkImage } from "@shopify/react-native-skia";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { useShallow } from "zustand/react/shallow";
import * as Clipboard from "expo-clipboard";

import { theme } from "@commons/theme";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import { drawStrokesToCanvas } from "@freehand-draw/utils/canvas";
import { emitOpenStickerBottomSheet } from "@stickers/utils/emitter";
import { drawStickersToCanvas } from "@stickers/utils/canvas";
import { useStickerStore } from "@stickers/store/stickerStore";

type ControlsProps = {
  baseLayer: SkImage;
  canvasWidth: number;
};

const Controls: React.FC<ControlsProps> = ({ baseLayer, canvasWidth }) => {
  const strokes = useStrokeStore((state) => state.strokes);

  const stickerStore = useStickerStore(
    useShallow((state) => ({
      pressedRecord: state.pressedRecord,
      stickerData: state.stickerData,
    })),
  );

  function processImage() {
    const surface = Skia.Surface.MakeOffscreen(
      baseLayer.width(),
      baseLayer.height(),
    )!;

    const scale = baseLayer.width() / canvasWidth;
    drawStrokesToCanvas({ surface, baseLayer, strokes, scale });
    drawStickersToCanvas({
      surface,
      canvasWidth,
      imageResolution: {
        width: baseLayer.width(),
        height: baseLayer.height(),
      },
      pressedRecord: stickerStore.pressedRecord.value,
      stickerData: stickerStore.stickerData.value,
    });

    const base64 = surface.makeImageSnapshot().encodeToBase64();
    Clipboard.setStringAsync(base64);
  }

  function openStickerBottomSheet() {
    emitOpenStickerBottomSheet();
  }

  return (
    <View style={styles.root}>
      <Icon name="close" size={24} color={"#fff"} style={styles.icon} />
      <View style={styles.optionsContainer}>
        <Text style={styles.text}>draw</Text>

        <Pressable onPress={openStickerBottomSheet}>
          <Text style={[styles.text, { color: theme.colors.text.disabled }]}>
            sticker
          </Text>
        </Pressable>

        <Text style={[styles.text, { color: theme.colors.text.disabled }]}>
          text
        </Text>
      </View>
      <Pressable onPress={processImage}>
        <Icon name="check" size={24} color={"#fff"} style={styles.icon} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.m,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: theme.spacing.m,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },
  icon: {
    width: 24,
    height: 24,
    padding: 0,
    margin: 0,
  },
});

export default Controls;
