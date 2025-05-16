import { makeMutable, runOnUI, SharedValue } from "react-native-reanimated";
import { create } from "zustand";

import { Vector } from "@commons/types";
import { StickerState, StickerType } from "../utils/types";

interface StickerStore {
  stickers: StickerType[];
  stickerData: SharedValue<Record<string, StickerState>>;
  pressedRecord: SharedValue<string[]>; // Order in which stickers are pressed, used for zIndex
  activeId: SharedValue<string | undefined>; // The id of the last pressed or added sticker
  add: (sticker: StickerType) => void;
  cloneById: (id: string, newId: string, offset?: Vector<number>) => void;
  deleteById: (id: string) => void;
  reset: () => void;
}

const stickerData = makeMutable<Record<string, StickerState>>({});
const pressedRecord = makeMutable<string[]>([]);
const activeId = makeMutable<string | undefined>(undefined);

export const useStickerStore = create<StickerStore>()((set, get) => {
  return {
    stickers: [],
    stickerData,
    pressedRecord,
    activeId: activeId,

    add(sticker) {
      runOnUI(() => {
        "worklet";

        activeId.value = sticker.id;
        pressedRecord.modify((prev) => {
          "worklet";

          prev.push(sticker.id);
          return prev;
        });
      })();

      set((state) => ({ stickers: [...state.stickers, sticker] }));
    },

    cloneById(id: string, newId: string, offset?: Vector<number>) {
      const stickerToClone = get().stickerData.value[id];
      if (stickerToClone === undefined) {
        console.log(
          `Attempted to clone sticker with ${id}, but it does not exists`,
        );
        return;
      }

      const newSticker: StickerType = {
        id: newId,
        source: stickerToClone.source,
        skiaSource: stickerToClone.skiaSource,
        radius: stickerToClone.radius,
        transform: {
          rotate: stickerToClone.transform.rotate,
          rotateY: stickerToClone.transform.rotateY,
          translate: {
            x: stickerToClone.transform.translate.x + (offset?.x ?? 30),
            y: stickerToClone.transform.translate.y + (offset?.y ?? 30),
          },
        },
      };

      activeId.value = newId;
      pressedRecord.modify((prev) => {
        "worlet";

        prev.push(newId);
        return prev;
      });

      stickerData.modify((prev) => {
        "worklet";

        // @ts-ignore
        prev[newId] = newSticker;
        return prev;
      });

      set((state) => ({ stickers: [...state.stickers, newSticker] }));
    },

    deleteById(id) {
      activeId.value = undefined;
      pressedRecord.value = pressedRecord.value.filter(
        (stickerId) => stickerId !== id,
      );

      stickerData.modify((prev) => {
        "worklet";

        delete prev[id];
        return prev;
      });

      set((state) => {
        const filtered = state.stickers.filter((st) => st.id !== id);
        return { stickers: filtered };
      });
    },

    reset() {
      stickerData.value = {};
      pressedRecord.value = [];
      activeId.value = undefined;

      set({
        stickers: [],
        stickerData,
        activeId,
        pressedRecord,
      });
    },
  };
});
