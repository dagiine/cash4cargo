// ===============================================
// TRACK CANCEL LOGIC
// Захиалга цуцлах event-ийг тусад нь салгасан файл.
// ===============================================

import { shipmentAPI } from "../api.js";

// <order-card> component-оос ирэх cancel-order event-ийг сонсоно.
export function bindCancelOrderEvent(resultsEl, getSession, reloadOrders) {
  resultsEl.addEventListener("cancel-order", async (event) => {
    const { id, code, button } = event.detail || {};
    const session = getSession();

    if (!session?.user?.phone) {
      alert("Захиалга цуцлахын тулд эхлээд нэвтэрнэ үү.");
      return;
    }

    if (!confirm(`${code} захиалгыг цуцлах уу?`)) return;

    try {
      button.disabled = true;
      button.textContent = "Цуцалж байна...";

      await shipmentAPI.cancel(id);
      await reloadOrders();
    } catch (err) {
      alert(err.message || "Захиалга цуцлахад алдаа гарлаа");
      button.disabled = false;
      button.textContent = "Захиалга цуцлах";
    }
  });
}
