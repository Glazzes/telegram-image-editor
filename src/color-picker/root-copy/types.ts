import { SkImage } from "@shopify/react-native-skia";

export interface RootCopyRef {
  takeSnapshot: () => Promise<SkImage>;
}
