// ===============================================
// CARGO TRACKER
// Backend API дууддаг хэсгийг тусад нь салгасан файл.
// ===============================================

import { shipmentAPI } from "../api.js";
import { Shipment } from "./Shipment.js";
import { toArray } from "./trackHelpers.js";

export class CargoTracker {
  // Track code-оор хайна.
  async findByCode(code) {
    const data = await shipmentAPI.trackByCode(code);
    return toArray(data).map((item) => new Shipment(item));
  }

  // Утасны дугаараар хайна.
  async findByPhone(phone) {
    const data = await shipmentAPI.trackByPhone(phone);
    return toArray(data).map((item) => new Shipment(item));
  }

  // Login хийсэн user-ийн өөрийн захиалгыг авна.
  async findMyShipments() {
    const data = await shipmentAPI.myShipments();
    return toArray(data).map((item) => new Shipment(item));
  }

  // Reduce ашиглаж нийт дүн гаргана.
  summarise(list) {
    return list.reduce(
      (acc, shipment) => ({
        count: acc.count + 1,
        totalWeight: acc.totalWeight + shipment.weight,
        totalPrice: acc.totalPrice + shipment.price,
      }),
      { count: 0, totalWeight: 0, totalPrice: 0 }
    );
  }

  // Filter ашиглаж дуусаагүй ачаануудыг ялгана.
  pendingOnly(list) {
    return list.filter((shipment) => !shipment.isDelivered && !shipment.isCanceled);
  }
}
