import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { useStrokeStore } from "@freehand-draw/store/useStrokeStore";
import { useShapeStore } from "@freehand-draw/store/useShapeStore";

import { theme } from "@commons/theme";
import { useRecordStore } from "@commons/store/useRecordStore";

const Appbar = () => {
  const resetShapeStore = useShapeStore((state) => state.resetShapeStore);
  const { record, popFromRecord, resetRecord } = useRecordStore();
  const { deleteAllStrokes, deleteStrokeById, setActiveStrokeType } =
    useStrokeStore();

  function onPressDeleteLast() {
    const record = popFromRecord();

    if (record === undefined) return;
    if (record.type === "stroke") deleteStrokeById(record.id);
  }

  function onPressDeleteAll() {
    resetRecord();
    resetShapeStore();
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
