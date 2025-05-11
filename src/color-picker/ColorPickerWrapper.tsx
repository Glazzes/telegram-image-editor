import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { SkImage } from "@shopify/react-native-skia";

import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { Size } from "@commons/types";

import BottomSheet from "./sheet/BottomSheet";
import EyeDropper from "./eyedropper/EyeDropper";
import RootCopy from "./root-copy/RootCopy";
import { RootCopyRef } from "./root-copy/types";
import { listenToOpenEyedropperEvent } from "./utils/emitter";

type ColorPickerProps = React.PropsWithChildren<{
  canvasSize: Size<number>;
}>;

const ColorPickerWrapper = (props: ColorPickerProps) => {
  const ref = useRef<RootCopyRef>(null);

  const { width, height } = useCustomDimensions();

  const [image, setImage] = useState<SkImage | null>(null);

  useEffect(() => {
    const sub = listenToOpenEyedropperEvent(() => {
      ref.current
        ?.takeSnapshot()
        .then(setImage)
        .catch((e) => console.log(e));
    });

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <View style={{ width, height }}>
      <RootCopy ref={ref} />

      {props.children}

      <BottomSheet />
      {image !== null ? (
        <EyeDropper
          image={image}
          setImage={setImage}
          canvasSize={props.canvasSize}
        />
      ) : null}
    </View>
  );
};

export default ColorPickerWrapper;
