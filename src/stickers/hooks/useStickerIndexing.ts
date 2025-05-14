import { useAnimatedReaction } from "react-native-reanimated";
import { useStickerStore } from "@stickers/store/stickerStore";

/*
 * Helpter hook to modify the order in which stickers are pressed, this is used to
 * allow a proper z index value
 */
export function useStickerIndexing() {
  const { activeId, pressedRecord } = useStickerStore();

  useAnimatedReaction(
    () => activeId.value,
    (id) => {
      if (id === undefined) return;

      // @ts-ignore
      pressedRecord.modify((prev) => {
        "worklet";
        const filtered = prev.filter((stickerId) => stickerId !== id);
        filtered.push(id);

        return filtered;
      });
    },
    [activeId, pressedRecord],
  );
}
