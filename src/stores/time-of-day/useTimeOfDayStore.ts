import { create } from "zustand";
import { TIME_OF_DAY } from "./constants";

type TimeOfDay = (typeof TIME_OF_DAY)[keyof typeof TIME_OF_DAY];

interface TimeOfDayState {
  currentTime: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
}

const useTimeOfDayStore = create<TimeOfDayState>((set) => ({
  currentTime: TIME_OF_DAY.MORNING,
  setTimeOfDay: (time: TimeOfDay) => set({ currentTime: time }),
}));

export default useTimeOfDayStore;
