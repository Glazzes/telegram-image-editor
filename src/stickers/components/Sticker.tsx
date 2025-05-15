import React, { useEffect } from "react";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  measure,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { useImage } from "@shopify/react-native-skia";

import { useVector } from "@commons/hooks/useVector";
import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { Size, Vector } from "@commons/types";

import {
  emitOpenStickerContextEvent,
  listenToFlipStickerEvent,
} from "../utils/emitter";

import { useStickerStore } from "../store/stickerStore";
import { TAU, INITIAL_STICKER_SIZE } from "../utils/constants";
import { StickerState, StickerType } from "../utils/types";

type PanGestureEvent = GestureUpdateEvent<PanGestureHandlerEventPayload>;

type StickerProps = {
  sticker: StickerType;
  canvasSize: Size<number>;
};

const INDICATOR_SIZE = 20;
const HITSLOP = (44 - INDICATOR_SIZE) / 2;

const BORDER_RADIUS = INITIAL_STICKER_SIZE / 2;

const Sticker: React.FC<StickerProps> = ({ sticker, canvasSize }) => {
  const animatedRef = useAnimatedRef();
  const screenDimensions = useWindowDimensions();
  const customDimensions = useCustomDimensions();

  const { activeId, pressedRecord, stickerData } = useStickerStore();

  const source =
    Platform.OS === "web"
      ? // @ts-ignore
        `${location.protocol}//${location.host}${sticker.source.uri}`
      : sticker.source;

  const skiaSource = useImage(source as number);

  const translate = useVector(
    sticker.transform?.translate.x ?? 0,
    sticker.transform?.translate.y ?? 0,
  );
  const offset = useVector(0, 0);
  const bounceScale = useSharedValue<number>(1);
  const center = useVector(0, 0); // center of the sticker on the screen, absolute position

  const zIndex = useSharedValue<number>(999_999_999);
  const ringScale = useSharedValue<number>(1);
  const ringOpacity = useSharedValue<number>(1);

  const radius = useSharedValue<number>(sticker.radius ?? BORDER_RADIUS);
  const rotate = useSharedValue<number>(sticker.transform?.rotate ?? 0);
  const rotateY = useSharedValue<number>(sticker.transform?.rotateY ?? 0);

  function openStickerMenu(position: Vector<number>) {
    const startX = screenDimensions.width / 2 - customDimensions.width / 2;

    emitOpenStickerContextEvent({ x: position.x - startX, y: position.y });
  }

  function displayBorder(
    opacity: number,
    scaleValue: number,
    animate: boolean,
  ) {
    "worklet";

    ringOpacity.value = animate ? withTiming(opacity) : opacity;
    ringScale.value = animate ? withTiming(scaleValue) : scaleValue;
  }

  function onIndicatorPanStart() {
    "worklet";

    const measurement = measure(animatedRef)!;
    center.x.value = measurement.pageX + 0.5;
    center.y.value = measurement.pageY + 0.5;
  }

  function onIndicatorPanUpdate(
    e: PanGestureEvent,
    direction: "right" | "left",
  ) {
    "worklet";

    if (sticker.id !== activeId.value) {
      return;
    }

    const normalizedX = e.absoluteX - center.x.value;
    const normalizedY = -1 * (e.absoluteY - center.y.value);

    const currentRadius = Math.sqrt(normalizedX ** 2 + normalizedY ** 2);
    const angle = Math.atan2(normalizedY, normalizedX);

    // Both rings are the same, the only difference is the left one has an 180 degrees offset
    const acc = direction === "right" ? 0 : Math.PI;
    rotate.value = -1 * ((angle + acc + TAU) % TAU);
    radius.value = Math.max(BORDER_RADIUS / 2, currentRadius);
  }

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      activeId.value = sticker.id;
      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
    })
    .onChange((e) => {
      translate.x.value = offset.x.value + e.translationX;
      translate.y.value = offset.y.value + e.translationY;
    });

  const tap = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(onIndicatorPanStart)
    .onEnd(() => {
      if (activeId.value === sticker.id) {
        runOnJS(openStickerMenu)({ x: center.x.value, y: center.y.value });
        return;
      }

      activeId.value = sticker.id;
      displayBorder(1, 1, true);

      bounceScale.value = withRepeat(
        withTiming(0.9, {
          duration: 200,
          easing: Easing.bezier(0.26, 0.19, 0.42, 1.49),
        }),
        2,
        true,
      );
    });

  const rightIndicatorPan = Gesture.Pan()
    .hitSlop({ vertical: HITSLOP, horizontal: HITSLOP })
    .onStart(onIndicatorPanStart)
    .onUpdate((e) => onIndicatorPanUpdate(e, "right"));

  const leftIndicatorPan = Gesture.Pan()
    .hitSlop({ vertical: HITSLOP, horizontal: HITSLOP })
    .onStart(onIndicatorPanStart)
    .onUpdate((e) => onIndicatorPanUpdate(e, "left"));

  // @ts-ignore
  const stickerStyles = useAnimatedStyle(() => {
    const resizeScale = (radius.value * 2) / INITIAL_STICKER_SIZE;

    return {
      width: INITIAL_STICKER_SIZE,
      height: INITIAL_STICKER_SIZE,
      transform: [
        { rotate: `${rotate.value}rad` },
        { rotateY: `${rotateY.value}rad` },
        { scale: resizeScale },
        { scale: bounceScale.value },
      ],
    };
  }, [radius, rotate, rotateY, bounceScale]);

  const stickerContainerStyles = useAnimatedStyle(
    () => ({
      zIndex: zIndex.value,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
      ],
    }),
    [zIndex, translate],
  );

  const ringStyles = useAnimatedStyle(
    () => ({
      width: radius.value * 2,
      height: radius.value * 2,
      borderRadius: radius.value,
      opacity: ringOpacity.value,
      transform: [{ rotate: `${rotate.value}rad` }, { scale: ringScale.value }],
    }),
    [radius, ringOpacity, rotate, ringScale],
  );

  const leftIndicatorStyles = useAnimatedStyle(() => {
    const angle = rotate.value + Math.PI;
    const translateX = radius.value * Math.cos(angle);
    const translateY = radius.value * Math.sin(angle);

    return {
      opacity: ringOpacity.value,
      transform: [{ translateX }, { translateY }, { scale: ringScale.value }],
    };
  }, [radius, ringOpacity, rotate, ringScale]);

  const rightIndicatorStyles = useAnimatedStyle(() => {
    const translateX = radius.value * Math.cos(rotate.value);
    const translateY = radius.value * Math.sin(rotate.value);

    return {
      opacity: ringOpacity.value,
      transform: [{ translateX }, { translateY }],
    };
  }, [radius, ringOpacity, rotate, ringScale]);

  useDerivedValue(() => {
    if (sticker.id !== activeId.value) return;

    const state: StickerState = {
      id: sticker.id,
      source: sticker.source,
      skiaSource: skiaSource,
      radius: radius.value,
      transform: {
        rotate: rotate.value,
        rotateY: rotateY.value,
        translate: { x: translate.x.value, y: translate.y.value },
      },
    };

    stickerData.modify((prev) => {
      "worklet";

      // @ts-ignore
      prev[sticker.id] = state;
      return prev;
    });
  });

  useAnimatedReaction(
    () => activeId.value,
    (val) => {
      if (val !== undefined) {
        zIndex.value = pressedRecord.value.indexOf(sticker.id);
      }

      const isActive = val === sticker.id;
      displayBorder(isActive ? 1 : 0, isActive ? 1 : 0, isActive);
    },
    [activeId, pressedRecord],
  );

  useEffect(() => {
    const sub = listenToFlipStickerEvent((flipId) => {
      if (sticker.id !== flipId) return;

      const toAngle = rotateY.value === Math.PI ? 0 : Math.PI;
      rotateY.value = withTiming(toAngle);
    });

    return () => sub.remove();
  }, [sticker.id, rotateY]);

  return (
    <Animated.View
      style={[styles.stickerContainer, styles.center, stickerContainerStyles]}
    >
      <Animated.View
        style={[styles.ringContainer, styles.ring, styles.center, ringStyles]}
      />

      <Animated.View
        ref={animatedRef}
        collapsable={false}
        style={styles.measureDummy}
      />

      <GestureDetector gesture={Gesture.Race(pan, tap)}>
        <Animated.Image
          source={sticker.source}
          resizeMethod={"scale"}
          style={stickerStyles}
        />
      </GestureDetector>

      <GestureDetector gesture={leftIndicatorPan}>
        <Animated.View style={[styles.panIndicator, leftIndicatorStyles]} />
      </GestureDetector>

      <GestureDetector gesture={rightIndicatorPan}>
        <Animated.View style={[styles.panIndicator, rightIndicatorStyles]} />
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  stickerContainer: {
    width: INITIAL_STICKER_SIZE,
    height: INITIAL_STICKER_SIZE,
    position: "absolute",
  },
  ringContainer: {
    width: INITIAL_STICKER_SIZE,
    height: INITIAL_STICKER_SIZE,
    position: "absolute",
  },
  ring: {
    borderWidth: 3,
    borderColor: "#fff",
    borderStyle: "dashed",
    position: "absolute",
  },
  panIndicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: "#3366ff",
    position: "absolute",
  },
  measureDummy: {
    width: 1,
    height: 1,
    position: "absolute",
  },
});

export default React.memo(
  Sticker,
  (prev, next) => prev.sticker.id === next.sticker.id,
);
