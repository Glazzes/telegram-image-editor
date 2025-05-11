import React from "react";
import {
  Blur,
  Group,
  Image,
  StrokeCap,
  StrokeJoin,
} from "@shopify/react-native-skia";

import { Size } from "@commons/types";

import { BlurStroke } from "../../types";

type BlurStrokeComponentProps = {
  stroke: BlurStroke;
  canvasSize: Size<number>;
};

const BlurStrokeComponent: React.FC<BlurStrokeComponentProps> = ({
  stroke,
  canvasSize,
}) => {
  stroke.path.stroke({
    width: stroke.strokeWidth,
    cap: StrokeCap.Round,
    join: StrokeJoin.Round,
  });

  return (
    <Group clip={stroke.path}>
      <Image
        image={stroke.currentSnapshot}
        x={0}
        y={0}
        width={canvasSize.width}
        height={canvasSize.height}
        fit={"cover"}
      >
        <Blur blur={stroke.blur} />
      </Image>
    </Group>
  );
};

export default BlurStrokeComponent;
