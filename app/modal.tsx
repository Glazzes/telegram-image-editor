import React, { useEffect } from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
} from "react-native";
import { useModalHelper } from "@commons/hooks/useModalHelper";
import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { theme } from "@commons/theme";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

type modalProps = {};

function handleSaveWeb(image: string) {
  const a = document.createElement("a");
  a.href = image;
  a.setAttribute("download", "image.png");

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
}

const modal: React.FC<modalProps> = ({}) => {
  const router = useRouter();
  const modalHelper = useModalHelper();
  const { width, height } = useCustomDimensions();

  const scale = useSharedValue<number>(0);
  const menuStyles = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  }, [scale]);

  function save() {
    if (Platform.OS === "web") {
      handleSaveWeb(modalHelper.finalImage);
    }

    dismiss();
  }

  function dismiss() {
    const canGoBack = router.canGoBack();
    if (canGoBack) {
      scale.value = withTiming(0, undefined, () => {
        runOnJS(router.back)();
      });
    }
  }

  useEffect(() => {
    scale.value = withDelay(
      100,
      withTiming(1, { easing: Easing.bezier(0.49, 0, 0.29, 1.59) }),
    );
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View
        style={[
          { width, height, backgroundColor: "rgba(0, 0, 0, 0.3)" },
          styles.center,
        ]}
      >
        <Animated.View
          style={[{ width: width * 0.8 }, styles.modal, menuStyles]}
        >
          <Image
            source={{ uri: modalHelper.finalImage }}
            style={[{ height: width * 0.4 }, styles.image]}
          />

          <Text style={styles.title}>Changes Saved</Text>
          <Text style={styles.text}>
            A base64 image will be copied to your clipboard, you can visualize
            it in a base64 online viewer or download it as a PNG image.
          </Text>

          <View style={styles.buttonContainer}>
            <Pressable onPress={save}>
              <Text style={styles.button}>Download</Text>
            </Pressable>

            <Pressable onPress={dismiss}>
              <Text style={styles.button}>Dismiss</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.spacing.s,
    padding: theme.spacing.l,
    gap: theme.spacing.m,
  },
  image: {
    width: "100%",
    borderRadius: theme.spacing.s,
  },
  title: {
    color: "#eeeeee",
    fontSize: 18,
    fontWeight: "600",
  },
  text: {
    color: "#b3b3b5",
    fontSize: 15,
    fontWeight: "heavy",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.xl,
  },
  button: {
    color: "#92CED7",
    fontWeight: "bold",
  },
});

export default modal;
