export const createId = (prefix: string) =>
  `${prefix}_${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;

export const getDeviceId = () => {
  if (typeof window === "undefined") return "server";
  const existing = window.localStorage.getItem("muscle-os-device-id");
  if (existing) return existing;
  const id = createId("device");
  window.localStorage.setItem("muscle-os-device-id", id);
  return id;
};
