import React, { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { useImage } from "@shopify/react-native-skia";

import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { fitContainer } from "@commons/utils/math";
import { Size } from "@commons/types";

import Controls from "./src/Controls";
import Appbar from "./src/Appbar";
import DrawingLayer from "./src/DrawingLayer";
import { ShapeMenuProvider } from "./src/menu/ShapeMenuProvider";
import BottomTab from "./src/tab/BottomTab";

import ColorPickerWrapper from "@color-picker/ColorPickerWrapper";
import StickerBottomSheetWrapper from "@stickers/StickerBottomSheetWrapper";
import StickerContextMenuWrapper from "@stickers/StickerContextMenuWrapper";

const IMAGE = "https://m.media-amazon.com/images/I/71qINLp2cXL.jpg";

const resolution = { width: 1000, height: 1500 };

const TestComponent = () => {
  const { width, height } = useCustomDimensions();

  const baseLayer = useImage(IMAGE);

  const [containerSize, setContainerSize] = useState<Size<number>>({
    width: 1,
    height: 1,
  });

  const imageSize = fitContainer(
    resolution.width / resolution.height,
    containerSize,
  );

  function onLayout(e: LayoutChangeEvent) {
    setContainerSize({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  }

  if (baseLayer === null) {
    return null;
  }

  return (
    <ColorPickerWrapper canvasSize={imageSize}>
      <StickerContextMenuWrapper>
        <StickerBottomSheetWrapper>
          <ShapeMenuProvider>
            <View
              style={{
                width: width,
                height: height,
                backgroundColor: "#000",
              }}
            >
              <Appbar />
              <View style={{ flex: 1 }} onLayout={onLayout}>
                <DrawingLayer
                  baseLayer={baseLayer}
                  canvasSize={imageSize}
                  containerSize={containerSize}
                />
              </View>
              <BottomTab />
              <Controls baseLayer={baseLayer} canvasWidth={imageSize.width} />
            </View>
          </ShapeMenuProvider>
        </StickerBottomSheetWrapper>
      </StickerContextMenuWrapper>
    </ColorPickerWrapper>
  );
};

export default TestComponent;
