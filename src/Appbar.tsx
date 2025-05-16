import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useShallow } from "zustand/react/shallow";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { theme } from "@commons/theme";
import { useRecordStore } from "@commons/store/useRecordStore";
import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import { useShapeStore } from "@freehand-draw/store/useShapeStore";
import { useStickerStore } from "@stickers/store/stickerStore";

const Appbar = () => {
  const resetShapeStore = useShapeStore((state) => state.resetShapeStore);

  const recordStore = useRecordStore(
    useShallow((state) => ({
      record: state.record,
      reset: state.reset,
      pop: state.pop,
    })),
  );

  const strokeStore = useStrokeStore(
    useShallow((state) => ({
      setActiveType: state.setActiveType,
      deleteById: state.deleteById,
      reset: state.reset,
    })),
  );

  const stickerStore = useStickerStore(
    useShallow((state) => ({
      reset: state.reset,
      deleteById: state.deleteById,
    })),
  );

  function onPressDeleteLast() {
    const record = recordStore.pop();

    if (record === undefined) return;
    if (record.type === "stroke") strokeStore.deleteById(record.id);
    if (record.type === "sticker") stickerStore.deleteById(record.id);
  }

  function onPressDeleteAll() {
    resetShapeStore();
    recordStore.reset();
    stickerStore.reset();
    strokeStore.reset();
    strokeStore.setActiveType("simple");
  }

  const color =
    recordStore.record.length > 0
      ? theme.colors.text.active
      : theme.colors.text.disabled;

  return (
    <View style={styles.container}>
      <Pressable onPress={onPressDeleteLast}>
        <Icon name={"arrow-u-left-top"} size={24} color={color} />
      </Pressable>
      <Pressable onPress={onPressDeleteAll}>
        <Text style={[styles.text, { color }]}>clear all</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 66,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.l,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});

export default Appbar;
