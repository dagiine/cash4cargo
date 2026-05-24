// ===============================================
// SHIPMENT MODEL
// Backend-ээс ирсэн shipment data-г frontend-д ашиглахад амар object болгоно.
// Шинэ nested JSON болон хуучин backend structure хоёуланг нь уншина.
// ===============================================

import { CANCEL_ALLOWED_STATUSES, DEFAULT_STATUS_META, STATUS_MAP, STATUS_ORDER } from "./trackConstants.js";
import { formatDate, formatMoney } from "./trackHelpers.js";

export class Shipment {
  constructor(data = {}) {
    const customer = data.customer || {};
    const packageInfo = data.package || {};
    const shipping = data.shipping || {};
    const payment = data.payment || {};
    const timestamps = data.timestamps || {};

    this.raw = data;
    this.id = data._id || data.id || "";
    this.trackCode = data.tracking_code || data.trackCode || "";

    this.customerName = customer.name || data.receiver_name || data.sender_name || "Захиалагч";
    this.phone = customer.phone || data.user_phone || data.receiver_phone || data.phone || "";
    this.email = customer.email || data.email || "";

    this.status = shipping.status || data.status || "Захиалга үүсгэсэн";
    this.statusHistory = shipping.statusHistory || data.status_history || [];

    this.weight = Number(packageInfo.weight ?? data.total_weight ?? data.weight ?? 0);
    this.length = Number(packageInfo.length ?? data.length ?? 0);
    this.width = Number(packageInfo.width ?? data.width ?? 0);
    this.height = Number(packageInfo.height ?? data.height ?? 0);
    this.description = packageInfo.description || data.description || "";
    this.category = packageInfo.category || data.category || "";

    this.from = shipping.from || data.origin_country || "Хятад агуулах";
    this.to = shipping.to || data.destination_country || "Улаанбаатар";
    this.method = shipping.method || data.method || "Стандарт";

    this.price = Number(payment.price ?? data.shipping_price ?? data.price ?? 0);
    this.paid = Boolean(payment.paid ?? data.payment_status === "Төлөгдсөн");
    this.paymentMethod = payment.paymentMethod || data.payment_method || "";
    this.paidDate = payment.paidDate || data.paid_date || "";

    this.createdAt = timestamps.createdAt || data.createdAt || "";
    this.updatedAt = timestamps.updatedAt || data.updatedAt || "";

    this.items = this.getItems(data.items, packageInfo);
  }

  // Items array-г нэг ижил format болгоно.
  getItems(items, packageInfo) {
    if (Array.isArray(items) && items.length) {
      return items.map((item) => ({
        name: item.item_name || item.name || item.description || "Бараа",
        quantity: Number(item.quantity || item.qty || 1),
        description: item.description || "",
      }));
    }

    if (packageInfo.description || packageInfo.category) {
      return [{
        name: packageInfo.description || "Бараа",
        quantity: 1,
        description: packageInfo.category || "",
      }];
    }

    return [];
  }

  get statusIndex() {
    const index = STATUS_ORDER.indexOf(this.status);
    return index >= 0 ? index : 0;
  }

  get meta() {
    return STATUS_MAP.get(this.status) || DEFAULT_STATUS_META;
  }

  get formattedPrice() {
    return formatMoney(this.price);
  }

  get hasWeight() {
    return Number(this.weight) > 0;
  }

  get hasPrice() {
    return Number(this.price) > 0;
  }

  get isDelivered() {
    return this.status === "Олгогдсон";
  }

  get isCanceled() {
    return this.status === "Цуцлагдсан";
  }

  get canCancel() {
    return this.id && CANCEL_ALLOWED_STATUSES.includes(this.status);
  }

  get statusUpdatedText() {
    return this.getStatusDate(this.status);
  }

  // Status бүрийн шинэчлэгдсэн огноог history дотроос хайна.
  getStatusDate(statusName) {
    const history = Array.isArray(this.statusHistory) ? this.statusHistory : [];
    const found = [...history].reverse().find((item) => item.status === statusName);

    if (found?.updatedAt || found?.date) {
      return formatDate(found.updatedAt || found.date);
    }

    if (statusName === "Захиалга үүсгэсэн") {
      return formatDate(this.createdAt);
    }

    if (statusName === this.status) {
      return formatDate(this.updatedAt || this.createdAt);
    }

    return "...";
  }
}
