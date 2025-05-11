import React from "react";
import { SharedValue } from "react-native-reanimated";
import {
  Blur,
  Image,
  Mask,
  Path,
  SkImage,
  SkPath,
} from "@shopify/react-native-skia";

import { BLUR_AMOUNT, HIGHLIGHT_OPACITY } from "@freehand-draw/constants";
import { Stroke } from "@freehand-draw/types";
import { Size } from "@commons/types";

type StrokePreviewProps = {
  type: Stroke["type"];
  path: SharedValue<SkPath>;
  strokeWidth: SharedValue<number>;
  color: SharedValue<string>;
  canvasSize: Size<number>;
  baseLayer: SkImage;
  currentSnapshot: SharedValue<SkImage>;
  doubleStrokeWidth: SharedValue<number>;
};

// This component serves as a real time preview of what the stroke should look like
// Before being turned into a Stroke object and submitted into the strokes array.
const StrokePreview: React.FC<StrokePreviewProps> = ({
  type,
  path,
  strokeWidth,
  color,
  canvasSize,
  baseLayer,
  currentSnapshot,
  doubleStrokeWidth,
}) => {
  if (type === "blur") {
    return (
      <Mask
        mode={"luminance"}
        mask={
          <Path
            path={path}
            color={"white"}
            strokeWidth={strokeWidth}
            strokeJoin={"round"}
            strokeCap={"round"}
            style={"stroke"}
          />
        }
      >
        <Image
          image={currentSnapshot}
          x={0}
          y={0}
          width={canvasSize.width}
          height={canvasSize.height}
          fit={"cover"}
        >
          <Blur blur={BLUR_AMOUNT} />
        </Image>
      </Mask>
    );
  }

  if (type === "double") {
    return (
      <React.Fragment>
        <Path
          path={path}
          color={color}
          strokeWidth={doubleStrokeWidth}
          strokeJoin={"round"}
          strokeCap={"round"}
          style={"stroke"}
        />
        <Path
          path={path}
          color={"#fff"}
          strokeWidth={strokeWidth}
          strokeJoin={"round"}
          strokeCap={"round"}
          style={"stroke"}
        />
      </React.Fragment>
    );
  }

  if (type === "eraser") {
    return (
      <Mask
        mode={"luminance"}
        mask={
          <Path
            path={path}
            strokeWidth={strokeWidth}
            color={"white"}
            strokeCap={"round"}
            strokeJoin={"round"}
            style={"stroke"}
          />
        }
      >
        <Image
          image={baseLayer}
          x={0}
          y={0}
          width={canvasSize.width}
          height={canvasSize.height}
          fit={"cover"}
        />
      </Mask>
    );
  }

  if (type === "highlight") {
    return (
      <Path
        path={path}
        color={color}
        style={"stroke"}
        strokeWidth={strokeWidth}
        strokeJoin={"round"}
        strokeCap={"butt"}
        opacity={HIGHLIGHT_OPACITY}
      />
    );
  }

  if (type === "arrow" || type === "simple") {
    return (
      <Path
        path={path}
        color={color}
        strokeWidth={strokeWidth}
        strokeJoin={"round"}
        strokeCap={"round"}
        style={"stroke"}
      />
    );
  }

  return null;
};

export default StrokePreview;
