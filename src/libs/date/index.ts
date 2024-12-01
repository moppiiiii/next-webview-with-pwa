import { TIME_OF_DAY } from "@/stores/time-of-day/constants";

/**
 * 数値を2桁の文字列にフォーマットするヘルパー関数
 * @param num 数値
 * @returns 2桁の文字列
 */
export const padZero = (num: number): string => {
  return num.toString().padStart(2, "0");
};

/**
 * 現在の時間を取得
 * @returns 現在の時間 (形式: HH:mm)
 */
export const getCurrentHour = (): number => {
  const now = new Date();
  const hours = now.getHours();
  return hours;
};

/**
 * 時間帯の分類を取得
 * @param currentHour 現在の時間
 * @returns 時間帯の分類
 */
export const getTimeOfDay = (currentHour: number) => {
  // タイムゾーンの分類
  if (currentHour >= 5 && currentHour < 12) {
    return TIME_OF_DAY.MORNING;
  }

  if (currentHour >= 12 && currentHour < 18) {
    return TIME_OF_DAY.EVENING;
  }

  if (currentHour >= 18 && currentHour < 4) {
    return TIME_OF_DAY.NIGHT;
  }

  // 19時以上または5時未満の場合
  return TIME_OF_DAY.MORNING;
};
