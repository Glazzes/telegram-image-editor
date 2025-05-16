import React from "react";
import { HightlightStroke } from "../../types";
import { Path } from "@shopify/react-native-skia";

type HightLightStrokeComponentProps = {
  stroke: HightlightStroke;
};

const HightLightStrokeComponent: React.FC<HightLightStrokeComponentProps> = ({
  stroke,
}) => {
  return (
    <Path
      path={stroke.path}
      color={stroke.color}
      strokeWidth={stroke.strokeWidth}
      strokeJoin={"round"}
      opacity={stroke.opacity}
      style={stroke.isTap ? "fill" : "stroke"}
    />
  );
};

export default HightLightStrokeComponent;
