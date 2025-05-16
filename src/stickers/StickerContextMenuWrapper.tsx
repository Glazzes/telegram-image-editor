import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { randomUUID } from "expo-crypto";
import { useShallow } from "zustand/react/shallow";

import { Vector } from "@commons/types";
import { useRecordStore } from "@commons/store/useRecordStore";
import { useStickerStore } from "@stickers/store/stickerStore";
import {
  emitFlipStickerEvent,
  listenToOpenStickerContextEvent,
} from "@stickers/utils/emitter";

import StickerOptionsMenu from "./components/menu/StickerContextMenu";

import { StickerContextMenuRefType } from "./utils/types";

const StickerContextMenuWrapper = (props: React.PropsWithChildren) => {
  const menuRef = useRef<StickerContextMenuRefType>(null);

  const recordStore = useRecordStore(
    useShallow((state) => ({
      add: state.add,
      deleteById: state.deleteById,
    })),
  );

  const stickerStore = useStickerStore(
    useShallow((state) => ({
      activeId: state.activeId,
      cloneById: state.cloneById,
      deleteById: state.deleteById,
    })),
  );

  function openStickerMenu(center: Vector<number>) {
    menuRef.current?.enter(center);
  }

  function flip() {
    menuRef.current?.exit(() => {
      const currentId = stickerStore.activeId.value;
      if (currentId !== undefined) {
        emitFlipStickerEvent(currentId);
      }
    });
  }

  function duplicate() {
    menuRef.current?.exit(() => {
      const currentStickerId = stickerStore.activeId.value;
      if (currentStickerId === undefined) return;

      const newId = randomUUID();
      recordStore.add({ id: newId, type: "sticker" });
      stickerStore.cloneById(currentStickerId, newId);
    });
  }

  function deleteSticker() {
    menuRef.current?.exit(() => {
      const currentStickerId = stickerStore.activeId.value;
      if (currentStickerId === undefined) return;

      recordStore.deleteById(currentStickerId);
      stickerStore.deleteById(currentStickerId);
    });
  }

  useEffect(() => {
    const openContextMenuSub = listenToOpenStickerContextEvent(openStickerMenu);

    return () => openContextMenuSub.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {props.children}

      <StickerOptionsMenu ref={menuRef}>
        <StickerOptionsMenu.Item title="flip" onPress={flip} />
        <StickerOptionsMenu.Item title="duplicate" onPress={duplicate} />
        <StickerOptionsMenu.Item title="delete" onPress={deleteSticker} />
      </StickerOptionsMenu>
    </View>
  );
};

export default StickerContextMenuWrapper;
