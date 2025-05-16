import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { version } from "canvaskit-wasm/package.json";

export default function App() {
  return (
    <View style={styles.container}>
      <WithSkiaWeb
        opts={{
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${version}/bin/full/${file}`,
        }}
        getComponent={() => require("../TestComponent")}
        fallback={<Text>Loading...</Text>}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
