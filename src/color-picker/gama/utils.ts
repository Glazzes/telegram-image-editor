import { Extrapolation, interpolate } from "react-native-reanimated";

import { Vector, Size } from "@commons/types";

import { hsl2rgbShaderFunction } from "../utils/shaders";
import type { HSL } from "../utils/types";

export const GAMA_SHADER = `
  uniform vec2 size;

  const float PI = 3.14159265359;

  ${hsl2rgbShaderFunction}

  vec4 main(vec2 xy) {
    float hue = (xy.y / size.y) * 2.0 * PI;
    float saturation = 1.0;
    float luminosity =  1.0 - (xy.x / size.x);

    vec3 color = hslToRgb(hue, saturation, luminosity);
    return vec4(color, 1.0);
  }
  `;

export const xy2hsl = (xy: Vector<number>, dimension: Size<number>) => {
  "worklet";
  const hue = 360 * (xy.y / dimension.height);
  const luminosity = 1 - xy.x / dimension.width;

  return {
    h: hue,
    s: 1,
    l: luminosity,
  };
};

export const hsl2xy = (
  color: HSL,
  dimensions: Size<number>,
): Vector<number> => {
  "worklet";

  const x = interpolate(
    color.l,
    [1, 0],
    [-dimensions.width / 2, dimensions.width / 2],
    Extrapolation.CLAMP,
  );

  const y = interpolate(
    color.h,
    [0, 360],
    [-dimensions.height / 2, dimensions.height / 2],
    Extrapolation.CLAMP,
  );

  return { x, y };
};
