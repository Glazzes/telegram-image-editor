import React from "react";
import { DoubleStroke } from "../../types";
import { Path } from "@shopify/react-native-skia";

type DoubleStrokeComponentProps = {
  stroke: DoubleStroke;
};

const DoubleStrokeComponent: React.FC<DoubleStrokeComponentProps> = ({
  stroke,
}) => {
  return (
    <React.Fragment>
      <Path
        path={stroke.path}
        color={stroke.color}
        strokeWidth={stroke.strokeWidth * 2}
        strokeJoin={"round"}
        strokeCap={"round"}
        style={"stroke"}
      />
      <Path
        path={stroke.path}
        color={"white"}
        strokeWidth={stroke.strokeWidth}
        strokeJoin={"round"}
        strokeCap={"round"}
        style={"stroke"}
      />
    </React.Fragment>
  );
};

export default DoubleStrokeComponent;
