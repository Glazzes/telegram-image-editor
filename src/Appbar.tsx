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

  const { record, popFromRecord, resetRecord } = useRecordStore(
    useShallow((state) => ({
      record: state.record,
      resetRecord: state.reset,
      popFromRecord: state.pop,
    })),
  );

  const { deleteAllStrokes, deleteStrokeById, setActiveStrokeType } =
    useStrokeStore(
      useShallow((state) => ({
        setActiveStrokeType: state.setActiveType,
        deleteStrokeById: state.deleteById,
        deleteAllStrokes: state.deleteAll,
      })),
    );

  const { resetStickers, deleteStickerById } = useStickerStore(
    useShallow((state) => ({
      resetStickers: state.reset,
      deleteStickerById: state.deleteById,
    })),
  );

  function onPressDeleteLast() {
    const record = popFromRecord();

    if (record === undefined) return;
    if (record.type === "stroke") deleteStrokeById(record.id);
    if (record.type === "sticker") deleteStickerById(record.id);
  }

  function onPressDeleteAll() {
    resetRecord();
    resetShapeStore();
    resetStickers();
    deleteAllStrokes();
    setActiveStrokeType("simple");
  }

  const color =
    record.length > 0 ? theme.colors.text.active : theme.colors.text.disabled;

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
