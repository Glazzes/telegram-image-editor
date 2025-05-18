import React, { useState } from "react";
import { View } from "react-native";

import ShapeMenu from "./ShapeMenu";
import { ShapeMenuContext } from "./context";

type ShapeMenuProdiverProps = React.PropsWithChildren;

export const ShapeMenuProvider: React.FC<ShapeMenuProdiverProps> = (props) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const openMenu = () => {
    setShowMenu(true);
  };

  const dissmisMenu = () => {
    setShowMenu(false);
  };

  return (
    <ShapeMenuContext.Provider value={{ openMenu, dissmisMenu }}>
      <View style={{ flex: 1 }}>
        {props.children}
        {showMenu ? <ShapeMenu /> : null}
      </View>
    </ShapeMenuContext.Provider>
  );
};
