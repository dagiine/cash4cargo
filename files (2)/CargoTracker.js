

import { SHIPMENTS_URL, STATUS_ORDER, STATUS_META } from "./data.js";


export class Shipment {
  constructor({ trackCode, phone, status, weight, price }) {
    this.trackCode = trackCode;
    this.phone     = phone;
    this.status    = status;
    this.weight    = weight;   
    this.price     = price;    
  }


  get statusIndex() {
    return STATUS_ORDER.indexOf(this.status);
  }


  get meta() {
    return STATUS_META[this.status] ?? { icon: "help", color: "#94a3b8" };
  }

 
  get formattedPrice() {
    return this.price.toLocaleString("mn-MN") + " ₮";
  }

  // Хүргэгдсэн эсэх
  get isDelivered() {
    return this.status === "Олгогдсон";
  }
}


export class CargoTracker {
  #shipments = [];   

  
  async load() {
    const response = await fetch(SHIPMENTS_URL);
    if (!response.ok) throw new Error(`Сервер алдаа: ${response.status}`);
    const raw = await response.json();
    // map → raw объект бүрийг Shipment instance болгох
    this.#shipments = raw.map((item) => new Shipment(item));
    return this;
  }

  
  findByCode(code) {
    const q = code.trim().toUpperCase();
    return this.#shipments.filter(
      (s) => s.trackCode.toUpperCase() === q
    );
  }

  
  findByPhone(phone) {
    const q = phone.trim().replace(/\D/g, "");
    return this.#shipments.filter(
      (s) => s.phone.replace(/\D/g, "") === q
    );
  }

  
  summarise(list) {
    return list.reduce(
      (acc, s) => ({
        totalWeight: acc.totalWeight + s.weight,
        totalPrice:  acc.totalPrice  + s.price,
        count:       acc.count       + 1,
      }),
      { totalWeight: 0, totalPrice: 0, count: 0 }
    );
  }

  
  statusLabels(list) {
    return list
      .map((s) => `${s.meta.icon} ${s.status}`)
      .join(" · ");
  }

  
  pendingOnly(list) {
    return list.filter((s) => !s.isDelivered);
  }
}
