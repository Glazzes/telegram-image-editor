import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { theme } from "@commons/theme";
import { useRecordStore } from "@commons/store/useRecordStore";

const Appbar = () => {
  const { record } = useRecordStore();

  const color =
    record.length > 0 ? theme.colors.text.active : theme.colors.text.disabled;

  return (
    <View style={styles.container}>
      <Icon name={"arrow-u-left-top"} size={24} color={color} />

      <Text style={[styles.text, { color }]}>clear all</Text>
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
