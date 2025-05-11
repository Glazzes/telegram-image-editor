import React from "react";
import { CornerPathEffect, Path } from "@shopify/react-native-skia";

import { CORNER_PATH } from "@freehand-draw/constants";
import { StarShape } from "../../types";

type SimpleStrokeProps = {
  stroke: StarShape;
};

const SimpleStrokeComponent: React.FC<SimpleStrokeProps> = ({ stroke }) => {
  return (
    <Path
      path={stroke.path}
      color={stroke.color}
      strokeWidth={stroke.strokeWidth}
      strokeCap={"round"}
      strokeJoin={"round"}
      style={"stroke"}
    >
      <CornerPathEffect r={CORNER_PATH} />
    </Path>
  );
};

export default SimpleStrokeComponent;
