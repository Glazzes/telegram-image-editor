import React, { useEffect, useState } from "react";
import { View, StyleSheet, LayoutChangeEvent, Image } from "react-native";

import { Size } from "@commons/types";
import { fitContainer } from "@commons/utils/math";
import { listenToCanvasSnapshotEvent } from "@color-picker/utils/emitter";
import StrokeWidthSlider from "./StrokeWidthSlider";
import { useStickerStore } from "@stickers/store/stickerStore";
import StickerCopy from "./StickerCopy";

const resolution = { width: 1000, height: 1500 };

const DrawingLayer = () => {
  const stickerStore = useStickerStore();

  const [image, setImage] = useState<string | undefined>(undefined);
  const [rootSize, setRootSize] = useState<Size<number>>({
    width: 1,
    height: 1,
  });

  const imageSize = fitContainer(
    resolution.width / resolution.height,
    rootSize,
  );

  useEffect(() => {}, []);

  function measureRoot(event: LayoutChangeEvent) {
    setRootSize({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  }

  useEffect(() => {
    const sub = listenToCanvasSnapshotEvent(setImage);

    return () => sub.remove();
  }, []);

  return (
    <View style={[styles.root, styles.center]} onLayout={measureRoot}>
      <View style={[{ ...imageSize }, styles.center]}>
        <Image source={{ uri: image }} style={{ ...imageSize }} />
        {stickerStore.stickers.map((sticker) => {
          return <StickerCopy key={sticker.id} sticker={sticker} />;
        })}
      </View>
      <StrokeWidthSlider canvasSize={imageSize} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DrawingLayer;
