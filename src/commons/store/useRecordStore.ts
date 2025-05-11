import { create } from "zustand";

type Record = {
  id: string;
  type: "stroke" | "sticker" | "text";
};

type RecordStore = {
  record: Record[];
  pushToRecord: (newRecord: Record) => void;
  popFromRecord: () => Record | undefined;
  resetRecord: () => void;
};

// Keeps a record of the order in which elements are added to the canvas by the user
export const useRecordStore = create<RecordStore>()((set, get) => {
  return {
    record: [],

    pushToRecord(newRecord) {
      set((state) => ({ record: [...state.record, newRecord] }));
    },

    popFromRecord() {
      const history = get().record;
      const last = history.pop();

      set({ record: [...history] });
      return last;
    },

    resetRecord() {
      set(() => ({ record: [] }));
    },
  };
});
