import { create } from "zustand";

type Record = {
  id: string;
  type: "stroke" | "sticker" | "text";
};

type RecordStore = {
  record: Record[];
  add: (newRecord: Record) => void;
  pop: () => Record | undefined;
  deleteById: (id: string) => void;
  reset: () => void;
};

// Keeps a record of the order in which elements are added to the canvas by the user
export const useRecordStore = create<RecordStore>()((set, get) => {
  return {
    record: [],

    add(newRecord) {
      set((state) => ({ record: [...state.record, newRecord] }));
    },

    pop() {
      const history = get().record;
      const last = history.pop();

      set({ record: [...history] });
      return last;
    },

    deleteById(id) {
      set((state) => {
        const filtered = state.record.filter((record) => record.id !== id);
        return { record: filtered };
      });
    },

    reset() {
      set(() => ({ record: [] }));
    },
  };
});
