import { create } from "zustand";

type ModalHelper = {
  finalImage: string;
  setFinalImage: (image: string) => void;
};

// This thing is used to avoid pasting the base64 into the url of the browser as it is very
// heavy causing issues for the browser to load the modal correctly
export const useModalHelper = create<ModalHelper>()((set) => ({
  finalImage: "",
  setFinalImage(image) {
    set(() => ({ finalImage: image }));
  },
}));
