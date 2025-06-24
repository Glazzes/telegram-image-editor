import React, { useImperativeHandle, useRef } from "react";
import { View } from "react-native";
import { makeImageFromView, Skia } from "@shopify/react-native-skia";
import { domToPng } from "modern-screenshot";

import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";

import Appbar from "./Appbar";
import DrawingLayer from "./DrawingLayer";
import Controls from "./Controlts";
import StrokeContainer from "./StrokeContainer";
import { RootCopyRef } from "./types";

/*
 * Due to the limitations of Skia's makeImageFromView and moder-screenshot library, it's not
 * possible to take screenshots of a canvas elements, therefore as a workaround I built a complete
 * copy of the Editor layout with zero functionality, to serve as simple dom skeleton hidden behind the
 * actual app, so we can take screenshots of the "canvas" properly.
 */
const RootCopy = (_: unknown, ref: React.ForwardedRef<RootCopyRef>) => {
  const rootRef = useRef<View>(null);

  const { width, height } = useCustomDimensions();

  useImperativeHandle(
    ref,
    () => ({
      async takeSnapshot() {
        try {
          const image = await makeImageFromView(rootRef, async (node) => {
            let base64 = await domToPng(
              node.current! as unknown as HTMLElement,
            );

            // 22 is length of "data:image/png;base64,"
            base64 = base64.slice(22);

            const data = Skia.Data.fromBase64(base64);
            return Skia.Image.MakeImageFromEncoded(data);
          });

          if (image === null) {
            throw new Error("Root snapshot error");
          }

          return image;
        } catch (e) {
          throw e;
        }
      },
    }),
    [rootRef],
  );

  return (
    <View
      ref={rootRef}
      style={{
        width,
        height,
        backgroundColor: "#000",
        overflow: "hidden",
        position: "absolute",
      }}
    >
      <Appbar />
      <DrawingLayer />
      <StrokeContainer />
      <Controls />
    </View>
  );
};

export default React.forwardRef<RootCopyRef>(RootCopy);
