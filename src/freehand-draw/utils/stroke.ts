import { SkImage, SkPath } from "@shopify/react-native-skia";
import { randomUUID } from "expo-crypto";

import { Vector } from "@commons/types";
import { rotate2D } from "@commons/utils/math";

import { BLUR_AMOUNT, HIGHLIGHT_OPACITY } from "../constants";
import { Stroke } from "../types";

type NewStrokeOptions = {
  type: Stroke["type"];
  path: SkPath;
  strokeWidth: number;
  color: string;
  baseLayer: SkImage;
  currentSnapshot: SkImage;
};

export const createNewStroke = (options: NewStrokeOptions): Stroke => {
  const { type, path, strokeWidth, color, baseLayer, currentSnapshot } =
    options;

  const commonStrokeProperties = {
    id: randomUUID(),
    strokeWidth: strokeWidth,
    path: path,
  };

  if (type === "blur") {
    return {
      type: type,
      currentSnapshot: currentSnapshot,
      blur: BLUR_AMOUNT,
      ...commonStrokeProperties,
    };
  }

  if (type === "double") {
    return {
      type: type,
      color: color,
      ...commonStrokeProperties,
    };
  }

  if (type === "eraser") {
    return {
      type: type,
      baseLayer: baseLayer,
      ...commonStrokeProperties,
    };
  }

  if (type === "highlight") {
    return {
      type: type,
      color: color,
      opacity: HIGHLIGHT_OPACITY,
      ...commonStrokeProperties,
    };
  }

  return {
    type: "simple",
    color: color,
    ...commonStrokeProperties,
  };
};

export function getArrowHead(
  last: Vector<number>,
  beforeLast: Vector<number>,
): [Vector<number>, Vector<number>] {
  "worklet";

  const radius = 50;

  const x = beforeLast.x - last.x;
  const y = beforeLast.y - last.y;
  const vectorLength = Math.hypot(x, y);

  const direction = { x: x / vectorLength, y: y / vectorLength };
  const rotated1 = rotate2D(direction, Math.PI / 6);
  const rotated2 = rotate2D(direction, -1 * (Math.PI / 6));

  return [
    { x: last.x + radius * rotated1.x, y: last.y + radius * rotated1.y },
    { x: last.x + radius * rotated2.x, y: last.y + radius * rotated2.y },
  ];
}
