import { makeMutable, SharedValue } from "react-native-reanimated";
import { create } from "zustand";

import { BASE_STROKE_WIDTH } from "../constants";
import { getStrokecolorByType, getStrokeWidthByType } from "./strokeStorage";

type SliderStore = {
  color: SharedValue<string>;
  progress: SharedValue<number>;
  strokeWidth: SharedValue<number>;
  doubleStrokeWidth: SharedValue<number>;
};

// Inmutable hook which holds data for the store width slider.
// This thing will not cause any re renders.
export const useStrokeWidthStore = create<SliderStore>()(() => {
  const initialColor = getStrokecolorByType("simple") ?? "red";
  const initialWidth = getStrokeWidthByType("simple") ?? 0.5;

  const color = makeMutable<string>(initialColor);
  const progress = makeMutable<number>(initialWidth);
  const strokeWidth = makeMutable<number>(BASE_STROKE_WIDTH);
  const doubleStrokeWidth = makeMutable<number>(BASE_STROKE_WIDTH * 2);

  return {
    color,
    progress,
    strokeWidth: strokeWidth,
    doubleStrokeWidth: doubleStrokeWidth,
  };
});
