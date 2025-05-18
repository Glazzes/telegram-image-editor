import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  measure,
  runOnJS,
  runOnUI,
  useAnimatedRef,
} from "react-native-reanimated";
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
  const animatedRef = useAnimatedRef();
  const menuRef = useRef<StickerContextMenuRefType>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);

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

  function openStickerMenuJS(position: Vector<number>) {
    menuRef.current?.enter(position);
    setIsOpen(true);
  }

  function openStickerMenu(center: Vector<number>) {
    runOnUI(() => {
      const measument = measure(animatedRef);
      if (measument === null) return;

      const x = center.x - measument.pageX;
      const y = center.y - measument.pageY;

      runOnJS(openStickerMenuJS)({ x, y });
    })();
  }

  function closeStickerMenu() {
    menuRef.current?.exit(() => setIsOpen(false));
  }

  function flip() {
    menuRef.current?.exit(() => {
      const currentId = stickerStore.activeId.value;
      if (currentId !== undefined) {
        emitFlipStickerEvent(currentId);
      }

      setIsOpen(false);
    });
  }

  function duplicate() {
    menuRef.current?.exit(() => {
      const currentStickerId = stickerStore.activeId.value;
      if (currentStickerId === undefined) return;

      const newId = randomUUID();
      recordStore.add({ id: newId, type: "sticker" });
      stickerStore.cloneById(currentStickerId, newId);

      setIsOpen(false);
    });
  }

  function deleteSticker() {
    menuRef.current?.exit(() => {
      const currentStickerId = stickerStore.activeId.value;
      if (currentStickerId === undefined) return;

      setIsOpen(false);
      recordStore.deleteById(currentStickerId);
      stickerStore.deleteById(currentStickerId);
    });
  }

  useEffect(() => {
    const openContextMenuSub = listenToOpenStickerContextEvent(openStickerMenu);

    return () => openContextMenuSub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View ref={animatedRef} style={styles.root}>
      {props.children}

      {isOpen ? (
        <Pressable style={styles.intersection} onPress={closeStickerMenu} />
      ) : null}

      <StickerOptionsMenu ref={menuRef}>
        <StickerOptionsMenu.Item title="flip" onPress={flip} />
        <StickerOptionsMenu.Item title="duplicate" onPress={duplicate} />
        <StickerOptionsMenu.Item title="delete" onPress={deleteSticker} />
      </StickerOptionsMenu>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  intersection: {
    width: "100%",
    height: "100%",
    position: "absolute",
    cursor: "auto",
  },
});

export default StickerContextMenuWrapper;
