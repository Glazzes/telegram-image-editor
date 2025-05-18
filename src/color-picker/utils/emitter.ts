import { EventEmitter, EventSubscription } from "fbemitter";

const emitter = new EventEmitter();

const OPEN_SHEET_EVENT = "open-sheet";
export function emitOpenSheetEvent() {
  emitter.emit(OPEN_SHEET_EVENT);
}

export function listenToOpenSheetEvent(cb: () => void): EventSubscription {
  return emitter.addListener(OPEN_SHEET_EVENT, cb);
}

const OPEN_EYEDROPPER_EVENT = "open-eyedropper";
export function emitOpenEyedropperEvent() {
  emitter.emit(OPEN_EYEDROPPER_EVENT);
}

export function listenToOpenEyedropperEvent(cb: () => void): EventSubscription {
  return emitter.addListener(OPEN_EYEDROPPER_EVENT, cb);
}

const SELECTED_COLOR_EVENT = "selected-color";
export function emitSelectedColorEvent(color: string) {
  emitter.emit(SELECTED_COLOR_EVENT, color);
}

export function listenToSelectedColorEvent(
  cb: (color: string) => void,
): EventSubscription {
  return emitter.addListener(SELECTED_COLOR_EVENT, cb);
}

const CANVAS_SNAPSHOT_EVENT_NAME = "canvas-snapshot-event";
export function emitCanvasSnapshotEvent(base64: string): void {
  emitter.emit(CANVAS_SNAPSHOT_EVENT_NAME, base64);
}

export function listenToCanvasSnapshotEvent(
  cb: (base64: string) => void,
): EventSubscription {
  return emitter.addListener(CANVAS_SNAPSHOT_EVENT_NAME, cb);
}

const COLOR_SELECTOR_SNAPSHOT_EVENT = "color-snapshot-event";
export function emitColorSelectorSnapshotEvent(base64: string) {
  emitter.emit(COLOR_SELECTOR_SNAPSHOT_EVENT, base64);
}

export function listentoColorSelectorSnapshotEvent(
  cb: (base64: string) => void,
): EventSubscription {
  return emitter.addListener(COLOR_SELECTOR_SNAPSHOT_EVENT, cb);
}

const UPDATE_COLOR_PICKER_COLOR = "update-color-picker-color";
export function emitUpdateColorPickerColor(color: string) {
  emitter.emit(UPDATE_COLOR_PICKER_COLOR, color);
}

export function listenToUpdateColorPickerColor(
  cb: (color: string) => void,
): EventSubscription {
  return emitter.addListener(UPDATE_COLOR_PICKER_COLOR, cb);
}
