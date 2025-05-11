import { useContext } from "react";
import { ShapeMenuContext } from "./context";

export const useShapeMenu = () => {
  const { openMenu, dissmisMenu } = useContext(ShapeMenuContext);
  if (openMenu === undefined || dissmisMenu === undefined) {
    throw new Error(
      "useShapeMenu hook must be used within the context of ShapeMenuProvider",
    );
  }

  return { openMenu, dissmisMenu };
};
