import React from "react";
import {
  Group,
  Image,
  StrokeCap,
  StrokeJoin,
} from "@shopify/react-native-skia";

import { Size } from "@commons/types";

import { EraserStroke } from "../../types";

type EraserStrokeComponentProps = {
  stroke: EraserStroke;
  canvasSize: Size<number>;
};

const EraserStrokeComponent: React.FC<EraserStrokeComponentProps> = ({
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
        image={stroke.baseLayer}
        x={0}
        y={0}
        width={canvasSize.width}
        height={canvasSize.height}
        fit={"cover"}
      />
    </Group>
  );
};

export default EraserStrokeComponent;
