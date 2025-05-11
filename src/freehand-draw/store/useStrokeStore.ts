import { create } from "zustand";

import { Stroke } from "../types";

type StrokeStore = {
  strokes: Stroke[];
  activeStrokeType: Stroke["type"];
  addStroke: (stroke: Stroke) => void;
  deleteStrokeById: (id: string) => void;
  deleteAllStrokes: () => void;
  setActiveStrokeType: (type: Stroke["type"]) => void;
};

export const useStrokeStore = create<StrokeStore>()((set) => {
  return {
    activeStrokeType: "simple",
    strokes: [],

    addStroke(stroke) {
      set((state) => {
        const newStrokes = [...state.strokes, stroke];
        return { strokes: newStrokes };
      });
    },

    deleteStrokeById(id) {
      set((state) => {
        const filtered = state.strokes.filter((stroke) => stroke.id !== id);
        return { strokes: filtered };
      });
    },

    deleteAllStrokes() {
      set(() => ({ strokes: [] }));
    },

    setActiveStrokeType(type) {
      set(() => ({ activeStrokeType: type }));
    },
  };
});
