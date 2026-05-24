// ===============================================
// TRACK HELPER FUNCTION-УУД
// Энд format, array болгох зэрэг жижиг туслах function-ууд байна.
// ===============================================

// Мөнгөн дүнг Монгол форматаар харуулна.
export function formatMoney(amount) {
  return Number(amount || 0).toLocaleString("mn-MN") + " ₮";
}

// Date-г уншигдах хэлбэрт оруулна.
export function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Backend array, object, эсвэл { shipments: [] } буцааж магадгүй.
// Тиймээс бүгдийг нь array болгож нэг хэвэнд оруулна.
export function toArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.shipments)) return data.shipments;
  if (Array.isArray(data?.data)) return data.data;
  if (data) return [data];
  return [];
}

// Track input дээр MN12345 гэж бичвэл MN-12345 болгоно.
export function cleanTrackInput(value) {
  let cleanedValue = String(value || "").trim().toUpperCase();

  if (/^MN\d{5}$/.test(cleanedValue)) {
    cleanedValue = cleanedValue.replace(/^MN/, "MN-");
  }

  return cleanedValue;
}

// Хяналтын код эсвэл утасны дугаарын төрлийг ялгана.
export function getSearchType(value) {
  if (/^MN-\d{5}$/.test(value)) return "code";
  if (/^[6-9]\d{7}$/.test(value)) return "phone";
  return "invalid";
}
