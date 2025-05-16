import {
  FilterMode,
  MipmapMode,
  rect,
  Skia,
  SkSurface,
} from "@shopify/react-native-skia";

import { Size } from "@commons/types";

import { StickerState } from "./types";

type Options = {
  surface: SkSurface;
  imageResolution: Size<number>;
  canvasWidth: number; // Size of the image on screen
  pressedRecord: string[]; // Order in which the stickers are activated
  stickerData: Record<string, StickerState>; // Transformation and metadata of the stickers
};

const RAG2DEG = 180 / Math.PI;

export function drawStickersToCanvas(options: Options) {
  const { surface, imageResolution, canvasWidth, pressedRecord, stickerData } =
    options;

  const canvas = surface?.getCanvas();

  if (canvas === undefined) return undefined;

  const relativeScale = imageResolution.width / canvasWidth;
  const centerX = imageResolution.width / 2;
  const centerY = imageResolution.height / 2;

  for (let i = 0; i < pressedRecord.length; i++) {
    const stickerId = pressedRecord[i];
    const sticker = stickerData[stickerId];

    const translateX = sticker.transform.translate.x * relativeScale;
    const translateY = sticker.transform.translate.y * relativeScale;
    const angle = sticker.transform.rotate * RAG2DEG;
    const isFlipped = sticker.transform.rotateY === Math.PI;

    const size = sticker.radius * 2 * relativeScale;
    const x = centerX - size / 2;
    const y = centerY - size / 2;

    canvas.save();
    if (isFlipped) {
      canvas.scale(-1, 1);
      canvas.translate(-1 * imageResolution.width, 0);
    }

    const direction = isFlipped ? -1 : 1;
    canvas.translate(direction * translateX, translateY);
    canvas.rotate(direction * angle, centerX, centerY);

    if (sticker.skiaSource !== null) {
      const stickerImage = sticker.skiaSource;

      canvas.drawImageRectOptions(
        stickerImage,
        rect(0, 0, stickerImage.width(), stickerImage.height()),
        rect(x, y, size, size),
        FilterMode.Linear,
        MipmapMode.Linear,
        Skia.Paint(),
      );
    }

    canvas.restore();
  }
}
