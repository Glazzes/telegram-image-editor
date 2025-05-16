import { ImageSourcePropType } from "react-native";
import { SkImage } from "@shopify/react-native-skia";

import { Vector } from "@commons/types";

export type StickerState = {
  id: string;
  source: ImageSourcePropType;
  skiaSource: SkImage | null;
  radius: number;
  transform: {
    rotate: number;
    rotateY: number;
    translate: Vector<number>;
  };
};

export type StickerType = Pick<StickerState, "id" | "source"> &
  Partial<StickerState>;

export type StickerContextMenuRefType = {
  enter: (center: Vector<number>) => void;
  exit: (onFinishCallback?: () => void) => void;
};
