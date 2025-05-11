import React, { useEffect, useState } from "react";
import { View, StyleSheet, LayoutChangeEvent, Image } from "react-native";

import { Size } from "@commons/types";
import { fitContainer } from "@commons/utils/math";
import { listenToCanvasSnapshotEvent } from "@color-picker/utils/emitter";
import StrokeWidthSlider from "./StrokeWidthSlider";

const resolution = { width: 1000, height: 1500 };

const DrawingLayer = () => {
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
    <View style={styles.root} onLayout={measureRoot}>
      <Image source={{ uri: image }} style={{ ...imageSize }} />
      <StrokeWidthSlider canvasSize={imageSize} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DrawingLayer;
