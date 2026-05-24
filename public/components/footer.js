const contactItems = [
  { icon: "call", html: `<a href="tel:+97699447176">99447176</a>`},
  { icon: "schedule", html: `Даваа–Баасан: 09:00–18:00<br>Бямба: 10:00–15:00<br>Ням: Амарна`},
  { icon: "location_on", html: 'Баянгол дүүрэг, 3-р хороо, 2-р хороолол, Замчид гудамж 72/2, Санхүү Бизнесийн дээд сургуулийн зүүн талд 72-р байр 1-р орц B1 давхар'},
  { icon: "language", html: `<a href="https://dagiine.github.io/cash4cargo" target="_blank">dagiine.github.io/cash4cargo</a>`}
];

function buildContactItems(items) {
  let html = "";

  items.forEach(function(item) {
    let iconHtml = "";

    iconHtml =
      `<span class="material-symbols-outlined">
        ${item.icon}
      </span>`;

    html += `
      <li class="footer-contact-item">
        ${iconHtml}
        <p>${item.html}</p>
      </li>
    `;
  });
  
  return html;
}

export function renderFooter() {
  return `
    <footer>
      <section class="footer-top">
        <section class="footer-brand">
          <a href="#/" class="logo">
            <span class="logo-icon">
              <img src="./pics/logo.png" alt="Cash 4 Cargo Logo"/>
            </span>
            Cash 4 Cargo
          </a>

          <p>Хятад Улсаас Монгол Улс руу найдвартай, хурдан мэргэжлийн үйлчилгээ.</p>
        </section>

        <address class="footer-contact">
          <ul>
            ${buildContactItems(contactItems)}
          </ul>
        </address>
      </section>

      <div class="footer-bottom">
        <small>© 2026 Cash 4 Cargo.Бүх эрх хуулиар хамгаалагдсан.</small>
      </div>
    </footer>
  `;
}