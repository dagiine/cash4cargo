// ===============================================
// STATUS BADGE WEB COMPONENT
// Нэг component 3 өөр байдлаар харагдана:
// variant="home"     -> Нүүр хуудасны алхам
// variant="timeline" -> Захиалгын timeline алхам
// variant="header"   -> Захиалгын card-ийн дээд төлөв
// ===============================================

class StatusBadge extends HTMLElement {
  connectedCallback() {
    // Component дээр бичсэн attribute-уудыг уншина.
    const variant = this.getAttribute("variant") || "home";
    const icon = this.getAttribute("icon") || "circle";
    const status = this.getAttribute("status") || "Төлөв";
    const description = this.getAttribute("description") || "";
    const date = this.getAttribute("date") || "";
    const state = this.getAttribute("state") || "";

    // variant-аас хамаарч өөр template зурна.
    if (variant === "timeline") {
      this.innerHTML = this.timelineTemplate(icon, status, date, state);
      return;
    }

    if (variant === "header") {
      this.innerHTML = this.headerTemplate(status, date);
      return;
    }

    // Default нь home variant.
    this.innerHTML = this.homeTemplate(icon, status, description);
  }

  // Нүүр хуудасны step badge.
  homeTemplate(icon, status, description) {
    return `
      <article class="status-badge status-badge--home step">
        <div class="step-icon">
          <span class="material-symbols-outlined">${icon}</span>
        </div>
        <span class="step-label">${status}</span>
        <p>${description}</p>
      </article>
    `;
  }

  // Захиалгын card-ийн дээд талын төлөв.
  // Icon, border, background ашиглахгүй.
  // Status болон шинэчлэгдсэн огноо 2 тусдаа мөрөөр гарна.
  headerTemplate(status, date) {
    return `
      <div class="status-badge status-badge--header">
        <strong class="status-badge__status">${status}</strong>
        ${date ? `<span class="status-badge__date">Шинэчлэгдсэн: ${date}</span>` : ""}
      </div>
    `;
  }

  // Захиалгын timeline дээрх нэг status badge.
  timelineTemplate(icon, status, date, state) {
    return `
      <li class="status-badge status-badge--timeline step ${state}">
        <span class="step-icon material-symbols-outlined">${icon}</span>
        <span class="status-badge__text">
          <span class="step-label">${status}</span>
          <small class="step-date">${date || "..."}</small>
        </span>
      </li>
    `;
  }
}

// Component-ийг нэг л удаа бүртгэнэ.
if (!customElements.get("status-badge")) {
  customElements.define("status-badge", StatusBadge);
}
