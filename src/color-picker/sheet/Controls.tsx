import React from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Keyboard,
  LayoutChangeEvent,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  SharedValue,
  useAnimatedRef,
  runOnUI,
  measure,
} from "react-native-reanimated";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { theme } from "@commons/theme";

import {
  emitOpenEyedropperEvent,
  emitSelectedColorEvent,
} from "../utils/emitter";
import type { RGB } from "../utils/types";

type ControlsProps = {
  selectorWidth: number;
  color: SharedValue<RGB>;
  opacity: SharedValue<number>;
  activeSelector: SharedValue<0 | 1 | 2>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
};

type TextLayoutInfo = {
  width: number;
  x: number;
};

const INDICATOR_SIZE = 5;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Controls: React.FC<ControlsProps> = ({
  color,
  opacity,
  activeSelector,
  translateX,
  translateY,
  selectorWidth,
}) => {
  const indicatorTranslateX = useSharedValue<number>(0);

  const gridRef = useAnimatedRef();
  const gammaRef = useAnimatedRef();
  const sliderRef = useAnimatedRef();

  const textWidth = useSharedValue<number>(0);
  const gridText = useSharedValue<TextLayoutInfo>({ width: 0, x: 0 });
  const gammaText = useSharedValue<TextLayoutInfo>({ width: 0, x: 0 });
  const sliderText = useSharedValue<TextLayoutInfo>({ width: 0, x: 0 });

  function mesaureText(e: LayoutChangeEvent, index: number) {
    const { width, x } = e.nativeEvent.layout;

    if (index === 0) {
      textWidth.value = width;
      gridText.value = { width, x };
    }

    if (index === 1) gammaText.value = { width, x };
    if (index === 2) sliderText.value = { width, x };
  }

  function animateIndicatorTransition(index: number) {
    runOnUI(() => {
      "worklet";

      const gridMeasure = measure(gridRef)!;
      const gammaMeasure = measure(gammaRef)!;
      const sliderMeasure = measure(sliderRef)!;

      let toX = 0;
      let toTextWidth = gridText.value.width;
      if (index === 1) {
        const textDiff = gammaMeasure.width - gridMeasure.width;
        toX = gammaMeasure.pageX - gridMeasure.pageX + textDiff / 2;
        toTextWidth = gammaMeasure.width;
      }

      if (index === 2) {
        const textDiff = sliderMeasure.width - gridMeasure.width;
        toX = sliderMeasure.pageX - gridMeasure.pageX + textDiff / 2;
        toTextWidth = sliderMeasure.width;
      }

      indicatorTranslateX.value = withTiming(toX);
      textWidth.value = withTiming(toTextWidth);
    })();
  }

  function onSelectorPress(index: number) {
    activeSelector.value = index as 0 | 1 | 2;
    translateX.value = withTiming(-1 * index * selectorWidth);
    animateIndicatorTransition(index);
  }

  function openEyeDropper() {
    translateY.value = withTiming(0, undefined, () => {
      translateX.value = 0;
      activeSelector.value = 0;

      runOnJS(emitOpenEyedropperEvent)();
    });
  }

  function selectColor() {
    const [r, g, b] = color.value;
    const newColor = `rgba(${r}, ${g}, ${b}, ${opacity.value})`;

    Keyboard.dismiss();
    emitSelectedColorEvent(newColor);
    translateY.value = withTiming(0, undefined, () => {
      translateX.value = 0;
      activeSelector.value = 0;
      indicatorTranslateX.value = 0;
      textWidth.value = gridText.value.width;
    });
  }

  const inidicatorStyles = useAnimatedStyle(() => {
    return {
      width: textWidth.value,
      transform: [
        { translateY: theme.spacing.m / 2 },
        { translateX: indicatorTranslateX.value },
      ],
    };
  }, [textWidth, indicatorTranslateX]);

  return (
    <View style={styles.root}>
      <Pressable onPress={openEyeDropper}>
        <Icon name="eyedropper" size={24} color={"#fff"} />
      </Pressable>

      <AnimatedPressable
        ref={gridRef}
        hitSlop={7}
        onPress={() => onSelectorPress(0)}
        onLayout={(e) => mesaureText(e, 0)}
        style={{ justifyContent: "flex-end" }}
      >
        <Text style={styles.text}>grid</Text>
        <Animated.View style={[styles.indicator, inidicatorStyles]} />
      </AnimatedPressable>

      <AnimatedPressable
        ref={gammaRef}
        hitSlop={7}
        onPress={() => onSelectorPress(1)}
        onLayout={(e) => mesaureText(e, 1)}
      >
        <Text style={styles.text}>gamma</Text>
      </AnimatedPressable>

      <AnimatedPressable
        ref={sliderRef}
        hitSlop={7}
        onLayout={(e) => mesaureText(e, 2)}
        onPress={() => onSelectorPress(2)}
      >
        <Text style={styles.text}>sliders</Text>
      </AnimatedPressable>

      <Pressable onPress={selectColor}>
        <Icon name="check" size={24} color={"#fff"} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.m,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    textTransform: "uppercase",
  },
  indicator: {
    height: INDICATOR_SIZE,
    backgroundColor: "#fff",
    borderTopRightRadius: INDICATOR_SIZE / 2,
    borderTopLeftRadius: INDICATOR_SIZE / 2,
    position: "absolute",
    alignSelf: "center",
  },
});

export default Controls;
