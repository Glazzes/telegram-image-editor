import { SkImage, SkPath } from "@shopify/react-native-skia";

type CommonStrokeProperties = {
  id: string;
  path: SkPath;
  strokeWidth: number;
  isTap: boolean;
};

export type SimpleStroke = {
  type: "simple";
  color: string;
} & CommonStrokeProperties;

export type ArrowPath = {
  type: "arrow";
} & Omit<SimpleStroke, "type" | "cornerPath">;

export type HightlightStroke = {
  type: "highlight";
  color: string;
  opacity: number;
} & CommonStrokeProperties;

export type DoubleStroke = {
  type: "double";
} & Omit<SimpleStroke, "type" | "cornerPath">;

export type BlurStroke = {
  type: "blur";
  currentSnapshot: SkImage;
  blur: number;
} & CommonStrokeProperties;

export type EraserStroke = {
  type: "eraser";
  baseLayer: SkImage;
} & CommonStrokeProperties;

export type CircleShape = {
  type: "circle-shape";
  color: string;
} & Omit<CommonStrokeProperties, "isTap">;

export type StarShape = {
  type: "star-shape";
  color: string;
  cornerPath: number;
} & Omit<CommonStrokeProperties, "isTap">;

export type ArrowShape = {
  type: "arrow-shape";
  color: string;
  headPath: SkPath;
} & Omit<CommonStrokeProperties, "isTap">;

export type RectangleShape = {
  type: "rectangle-shape";
  color: string;
} & Omit<CommonStrokeProperties, "isTap">;

export type Stroke =
  | SimpleStroke
  | ArrowPath
  | BlurStroke
  | EraserStroke
  | HightlightStroke
  | DoubleStroke
  | CircleShape
  | StarShape
  | ArrowShape
  | RectangleShape;

export interface StrokeWidthSliderRef {
  animateToValue: (value: number) => void;
}
