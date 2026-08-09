export const kgToLb = (kg: number) => Math.round(kg * 2.2046226218 * 10) / 10;
export const lbToKg = (lb: number) => Math.round((lb / 2.2046226218) * 10) / 10;
export const rirToRpe = (rir: number) => 10 - rir;
export const rpeToRir = (rpe: number) => 10 - rpe;
