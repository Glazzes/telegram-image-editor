import React, { useState } from "react";
import { View } from "react-native";

import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";

import ShapeMenu from "./ShapeMenu";
import { ShapeMenuContext } from "./context";

type ShapeMenuProdiverProps = React.PropsWithChildren;

export const ShapeMenuProvider: React.FC<ShapeMenuProdiverProps> = (props) => {
  const { width, height } = useCustomDimensions();

  const [showMenu, setShowMenu] = useState<boolean>(false);

  const openMenu = () => {
    setShowMenu(true);
  };

  const dissmisMenu = () => {
    setShowMenu(false);
  };

  return (
    <ShapeMenuContext.Provider value={{ openMenu, dissmisMenu }}>
      <View style={{ width, height }}>
        {props.children}
        {showMenu ? <ShapeMenu /> : null}
      </View>
    </ShapeMenuContext.Provider>
  );
};
