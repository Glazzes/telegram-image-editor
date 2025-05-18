import React from "react";

import { SimpleStroke, Stroke } from "@freehand-draw/types";
import { Size } from "@commons/types";

import BlurStrokeComponent from "./strokes/BlurStrokeComponent";
import SimpleStrokeComponent from "./strokes/SimpleStrokeComponent";
import EraserStrokeComponent from "./strokes/EraserStrokeComponent";
import HightLightStrokeComponent from "./strokes/HightLightStrokeComponent";
import DoubleStrokeComponent from "./strokes/DoubleStrokeComponent";
import ArrowStrokeComponent from "./strokes/ArrowStrokeComponent";
import CorneredStrokeComponent from "./strokes/CorneredStrokeComponent";

type StrokeListProps = {
  strokes: Stroke[];
  canvasSize: Size<number>;
};

type StrokeListItemProps = {
  stroke: Stroke;
  canvasSize: Size<number>;
};

const StrokeListItem: React.FC<StrokeListItemProps> = React.memo(
  ({ stroke, canvasSize }) => {
    if (stroke.type === "arrow-shape") {
      return <ArrowStrokeComponent stroke={stroke} />;
    }

    if (stroke.type === "blur") {
      return <BlurStrokeComponent canvasSize={canvasSize} stroke={stroke} />;
    }

    if (stroke.type === "double") {
      return <DoubleStrokeComponent stroke={stroke} />;
    }

    if (stroke.type === "eraser") {
      return <EraserStrokeComponent canvasSize={canvasSize} stroke={stroke} />;
    }

    if (stroke.type === "highlight") {
      return <HightLightStrokeComponent stroke={stroke} />;
    }

    if (stroke.type === "simple" || stroke.type === "arrow") {
      return <SimpleStrokeComponent stroke={stroke as SimpleStroke} />;
    }

    if (stroke.type === "star-shape") {
      return <CorneredStrokeComponent stroke={stroke} />;
    }

    return null;
  },
  (prev, next) => prev.stroke.id === next.stroke.id,
);

StrokeListItem.displayName = "StrokeListItem";

const StrokeList: React.FC<StrokeListProps> = ({ strokes, canvasSize }) => {
  return (
    <React.Fragment>
      {strokes.map((stroke) => {
        return (
          <StrokeListItem
            key={stroke.id}
            stroke={stroke}
            canvasSize={canvasSize}
          />
        );
      })}
    </React.Fragment>
  );
};

export default StrokeList;
