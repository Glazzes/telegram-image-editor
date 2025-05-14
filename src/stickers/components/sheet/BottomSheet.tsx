import React, { forwardRef, useCallback, useImperativeHandle } from "react";
import { ListRenderItemInfo, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  clamp,
  scrollTo,
  useAnimatedRef,
  useAnimatedStyle,
  useAnimatedReaction,
  useSharedValue,
  withDecay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Constants from "expo-constants";

import { snapPoint } from "@commons/utils/physics";

import StickerPreview from "./StickerPreview";
import { BottomSheetRefType } from "./types";
import { images } from "../../utils/constants";
import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { theme } from "@commons/theme";

const COLUMS = 4;
const statusBarHeight = Constants.statusBarHeight
  ? Constants.statusBarHeight
  : theme.spacing.xl;

function keyExtractor(item: number, index: number) {
  return `item-${item}-index-${index}`;
}

const BottomSheet = (
  _: unknown,
  ref?: React.ForwardedRef<BottomSheetRefType>,
) => {
  const listRef = useAnimatedRef();
  const { width, height } = useCustomDimensions();

  const rootTranslate = useSharedValue<number>(height);
  const translate = useSharedValue<number>(height / 2);
  const offset = useSharedValue<number>(0);
  const contentHeight = useSharedValue<number>(0);

  const notchOpacity = useSharedValue<number>(1);

  const open = () => {
    "worklet";
    rootTranslate.value = withSpring(0);
  };

  const close = () => {
    "worklet";
    rootTranslate.value = withTiming(height, undefined, () => {
      translate.value = height / 2;
    });
  };

  const renderItem = useCallback((info: ListRenderItemInfo<number>) => {
    return <StickerPreview source={info.item} />;
  }, []);

  const onContentSizeChange = (_: number, ch: number) => {
    contentHeight.value = ch;
  };

  const getItemLayout = useCallback(
    (_: unknown, index: number) => {
      const itemSize = width / 4;
      return { index, length: itemSize, offset: itemSize * index };
    },
    [width],
  );

  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      cancelAnimation(translate);
      offset.value = translate.value;
    })
    .onUpdate((e) => {
      translate.value = offset.value + e.translationY;
    })
    .onEnd((e) => {
      if (translate.value > height / 2) {
        const points = [height / 2, height];
        const snap = snapPoint(translate.value, e.velocityY, points);

        if (snap === points[0]) translate.value = withSpring(snap);
        if (snap === points[1]) close();

        return;
      }

      const lowerBound =
        -1 * Math.max(0, contentHeight.value - height + statusBarHeight);
      translate.value = withDecay({
        velocity: e.velocityY,
        clamp: [lowerBound, height / 2],
      });
    });

  const rootAnimatedStyle = useAnimatedStyle(() => {
    return {
      width,
      height,
      zIndex: 999_999_999,
      transform: [{ translateY: rootTranslate.value }],
    };
  }, [width, height, rootTranslate]);

  const detectionAnimatedStyle = useAnimatedStyle(() => {
    const translateY = clamp(translate.value, 0, height);
    return { width, height, transform: [{ translateY }] };
  }, [width, height, translate]);

  useAnimatedReaction(
    () => translate.value,
    (value) => {
      const showNotch = value > statusBarHeight * 1.5;
      notchOpacity.value = withTiming(showNotch ? 1 : 0, { duration: 150 });

      const scroll = value > 0 ? 0 : -1 * value;
      scrollTo(listRef, 0, scroll, false);
    },
    [translate],
  );

  // Ref handling
  useImperativeHandle(ref, () => ({ open, close }));

  return (
    <Animated.View style={[rootAnimatedStyle, styles.absolute]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, detectionAnimatedStyle]}>
          <View style={styles.header}>
            <Animated.View
              style={[styles.headerNotch, { opacity: notchOpacity }]}
            />
          </View>
          <Animated.FlatList
            ref={listRef}
            data={images}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            scrollEnabled={false}
            numColumns={COLUMS}
            windowSize={3}
            initialNumToRender={30}
            onContentSizeChange={onContentSizeChange}
          />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  container: {
    backgroundColor: "#1F1F1F",
    borderTopLeftRadius: 16,
    borderTopEndRadius: 16,
    overflow: "hidden",
  },
  header: {
    height: statusBarHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  headerNotch: {
    width: "12.5%",
    height: 4,
    borderRadius: 4,
    backgroundColor: "#3F3F3F",
  },
});

export default forwardRef(BottomSheet);
