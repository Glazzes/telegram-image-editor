import {
  ClipOp,
  FilterMode,
  MipmapMode,
  PaintStyle,
  rect,
  SkCanvas,
  Skia,
  SkImage,
  SkSurface,
  StrokeCap,
  StrokeJoin,
  TileMode,
} from "@shopify/react-native-skia";

import { CORNER_PATH } from "@freehand-draw/constants";

import {
  ArrowShape,
  BlurStroke,
  DoubleStroke,
  EraserStroke,
  HightlightStroke,
  SimpleStroke,
  StarShape,
  Stroke,
} from "../types";

type StrokeDrawOptions = {
  baseLayer: SkImage;
  strokes: Stroke[];
  scale: number;
};

function drawArrowShape(canvas: SkCanvas, stroke: ArrowShape, scale: number) {
  canvas.save();

  const bodyPaint = Skia.Paint();
  bodyPaint.setColor(Skia.Color(stroke.color));
  bodyPaint.setStrokeCap(StrokeCap.Round);
  bodyPaint.setStrokeJoin(StrokeJoin.Round);
  bodyPaint.setStrokeWidth(stroke.strokeWidth);
  bodyPaint.setStyle(PaintStyle.Stroke);

  const headPaint = Skia.Paint();
  headPaint.setColor(Skia.Color(stroke.color));

  canvas.scale(scale, scale);
  canvas.drawPath(stroke.path, bodyPaint);
  canvas.drawPath(stroke.headPath, headPaint);

  canvas.restore();
}

// Blur and eraser do not need to set stroke width, cap and join here because this
// strokes have been already assigned such data in their respective pre visualiztions found
// in the strokes componenet folder of @freehand-draw.
function drawBlur(surface: SkSurface, stroke: BlurStroke, scale: number) {
  const size = rect(0, 0, surface.width(), surface.height());

  const currentSnapshot = surface.makeImageSnapshot();
  const canvas = surface.getCanvas();
  canvas.save();

  stroke.path.transform(Skia.Matrix().scale(scale, scale));
  canvas.clipPath(stroke.path, ClipOp.Intersect, true);

  const paint = Skia.Paint();
  paint.setImageFilter(
    Skia.ImageFilter.MakeBlur(stroke.blur, stroke.blur, TileMode.Clamp, null),
  );

  canvas.drawImageRectOptions(
    currentSnapshot,
    size,
    size,
    FilterMode.Linear,
    MipmapMode.Linear,
    paint,
  );

  canvas.restore();
  surface.flush();
}

function drawCornered(canvas: SkCanvas, stroke: StarShape, scale: number) {
  canvas.save();

  const paint = Skia.Paint();
  paint.setColor(Skia.Color(stroke.color));
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeJoin(StrokeJoin.Round);
  paint.setStrokeWidth(stroke.strokeWidth);
  paint.setStyle(PaintStyle.Stroke);

  const cornerPath = Skia.PathEffect.MakeCorner(CORNER_PATH);
  paint.setPathEffect(cornerPath);

  canvas.scale(scale, scale);
  canvas.drawPath(stroke.path, paint);

  canvas.restore();
}

function drawDouble(canvas: SkCanvas, stroke: DoubleStroke, scale: number) {
  canvas.save();

  const innerPaint = Skia.Paint();
  innerPaint.setStrokeWidth(stroke.strokeWidth);
  innerPaint.setColor(Skia.Color("#ffffff"));
  innerPaint.setStrokeCap(StrokeCap.Round);
  innerPaint.setStrokeJoin(StrokeJoin.Round);
  innerPaint.setStyle(PaintStyle.Stroke);

  const outterPaint = Skia.Paint();
  outterPaint.setStrokeWidth(stroke.strokeWidth * 2);
  outterPaint.setColor(Skia.Color(stroke.color));
  outterPaint.setStrokeCap(StrokeCap.Round);
  outterPaint.setStrokeJoin(StrokeJoin.Round);
  outterPaint.setStyle(PaintStyle.Stroke);

  canvas.scale(scale, scale);
  canvas.drawPath(stroke.path, outterPaint);
  canvas.drawPath(stroke.path, innerPaint);

  canvas.restore();
}

function drawEraser(canvas: SkCanvas, stroke: EraserStroke, scale: number) {
  canvas.save();

  stroke.path.transform(Skia.Matrix().scale(scale));
  canvas.clipPath(stroke.path, ClipOp.Intersect, true);

  const baseLayer = stroke.baseLayer;
  const size = rect(0, 0, baseLayer.width(), baseLayer.height());
  canvas.drawImageRectOptions(
    baseLayer,
    size,
    size,
    FilterMode.Linear,
    MipmapMode.Linear,
    null,
  );

  canvas.restore();
}

function drawHighlight(
  canvas: SkCanvas,
  stroke: HightlightStroke,
  scale: number,
) {
  canvas.save();

  const paint = Skia.Paint();
  paint.setColor(Skia.Color(stroke.color));
  paint.setStrokeCap(StrokeCap.Butt);
  paint.setStrokeJoin(StrokeJoin.Round);
  paint.setStrokeWidth(stroke.strokeWidth);
  paint.setStyle(PaintStyle.Stroke);
  paint.setAlphaf(stroke.opacity);

  canvas.scale(scale, scale);
  canvas.drawPath(stroke.path, paint);

  canvas.restore();
}

function drawSimple(canvas: SkCanvas, stroke: SimpleStroke, scale: number) {
  canvas.save();

  const paint = Skia.Paint();
  paint.setColor(Skia.Color(stroke.color));
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeJoin(StrokeJoin.Round);
  paint.setStrokeWidth(stroke.strokeWidth);
  paint.setStyle(PaintStyle.Stroke);

  canvas.scale(scale, scale);
  canvas.drawPath(stroke.path, paint);

  canvas.restore();
}

export function drawStrokesAsImage(options: StrokeDrawOptions): string {
  const { strokes, scale, baseLayer } = options;

  const surface = Skia.Surface.MakeOffscreen(
    baseLayer.width(),
    baseLayer.height(),
  )!;

  const canvas = surface.getCanvas();

  canvas.drawImageRectOptions(
    baseLayer,
    rect(0, 0, baseLayer.width(), baseLayer.height()),
    rect(0, 0, baseLayer.width(), baseLayer.height()),
    FilterMode.Linear,
    MipmapMode.Linear,
    null,
  );

  for (let i = 0; i < strokes.length; i++) {
    const stroke = strokes[i];

    if (stroke.type === "arrow-shape") drawArrowShape(canvas, stroke, scale);
    if (stroke.type === "blur") drawBlur(surface, stroke, scale);
    if (stroke.type === "double") drawDouble(canvas, stroke, scale);
    if (stroke.type === "eraser") drawEraser(canvas, stroke, scale);
    if (stroke.type === "highlight") drawHighlight(canvas, stroke, scale);
    if (stroke.type === "simple") drawSimple(canvas, stroke, scale);
    if (stroke.type === "star-shape") drawCornered(canvas, stroke, scale);
  }

  const snapshot = surface.makeImageSnapshot();
  return snapshot.encodeToBase64();
}
