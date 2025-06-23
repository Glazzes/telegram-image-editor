import { Size, Vector } from "@commons/types";
import { hsl2rgbShaderFunction } from "@color-picker/utils/shaders";

import { hsl2rgb, stringifyRGB } from "../utils/colors";
import { RAD2DEG, TAU } from "../utils/constants";
import type { RGB } from "../utils/types";

type GridColor = {
  color: string;
  rawColor: RGB;
};

export const GRID_SHADER = `
  uniform vec2 size;

  const float ROWS = 10;
  const float COLUMNS = 12.0;
  const float PI = 3.14159265359;
  const float TAU = 2.0 * PI;

  const float BASE_LUMINANCE = 0.5;

  ${hsl2rgbShaderFunction}

  half4 main(vec2 xy) {
    vec2 uv = xy / size;
    uv.x *= COLUMNS;
    uv.y *= ROWS;

    const float step = (PI * 1.5) / COLUMNS;

    float rowIndex = floor(uv.x);
    float columnIndex = floor(uv.y);

    if(columnIndex == 0.0) {
      float step = 1.0 / COLUMNS;
      float luminance = 1.0 - (rowIndex * step);

      vec3 color = hslToRgb(PI, 0, luminance);
      return vec4(color, 1.0);
    }

    // Start from 205 degrees
    float hue = mod(3.665191429188092 + (step * rowIndex) + TAU, TAU);

    float gain = 0.35; 
    float luminanceStep = gain / 4;
    float luminance = (BASE_LUMINANCE - gain) + luminanceStep * (columnIndex - 1.0);
    if(columnIndex >= 6.0) {
      luminance = 0.5 + (columnIndex - 5.0) * 0.08;
    }

    vec3 color = hslToRgb(hue, 0.825, luminance);
    return vec4(color, 1.0);
  }
`;

const COLUMNS = 12;
const ROWS = 10;

export function getColorFromGrid(
  position: Vector<number>,
  gridSize: Size<number>,
): GridColor {
  "worklet";

  const uvX = (position.x / gridSize.width) * COLUMNS;
  const uvY = (position.y / gridSize.height) * ROWS;

  const rowIndex = Math.floor(uvX);
  const columnIndex = Math.floor(uvY);

  if (columnIndex === 0) {
    const step = 1 / COLUMNS;
    const luminance = 1.0 - rowIndex * step;

    const color = hsl2rgb(Math.PI * RAD2DEG, 0, luminance);
    return {
      color: stringifyRGB(color),
      rawColor: color,
    };
  }

  const hueStep = (Math.PI * 1.5) / COLUMNS;
  const hue = (3.665191429188092 + hueStep * rowIndex + TAU) % TAU;

  const gain = 0.35;
  const luminanceStep = gain / 4;
  let luminance = 0.5 - gain + luminanceStep * (columnIndex - 1.0);
  if (columnIndex >= 6) {
    luminance = 0.5 + (columnIndex - 5.0) * 0.08;
  }

  const color = hsl2rgb(hue * RAD2DEG, 0.825, luminance);
  return {
    color: stringifyRGB(color),
    rawColor: color,
  };
}

export const getLuminance = (color: RGB): number => {
  "worklet";
  const a = color.map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  // @ts-ignore
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};
