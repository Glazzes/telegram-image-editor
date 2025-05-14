import { create } from "zustand";

type Record = {
  id: string;
  type: "stroke" | "sticker" | "text";
};

type RecordStore = {
  record: Record[];
  push: (newRecord: Record) => void;
  pop: () => Record | undefined;
  reset: () => void;
};

// Keeps a record of the order in which elements are added to the canvas by the user
export const useRecordStore = create<RecordStore>()((set, get) => {
  return {
    record: [],

    push(newRecord) {
      set((state) => ({ record: [...state.record, newRecord] }));
    },

    pop() {
      const history = get().record;
      const last = history.pop();

      set({ record: [...history] });
      return last;
    },

    reset() {
      set(() => ({ record: [] }));
    },
  };
});
