import React, {
  forwardRef,
  ForwardRefExoticComponent,
  RefAttributes,
  useImperativeHandle,
  useState,
} from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  clamp,
  FadeInUp,
  FadeOutDown,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
} from "react-native-reanimated";

import { useVector } from "@commons/hooks/useVector";
import { useSize } from "@commons/hooks/useSize";
import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { Vector } from "@commons/types";

import { StickerContextMenuRefType } from "../../utils/types";

type StickerContextMenuItemProps = {
  title: string;
  onPress: () => void;
};

const StickerContextMenuItem = (props: StickerContextMenuItemProps) => {
  return (
    <Pressable onPress={props.onPress}>
      <Text style={itemStyles.title}>{props.title}</Text>
    </Pressable>
  );
};

const itemStyles = StyleSheet.create({
  title: {
    textTransform: "uppercase",
    color: "#fff",
    fontWeight: "700",
  },
});

type ComponentType = ForwardRefExoticComponent<
  StickerContextMenuProps & RefAttributes<StickerContextMenuRefType>
> & { Item: typeof StickerContextMenuItem };

type StickerContextMenuProps = React.PropsWithChildren;

const StickerContextMenu = forwardRef<
  StickerContextMenuRefType,
  StickerContextMenuProps
>((props, ref) => {
  const { width: screenWidth, height: screenHeight } = useCustomDimensions();
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const initialPosition = -1 * Math.max(screenWidth, screenHeight);

  const menuSize = useSize(0, 0);
  const position = useVector(initialPosition);

  const onLayout = (e: LayoutChangeEvent) => {
    if (menuSize.width.value === 0 || menuSize.height.value === 0) {
      menuSize.width.value = e.nativeEvent.layout.width;
      menuSize.height.value = e.nativeEvent.layout.height;
      setIsOpen(false);
    }
  };

  const enter = (center: Vector<number>) => {
    const lower = 0;
    const boundX = screenWidth - menuSize.width.value;
    const boundY = screenHeight - menuSize.height.value;

    const menuPosX = center.x - menuSize.width.value / 2;
    const menuPosY = center.y - menuSize.height.value;

    runOnUI(() => {
      "worklet";

      position.x.value = clamp(menuPosX, lower, boundX);
      position.y.value = clamp(menuPosY, lower, boundY);

      runOnJS(setIsOpen)(true);
    })();
  };

  const exit = (callback?: () => void) => {
    callback?.();
    setIsOpen(false);
  };

  const animatedStyles = useAnimatedStyle(
    () => ({
      position: "absolute",
      top: position.y.value,
      left: position.x.value,
    }),
    [position],
  );

  useImperativeHandle(ref, () => ({ enter, exit }));

  if (!isOpen) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.menu, animatedStyles]}
      onLayout={onLayout}
    >
      {props.children}
    </Animated.View>
  );
}) as ComponentType;

StickerContextMenu.displayName = "StickerOptionsMenu";
StickerContextMenu.Item = StickerContextMenuItem;

const styles = StyleSheet.create({
  menu: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#1e1e1e",
  },
});

export default StickerContextMenu;
