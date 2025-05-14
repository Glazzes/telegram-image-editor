import { makeMutable, runOnUI, SharedValue } from "react-native-reanimated";
import { create } from "zustand";

import { StickerState, StickerType } from "../utils/types";

interface StickerStore {
  stickers: StickerType[];
  stickerData: SharedValue<Record<string, StickerState>>;
  pressedRecord: SharedValue<string[]>; // Order in which stickers are pressed, used for zIndex
  activeId: SharedValue<string | undefined>; // The id of the last pressed or added sticker
  blockGestures: SharedValue<boolean>;
  add: (sticker: StickerType) => void;
  deleteById: (id: string) => void;
  reset: () => void;
}

const stickerData = makeMutable<Record<string, StickerState>>({});
const pressedRecord = makeMutable<string[]>([]);
const activeId = makeMutable<string | undefined>(undefined);
const blockGestures = makeMutable<boolean>(false);

export const useStickerStore = create<StickerStore>()((set) => {
  return {
    stickers: [],
    stickerData,
    pressedRecord,
    activeId: activeId,
    blockGestures: blockGestures,

    add(sticker) {
      runOnUI(() => {
        "worklet";

        activeId.value = sticker.id;
        blockGestures.value = true;
        pressedRecord.modify((prev) => {
          "worklet";

          prev.push(sticker.id);
          return prev;
        });
      })();

      set((state) => ({ stickers: [...state.stickers, sticker] }));
    },

    deleteById(id) {
      activeId.value = undefined;
      pressedRecord.value = pressedRecord.value.filter(
        (stickerId) => stickerId !== id,
      );

      set((state) => {
        const filtered = state.stickers.filter((st) => st.id !== id);
        return { stickers: filtered };
      });
    },

    reset() {
      stickerData.value = {};
      pressedRecord.value = [];
      activeId.value = undefined;
      blockGestures.value = false;

      set({
        stickers: [],
        stickerData,
        activeId,
        pressedRecord,
        blockGestures: blockGestures,
      });
    },
  };
});
