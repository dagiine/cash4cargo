// Footer дээр харагдах холбоо барих мэдээллүүдийг array-д хадгалж байна.
// icon → ямар icon гарахыг заана.
// html → тухайн item дээр харагдах текст эсвэл link байна.
const contactItems = [
  {
    icon: "call",
    html: `<a href="tel:+97699447176">99447176</a>`,
  },
  {
    icon: "schedule",
    html: `Даваа–Баасан: 09:00–18:00<br>Бямба: 10:00–15:00<br>Ням: Амарна`,
  },
  {
    icon: "language",
    html: `<a href="https://dagiine.github.io/cash4cargo" target="_blank">dagiine.github.io/cash4cargo</a>`,
  },
  {
    icon: "facebook-f",
    html: `<a href="https://facebook.com/cash4cargo" target="_blank">Cash 4 Cargo</a>`,
  },
];

// Холбоо барих item-уудыг HTML болгон хувиргах function.
// items гэдэг нь contactItems array байна.
function buildContactItems(items) {
  // Эцэст нь буцаах HTML string.
  let html = "";

  // forEach ашиглаж contactItems array доторх item бүрээр давтана.
  items.forEach(function (item) {
    // Тухайн item дээр харагдах icon-ийн HTML.
    let iconHtml = "";

    // Хэрэв icon нь facebook-f бол Font Awesome icon ашиглана.
    // Учир нь facebook icon Material Symbols дээр байхгүй.
    if (item.icon === "facebook-f") {
      iconHtml = `<span class="fa-brands fa-facebook-f"></span>`;
    } 
    
    // Бусад icon-уудыг Material Symbols ашиглаж харуулна.
    else {
      iconHtml = `
        <span class="material-symbols-outlined">
          ${item.icon}
        </span>
      `;
    }

    // Нэг contact item-ийн HTML үүсгээд html хувьсагч дээр нэмнэ.
    html += `
      <li class="footer-contact-item">
        ${iconHtml}
        <p>${item.html}</p>
      </li>
    `;
  });

  // Бүх contact item-уудын HTML-ийг буцаана.
  return html;
}

// Footer-ийн бүтэн HTML-ийг буцаах function.
export function renderFooter() {
  return `
    <footer>
      
      <!-- Footer-ийн дээд хэсэг -->
      <!-- Энд brand хэсэг болон contact хэсэг байна -->
      <section class="footer-top">
        
        <!-- Brand хэсэг: logo + тайлбар текст -->
        <section class="footer-brand">
          
          <!-- Logo дээр дарахад home page руу очно -->
          <a href="#/" class="logo">
            <span class="logo-icon">
              <img src="./pics/logo.png" alt="Cash 4 Cargo Logo"/>
            </span>
            Cash 4 Cargo
          </a>

          <!-- Сайтын богино танилцуулга -->
          <p>
            Хятад Улсаас Монгол Улс руу найдвартай, хурдан мэргэжлийн үйлчилгээ.
          </p>
        </section>

        <!-- Холбоо барих мэдээллийн хэсэг -->
        <!-- address tag нь холбоо барих мэдээлэлд semantic зөв tag -->
        <address class="footer-contact">
          <ul>
            ${buildContactItems(contactItems)}
          </ul>
        </address>
      </section>

      <!-- Footer-ийн доод хэсэг -->
      <!-- Copyright text -->
      <div class="footer-bottom">
        <small>
          © 2026 Cash 4 Cargo. Бүх эрх хуулиар хамгаалагдсан.
        </small>
      </div>
    </footer>
  `;
}