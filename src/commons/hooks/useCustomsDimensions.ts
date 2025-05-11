import { Platform, useWindowDimensions } from "react-native";
import { Size } from "@commons/types";

const iphoneSEViewport: Size<number> = {
  width: 375,
  height: 667,
};

export const useCustomDimensions = (): Size<number> => {
  const dimensions = useWindowDimensions();

  if (Platform.OS === "web") {
    const aspectRatio = iphoneSEViewport.width / iphoneSEViewport.height;

    return {
      width: aspectRatio * dimensions.height,
      height: dimensions.height,
    };
  }

  return dimensions;
};
