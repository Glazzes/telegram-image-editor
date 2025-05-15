import { create } from "zustand";

import { Stroke } from "../types";

type StrokeStore = {
  strokes: Stroke[];
  activeType: Stroke["type"];
  add: (stroke: Stroke) => void;
  deleteById: (id: string) => void;
  reset: () => void;
  setActiveType: (type: Stroke["type"]) => void;
};

export const useStrokeStore = create<StrokeStore>()((set) => {
  return {
    activeType: "simple",
    strokes: [],

    add(stroke) {
      set((state) => {
        const newStrokes = [...state.strokes, stroke];
        return { strokes: newStrokes };
      });
    },

    deleteById(id) {
      set((state) => {
        const filtered = state.strokes.filter((stroke) => stroke.id !== id);
        return { strokes: filtered };
      });
    },

    reset() {
      set(() => ({ strokes: [] }));
    },

    setActiveType(type) {
      set(() => ({ activeType: type }));
    },
  };
});
