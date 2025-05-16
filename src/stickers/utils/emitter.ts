import { Vector } from "@commons/types";
import { EventEmitter, EventSubscription } from "fbemitter";

const emitter = new EventEmitter();

const FLIP_EVENT = "flip";
export function listenToFlipStickerEvent(
  cb: (id: string) => void,
): EventSubscription {
  return emitter.addListener(FLIP_EVENT, cb);
}

export function emitFlipStickerEvent(id: string) {
  emitter.emit(FLIP_EVENT, id);
}

const OPEN_BOTTOM_SHEET = "open-bottom-sheet";
export function emitOpenStickerBottomSheet() {
  emitter.emit(OPEN_BOTTOM_SHEET);
}

export function listenToOpenStickerBottomSheet(
  cb: () => void,
): EventSubscription {
  return emitter.addListener(OPEN_BOTTOM_SHEET, cb);
}

const CLOSE_STICKER_BOTTOM_SHEET = "close-sticker-bottom-sheet";
export function emitCloseStickerBottomSheet() {
  emitter.emit(CLOSE_STICKER_BOTTOM_SHEET);
}

export function listenToCloseStickerBottomSheet(
  cb: () => void,
): EventSubscription {
  return emitter.addListener(CLOSE_STICKER_BOTTOM_SHEET, cb);
}

type OpenStickerContextMenuCallback = (position: Vector<number>) => void;

const OPEN_STICKER_CONTEXT_MENU = "open-sticker-context-menu";
export function emitOpenStickerContextEvent(position: Vector<number>) {
  emitter.emit(OPEN_STICKER_CONTEXT_MENU, position);
}

export function listenToOpenStickerContextEvent(
  cb: OpenStickerContextMenuCallback,
) {
  return emitter.addListener(OPEN_STICKER_CONTEXT_MENU, cb);
}
