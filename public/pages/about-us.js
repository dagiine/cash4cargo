export default function about() {
  return `
    <section class="about-hero">
      <div class="about-hero__badge">
        <span class="material-symbols-outlined">bolt</span>
        Cash 4 Cargo
      </div>
      <h1>Бидний <span>тухай</span></h1>
      <p>Хятад Улсаас Монгол Улс руу найдвартай, хурдан, ил тод карго үйлчилгээ үзүүлж буй баг.</p>
    </section>

    <section class="about-overview">
      <div class="about-overview__text">
        <div class="about-kicker">Манай тухай</div>
        <h2>Монголын карго салбарт шинэ стандарт тавьж байна</h2>
        <p>Cash 4 Cargo нь Хятадын томоохон худалдааны сайтуудаас Монгол руу бараа тээвэрлэх үйлчилгээг хялбар, ил тод болгох зорилгоор үүсгэн байгуулагдсан.</p>
        <p>Бид гаалийн бичиг баримт, тээвэрлэлт, хяналтын систем зэрэг бүхий л үйл явцыг нэгтгэн нэг цэгийн шийдлийг санал болгодог.</p>
      </div>
      <div class="about-overview__cards">
        <div class="about-feat-card">
          <span class="material-symbols-outlined">bolt</span>
          <h3>Шуурхай тээвэрлэлт</h3>
          <p>3–7 хоногт Улаанбаатарт хүргэдэг оновчтой маршрут</p>
        </div>
        <div class="about-feat-card">
          <span class="material-symbols-outlined">verified_user</span>
          <h3>Найдвартай баталгаа</h3>
          <p>Бүрэн даатгалтай тээвэрлэлт болон мэргэжлийн баг</p>
        </div>
        <div class="about-feat-card">
          <span class="material-symbols-outlined">monitoring</span>
          <h3>Шууд хяналт</h3>
          <p>Ачааны төлөвийг хэзээ ч, хаанаас ч хянах боломж</p>
        </div>
        <div class="about-feat-card">
          <span class="material-symbols-outlined">support_agent</span>
          <h3>24/7 Дэмжлэг</h3>
          <p>Асуудал гарсан үед манай баг нэн даруй тусална</p>
        </div>
      </div>
    </section>

    <section class="about-stats">
      <div class="about-stats__header">
        <div class="about-kicker">Тоо баримт</div>
        <h2>Үр дүн нь тоогоор</h2>
      </div>
      <div class="about-stats__grid">
        <div class="about-stat-card">
          <span class="material-symbols-outlined">inventory_2</span>
          <strong>5,000+</strong>
          <p>Нийт илгээмж</p>
        </div>
        <div class="about-stat-card">
          <span class="material-symbols-outlined">group</span>
          <strong>1,200+</strong>
          <p>Харилцагч</p>
        </div>
        <div class="about-stat-card">
          <span class="material-symbols-outlined">local_shipping</span>
          <strong>3–7</strong>
          <p>Хоногт хүргэнэ</p>
        </div>
        <div class="about-stat-card">
          <span class="material-symbols-outlined">star</span>
          <strong>99%</strong>
          <p>Сэтгэл ханамж</p>
        </div>
      </div>
    </section>

    <section class="about-team">
      <div class="about-kicker">Манай баг</div>
      <h2>Баг бүрэлдэхүүн</h2>
      <p class="about-team__sub">Таны ачааг хамгаалж, шуурхай хүргэхийн тулд ажиллаж буй мэргэжлийн баг.</p>
      <div class="about-team__grid">
        <div class="about-team-card">
          <div class="about-team-card__avatar">
            <span class="material-symbols-outlined">person</span>
          </div>
          <h3>Дагиина</h3>
          <span class="about-team-card__role">Үүсгэн байгуулагч &amp; CEO</span>
          <p>Логистик салбарт 6 жил ажилласан туршлагатай. Монголын карго үйлчилгээг шинэ түвшинд гаргах зорилго тавьсан.</p>
        </div>
        <div class="about-team-card">
          <div class="about-team-card__avatar">
            <span class="material-symbols-outlined">person</span>
          </div>
          <h3>Анхбаяр</h3>
          <span class="about-team-card__role">Техникийн захирал</span>
          <p>Харилцагчдад хамгийн сайн туршлага олгох платформ хөгжүүлж буй инженер.</p>
        </div>
        <div class="about-team-card">
          <div class="about-team-card__avatar">
            <span class="material-symbols-outlined">person</span>
          </div>
          <h3>Бат-Эрдэнэ</h3>
          <span class="about-team-card__role">Гаалийн мэргэжилтэн</span>
          <p>Хятад-Монголын хилийн гаалийн бүрдүүлэлтэд 8 жилийн туршлагатай мэргэжилтэн.</p>
        </div>
      </div>
    </section>

    <section class="about-values">
      <div class="about-kicker">Манай үнэт зүйлс</div>
      <h2>Юуг эрхэмлэдэг вэ</h2>
      <div class="about-values__grid">
        <div class="about-value-card">
          <div class="about-value-card__icon">
            <span class="material-symbols-outlined">visibility</span>
          </div>
          <h3>Ил тод байдал</h3>
          <p>Тээвэрлэлтийн үнэ, хугацаа, төлөв бүрийг харилцагчдад нээлттэй мэдэгддэг.</p>
        </div>
        <div class="about-value-card">
          <div class="about-value-card__icon">
            <span class="material-symbols-outlined">handshake</span>
          </div>
          <h3>Итгэлцэл</h3>
          <p>Таны ачааг өөрийнхөө мэтээр хамгаалж, хариуцлагатайгаар хүргэдэг.</p>
        </div>
        <div class="about-value-card">
          <div class="about-value-card__icon">
            <span class="material-symbols-outlined">speed</span>
          </div>
          <h3>Хурд</h3>
          <p>Шуурхай гаалийн бүрдүүлэлт, оновчтой маршрут — удаан хүлээлгэхгүй.</p>
        </div>
        <div class="about-value-card">
          <div class="about-value-card__icon">
            <span class="material-symbols-outlined">favorite</span>
          </div>
          <h3>Харилцагч төвтэй</h3>
          <p>Асуудал бүрд хурдан хариу, асуулт бүрд хялбар тайлбар — таны тав тухыг эрхэмлэнэ.</p>
        </div>
      </div>
    </section>

    <section class="about-cta">
      <div class="about-cta__inner">
        <span class="material-symbols-outlined about-cta__icon">rocket_launch</span>
        <h2>Эхлэхэд бэлэн үү?</h2>
        <p>Хятадаас захиалга өгч, бидэнд хүргэлтийг даат. Шуурхай, найдвартай, ил тод.</p>
        <div class="about-cta__btns">
          <a href="#/create-order" class="btn">Захиалга өгөх</a>
          <a href="#/support" class="about-cta__link">
            Асуулт байна уу?
            <span class="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>
      </div>
    </section>
  `;
}
