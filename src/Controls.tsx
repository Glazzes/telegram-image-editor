import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
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
import { useRouter } from "expo-router";
import { useModalHelper } from "@commons/hooks/useModalHelper";

type ControlsProps = {
  baseLayer: SkImage;
  canvasWidth: number;
};

const Controls: React.FC<ControlsProps> = ({ baseLayer, canvasWidth }) => {
  const router = useRouter();
  const modalHelper = useModalHelper();

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const strokes = useStrokeStore((state) => state.strokes);

  const stickerStore = useStickerStore(
    useShallow((state) => ({
      pressedRecord: state.pressedRecord,
      stickerData: state.stickerData,
    })),
  );

  function onPress() {
    setIsProcessing(true);

    // What is this garbage? For some reason out of my control I can not get this function
    // to execute aas a promise, I need to update asap so this is the easiest solution.
    setTimeout(() => {
      processImage()
        .then((base64) => {
          modalHelper.setFinalImage(base64);

          Clipboard.setStringAsync(base64);
          router.navigate({ pathname: "/modal" });
        })
        .finally(() => setIsProcessing(false));
    }, 50);
  }

  async function processImage(): Promise<string> {
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
    return "data:image/png;base64," + base64;
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

      {isProcessing ? (
        <ActivityIndicator size={"small"} color={"#fff"} />
      ) : (
        <Pressable onPress={onPress}>
          <Icon name="check" size={24} color={"#fff"} style={styles.icon} />
        </Pressable>
      )}
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
