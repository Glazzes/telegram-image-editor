import { createContext } from "react";

type ShapeMenuContextType = {
  openMenu: () => void;
  dissmisMenu: () => void;
};

export const ShapeMenuContext = createContext<ShapeMenuContextType>(
  {} as ShapeMenuContextType,
);
