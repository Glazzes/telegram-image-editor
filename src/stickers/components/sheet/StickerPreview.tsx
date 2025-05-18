import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { randomUUID } from "expo-crypto";

import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { theme } from "@commons/theme";

import { useStickerStore } from "@stickers/store/stickerStore";
import { emitCloseStickerBottomSheet } from "@stickers/utils/emitter";
import { useRecordStore } from "@commons/store/useRecordStore";
import { SharedValue } from "react-native-reanimated";

type StickerPreviewProps = {
  source: number;
  isPanning: SharedValue<boolean>;
};

const StickerPreview = (props: StickerPreviewProps) => {
  const { width } = useCustomDimensions();

  const addSticker = useStickerStore((state) => state.add);
  const addRecord = useRecordStore((state) => state.add);

  const size = width / 4;
  const imageSize = size - (theme.spacing.m * 4) / 4;

  function onPress() {
    if (props.isPanning.value) {
      props.isPanning.value = false;
      return;
    }

    const newId = randomUUID();
    addSticker({ id: newId, source: props.source });
    addRecord({ id: newId, type: "sticker" });

    emitCloseStickerBottomSheet();
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.root, { width: size, height: size }]}
    >
      <Image
        source={props.source}
        style={{ width: imageSize, height: imageSize }}
        resizeMode={"cover"}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default React.memo(StickerPreview, (prev, next) => {
  return prev.source === next.source;
});
