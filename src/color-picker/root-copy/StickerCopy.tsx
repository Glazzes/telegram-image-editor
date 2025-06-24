import React from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { StickerType } from "@stickers/utils/types";
import { useStickerStore } from "@stickers/store/stickerStore";

type StickerCopyProps = {
  sticker: StickerType;
};

export const INITIAL_STICKER_SIZE = 150;

const StickerCopy = (props: StickerCopyProps) => {
  const stickerData = useStickerStore((state) => state.stickerData);

  const animatedStyles = useAnimatedStyle(() => {
    const data = stickerData.value[props.sticker.id];
    if (data === undefined) return {};

    return {
      width: data.radius * 2,
      height: data.radius * 2,
      position: "absolute",
      transform: [
        { translateX: data.transform.translate.x },
        { translateY: data.transform.translate.y },
        { rotate: `${data.transform.rotate}rad` },
        { rotateY: `${data.transform.rotateY}rad` },
        { scale: 1 / Math.SQRT2 },
      ],
    };
  }, [stickerData, props.sticker.id]);

  return (
    <Animated.Image style={animatedStyles} source={props.sticker.source} />
  );
};

export default React.memo(StickerCopy, () => true);
