import React from "react";
import { Path } from "@shopify/react-native-skia";

import { ArrowShape } from "@freehand-draw/types";

type ArrowStrokeComponentProps = {
  stroke: ArrowShape;
};

const ArrowStrokeComponent: React.FC<ArrowStrokeComponentProps> = ({
  stroke,
}) => {
  return (
    <React.Fragment>
      <Path path={stroke.headPath} color={stroke.color} />
      <Path
        path={stroke.path}
        color={stroke.color}
        strokeWidth={stroke.strokeWidth}
        strokeCap={"round"}
        style={"stroke"}
      />
    </React.Fragment>
  );
};

export default ArrowStrokeComponent;
