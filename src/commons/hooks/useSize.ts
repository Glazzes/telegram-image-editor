import { SharedValue, useSharedValue } from "react-native-reanimated";

import { Size } from "@commons/types";

export const useSize = (
  width: number,
  height: number,
): Size<SharedValue<number>> => {
  const width1 = useSharedValue<number>(width);
  const height1 = useSharedValue<number>(height);

  return { width: width1, height: height1 };
};
