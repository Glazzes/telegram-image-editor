import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { theme } from "@commons/theme";

const Controls = () => {
  return (
    <View style={styles.root}>
      <Icon name="close" size={24} color={"#fff"} style={styles.icon} />
      <View style={styles.optionsContainer}>
        <Text style={styles.text}>draw</Text>
        <Text style={[styles.text, { color: theme.colors.text.disabled }]}>
          sticker
        </Text>
        <Text style={[styles.text, { color: theme.colors.text.disabled }]}>
          text
        </Text>
      </View>

      <Icon name="check" size={24} color={"#fff"} style={styles.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.m,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: theme.spacing.m,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },
  icon: {
    width: 24,
    height: 24,
    padding: 0,
    margin: 0,
  },
});

export default Controls;
