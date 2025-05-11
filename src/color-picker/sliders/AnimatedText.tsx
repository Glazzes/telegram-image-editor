import React, { useState } from "react";
import { Platform, TextInput, KeyboardTypeOptions } from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedReaction,
  type SharedValue,
} from "react-native-reanimated";

type AnimatedTextProps = {
  text: SharedValue<string>;
  keyboardType: KeyboardTypeOptions;
  onChangeText: (
    text: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
  ) => void;
  style: any[];
};

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  style,
  keyboardType,
  onChangeText,
}) => {
  const [textValue, setTextValue] = useState<string>(text.value);

  const animatedProps = useAnimatedProps(
    () => ({
      text: text.value,
    }),
    [text],
  ) as any;

  useAnimatedReaction(
    () => text.value,
    (val) => {
      if (Platform.OS === "web") {
        setTextValue(val);
      }
    },
    [text],
  );

  return (
    <AnimatedTextInput
      style={style}
      value={textValue}
      onChangeText={(text) => onChangeText(text, setTextValue)}
      keyboardType={keyboardType}
      animatedProps={animatedProps}
    />
  );
};

export default AnimatedText;
