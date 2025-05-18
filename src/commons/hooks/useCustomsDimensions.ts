import { Platform, useWindowDimensions } from "react-native";
import { Size } from "@commons/types";

const iphoneSEViewport: Size<number> = {
  width: 375,
  height: 667,
};

export const useCustomDimensions = (): Size<number> => {
  let dimensions = useWindowDimensions();
  dimensions.width = Math.max(1366);
  dimensions.height = Math.max(654);

  if (Platform.OS === "web" && dimensions.width > 420) {
    const aspectRatio = iphoneSEViewport.width / iphoneSEViewport.height;

    return {
      width: aspectRatio * dimensions.height,
      height: dimensions.height,
    };
  }

  return dimensions;
};
