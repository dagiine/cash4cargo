// ===============================================
// FAQ хэсэг дээр нэг асуулт, хариултын item харуулна.
// ===============================================

// HTMLElement-ээс удамшуулж өөрийн custom element үүсгэж байна.
class FaqItem extends HTMLElement {
  // connectedCallback нь component HTML дээр гарч ирэх үед автоматаар ажилладаг.
  connectedCallback() {
    // question attribute-аас асуултын текстийг авна.
    // Хэрэв question attribute байхгүй бол default-аар "Асуулт" гэж харуулна.
    const question = this.getAttribute("question") || "Асуулт";

    // answer attribute-аас хариултын текстийг авна.
    // Хэрэв answer байхгүй бол хоосон string байна.
    const answer = this.getAttribute("answer") || "";

    // category attribute-аас тухайн FAQ аль ангилалд хамаарахыг авна.
    // Жишээ: "Захиалга", "Төлбөр", "Хүргэлт"
    // Хэрэв category байхгүй бол default-аар "Захиалга" гэж авна.
    const category = this.getAttribute("category") || "Захиалга";

    // Component-ийн дотор харагдах HTML-ийг үүсгэж байна.
    this.innerHTML = `
      <!-- data-category нь FAQ-г ангиллаар filter хийхэд ашиглагдана -->
      <article data-category="${category}">
        
        <!-- details tag нь нээгдэж/хаагддаг dropdown хэсэг үүсгэнэ -->
        <details>
          
          <!-- summary tag дээр асуулт харагдана -->
          <!-- Хэрэглэгч summary дээр дарахад answer хэсэг нээгдэнэ -->
          <summary>${question}</summary>
          
          <!-- p tag дотор тухайн асуултын хариулт харагдана -->
          <p>${answer}</p>
        </details>
      </article>
    `;
  }
}

// "faq-item" нэртэй custom element өмнө нь бүртгэгдсэн эсэхийг шалгана.
// Ингэж шалгахгүй бол нэг component дахин define хийгдэх үед browser error өгдөг.
if (!customElements.get("faq-item")) {
  // <faq-item></faq-item> гэсэн өөрийн HTML tag-г browser-д бүртгэж байна.
  customElements.define("faq-item", FaqItem);
}