import React from "react";
import { Path } from "@shopify/react-native-skia";

import { SimpleStroke } from "../../types";

type SimpleStrokeProps = {
  stroke: SimpleStroke;
};

const SimpleStrokeComponent: React.FC<SimpleStrokeProps> = ({ stroke }) => {
  return (
    <Path
      path={stroke.path}
      color={stroke.color}
      strokeWidth={stroke.strokeWidth}
      strokeCap={"round"}
      strokeJoin={"round"}
      style={stroke.isTap ? "fill" : "stroke"}
    />
  );
};

export default SimpleStrokeComponent;
