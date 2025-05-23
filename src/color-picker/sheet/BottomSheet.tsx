import React, { useEffect } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  Pressable,
} from "react-native-gesture-handler";

import { theme } from "@commons/theme";
import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";

import Grid from "../grid/Grid";
import Gama from "../gama/Gama";
import Sliders from "../sliders/Sliders";
import OpacitySlider from "./slider/OpacitySlider";
import Controls from "./Controls";

import type { RGB } from "../utils/types";
import { hsl2rgb, parseRGBA, rgb2hsl } from "../utils/colors";
import {
  listenToOpenSheetEvent,
  listenToUpdateColorPickerColor,
} from "../utils/emitter";
import { snapPoint } from "../utils/snapPoint";
import { getStrokeColorByType } from "@freehand-draw/store/strokeStorage";

const BottomSheet = () => {
  const { width, height } = useCustomDimensions();

  const translateY = useSharedValue<number>(0);
  const offsetY = useSharedValue<number>(0);
  const keyboardHeight = useSharedValue<number>(0);

  const color = useSharedValue<RGB>([0, 255, 255]);
  const opacity = useSharedValue<number>(1);
  const activeSelector = useSharedValue<0 | 1 | 2>(0);
  const slidertranslateX = useSharedValue<number>(0);

  function close() {
    "worklet";

    translateY.value = withTiming(0, undefined, () => {
      activeSelector.value = 0;
      slidertranslateX.value = 0;
    });
  }

  const pan = Gesture.Pan()
    .onStart(() => {
      offsetY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = clamp(offsetY.value + e.translationY, -1 * height, 0);
    })
    .onEnd((e) => {
      const to = snapPoint(translateY.value, e.velocityY, [-1 * height, 0]);
      translateY.value = withTiming(to, undefined, () => {
        if (to !== 0) return;

        activeSelector.value = 0;
        slidertranslateX.value = 0;
      });
    });

  const bottomSheetStyles = useAnimatedStyle(
    () => ({
      transform: [
        { translateY: height },
        { translateY: translateY.value - keyboardHeight.value },
      ],
    }),
    [height, translateY, keyboardHeight],
  );

  const selectorStyles = useAnimatedStyle(
    () => ({
      transform: [{ translateX: slidertranslateX.value }],
    }),
    [slidertranslateX],
  );

  useEffect(() => {
    const didShow = Keyboard.addListener("keyboardDidShow", (e) => {
      keyboardHeight.value = e.endCoordinates.height;
    });

    const didHide = Keyboard.addListener("keyboardDidHide", () => {
      keyboardHeight.value = 0;
    });

    return () => {
      didShow.remove();
      didHide.remove();
    };
  }, [keyboardHeight]);

  useEffect(() => {
    const strokeColor = getStrokeColorByType("simple");
    if (strokeColor !== undefined) {
      const channels = parseRGBA(strokeColor);
      color.value = [channels.r, channels.g, channels.b];
    }
  }, [color]);

  useEffect(() => {
    const openSub = listenToOpenSheetEvent(() => {
      translateY.value = withTiming(-1 * height);
    });

    return () => openSub.remove();
  }, [height, translateY]);

  useEffect(() => {
    const updateColorSub = listenToUpdateColorPickerColor((rgba) => {
      const channels = parseRGBA(rgba);

      color.value = [channels.r, channels.g, channels.b];
    });

    return () => updateColorSub.remove();
  }, [color, opacity]);

  return (
    <Animated.View style={[{ width, height }, styles.root, bottomSheetStyles]}>
      <Pressable
        style={{ width, height, position: "absolute", cursor: "auto" }}
        onPress={close}
      />

      <View style={styles.sheet}>
        <GestureDetector gesture={pan}>
          <Animated.View style={styles.dragable}>
            <View style={styles.knob} />
          </Animated.View>
        </GestureDetector>

        <Animated.View style={[styles.pickers, selectorStyles]}>
          <Grid color={color} activeSelector={activeSelector} />
          <Gama color={color} activeSelector={activeSelector} />
          <Sliders color={color} activeSelector={activeSelector} />
        </Animated.View>

        <OpacitySlider color={color} opacity={opacity} />

        <Controls
          color={color}
          opacity={opacity}
          activeSelector={activeSelector}
          selectorWidth={width}
          translateX={slidertranslateX}
          translateY={translateY}
        />
      </View>
    </Animated.View>
  );
};

BottomSheet.displayName = "BottomSheet";

const styles = StyleSheet.create({
  root: {
    justifyContent: "flex-end",
    position: "absolute",
    overflow: "hidden",
  },
  sheet: {
    width: "100%",
    borderTopRightRadius: theme.spacing.m / 2,
    borderTopLeftRadius: theme.spacing.m / 2,
    backgroundColor: "#252525",
  },
  dragable: {
    paddingTop: theme.spacing.m / 2,
    paddingBottom: theme.spacing.m,
    justifyContent: "center",
    alignItems: "center",
  },
  knob: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#5B5B5B",
  },
  pickers: {
    flexDirection: "row",
  },
});

export default React.memo(BottomSheet, () => true);
