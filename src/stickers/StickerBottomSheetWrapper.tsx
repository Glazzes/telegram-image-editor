import React, { useEffect, useRef } from "react";
import { View } from "react-native";

import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";

import BottomSheet from "./components/sheet/BottomSheet";
import { BottomSheetRefType } from "./components/sheet/types";
import {
  listenToCloseStickerBottomSheet,
  listenToOpenStickerBottomSheet,
} from "./utils/emitter";

type StickerWrapperProps = React.PropsWithChildren;

const StickerBottomSheetWrapper = (props: StickerWrapperProps) => {
  const sheetRef = useRef<BottomSheetRefType>(null);
  const { width, height } = useCustomDimensions();

  function openBottomSheet() {
    sheetRef.current?.open();
  }

  function closeBottomSheet() {
    sheetRef.current?.close();
  }

  useEffect(() => {
    const openSub = listenToOpenStickerBottomSheet(openBottomSheet);
    const closeSub = listenToCloseStickerBottomSheet(closeBottomSheet);

    return () => {
      openSub.remove();
      closeSub.remove();
    };
  }, []);

  return (
    <View style={{ width, height }}>
      {props.children}

      <BottomSheet ref={sheetRef} />
    </View>
  );
};

export default StickerBottomSheetWrapper;
