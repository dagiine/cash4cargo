export const API_BASE = window.API_BASE || "/api";

export const STATUS_ORDER = [
  "Захиалга үүсгэсэн",
  "Хятадын агуулахад",
  "Замын Үүд дээр",
  "Улаанбаатарт ирсэн",
  "Олгогдсон",
];

export const STATUS = {
  "Захиалга үүсгэсэн": { icon: "send", color: "#f59e0b" },
  "Хятадын агуулахад": { icon: "inventory_2", color: "#3b82f6" },
  "Замын Үүд дээр": { icon: "local_shipping", color: "#8b5cf6" },
  "Улаанбаатарт ирсэн": { icon: "warehouse", color: "#10b981" },
  "Олгогдсон": { icon: "check_circle", color: "#22c55e" },
};
