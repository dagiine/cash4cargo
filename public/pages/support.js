export default function support() {
  return `
    <div class="page-header">
      <h1>Тусламж</h1>
      <p>Түгээмэл асуудаг асуултууд болон танд хэрэгтэй мэдээллүүд</p>
    </div>

    <label class="search">
      <span class="material-symbols-outlined">search</span>
      <input type="search" id="faq-search" placeholder="Асуулт эсвэл хариултаар хайх..." />
    </label>

    <article class="faq-app">
      <nav class="categories" id="faq-categories" aria-label="FAQ ангилал"></nav>

      <section>
        <h2>Түгээмэл асуултууд</h2>
        <div id="faq-list" class="faq-list-public"></div>

        <p id="faq-no-results" style="display:none; color: var(--color-muted); text-align:center; padding: 32px 0;">
          Хайлтад тохирох асуулт олдсонгүй.
        </p>
      </section>
    </article>
  `;
}