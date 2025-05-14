import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { randomUUID } from "expo-crypto";

import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { theme } from "@commons/theme";

import { useStickerStore } from "@stickers/store/stickerStore";
import { emitCloseStickerBottomSheet } from "@stickers/utils/emitter";
import { useRecordStore } from "@commons/store/useRecordStore";

type StickerPreviewProps = {
  source: number;
};

const StickerPreview = (props: StickerPreviewProps) => {
  const { width } = useCustomDimensions();

  const addSticker = useStickerStore((state) => state.add);
  const pushToRecord = useRecordStore((state) => state.push);

  const size = width / 4;
  const imageSize = size - (theme.spacing.m * 4) / 4;

  function onPress() {
    const newId = randomUUID();

    addSticker({ id: newId, source: props.source });
    pushToRecord({ id: newId, type: "sticker" });

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
