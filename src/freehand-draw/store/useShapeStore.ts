import { create } from "zustand";

export type Shape = "circle" | "star" | "arrow";

type ShapeStore = {
  shapeTypes: Shape[];
  addShapeType: (shape: Shape) => void;
  resetShapeStore: () => void;
};
/*
 * This store records the order in which new shapes (not strokes) are added, this store is neccesary
 * because on adding a second shape of the same type, the shape preview must be reseted and
 * then send its stroke to the stroke store.
 */
export const useShapeStore = create<ShapeStore>()((set) => ({
  shapeTypes: [],
  addShapeType(shape) {
    set((state) => ({ shapeTypes: [...state.shapeTypes, shape] }));
  },
  resetShapeStore() {
    set(() => ({ shapeTypes: [] }));
  },
}));
