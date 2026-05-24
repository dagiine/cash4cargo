export default function home() {
  return `
    <section class="hero">
      <img src="./pics/hero.png" class="hero-bg" alt="Hero image" />

      <div class="hero-overlay"></div>

      <div class="hero-content">
        <h1 class="hero-title">Хятадаас Монгол руу<br/><span>Сэтгэл ханамжийг тээвэрлэнэ</span></h1>

        <div class="hero-track">
          <label for="home-track-input">Илгээмжээ хянах</label>

          <div class="track-input">
            <input
              id="home-track-input"
              type="text"
              placeholder="Хяналтын код эсвэл утасны дугаар"
            />

            <button id="home-track-btn" type="button">
              <span class="material-symbols-outlined">search</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="quick-links">
      <!-- Захиалга үүсгэх -->
      <a href="#/create-order" class="ql-card">
        <div class="ql-icon">
          <span class="material-symbols-outlined">edit_square</span>
        </div>
        <div class="ql-body">
          <strong>Захиалга үүсгэх</strong>
          <p>Захиалсан барааныхаа мэдээллийг бүртгүүлснээр явцыг нь хялбар хянах боломжтой.</p>
        </div>
        <span class="ql-arrow material-symbols-outlined">arrow_forward</span>
      </a>

      <!-- Үнэ тооцоолох -->
      <a href="#/create-order" class="ql-card">
        <div class="ql-icon">
          <span class="material-symbols-outlined">calculate</span>
        </div>
        <div class="ql-body">
          <strong>Үнэ тооцоолох</strong>
          <p>Илгээмжийн жин болон эзэлхүүнээр тээврийн төлбөрийг урьдчилан тооцно.</p>
        </div>
        <span class="ql-arrow material-symbols-outlined">arrow_forward</span>
      </a>

      <!-- Хаяг холбох -->
      <a href="#warehouse-section" class="ql-card">
        <div class="ql-icon">
          <span class="material-symbols-outlined">location_on</span>
        </div>
        <div class="ql-body">
          <strong>Хаяг холбох</strong>
          <p>Бараа тань агуулахад саадгүй хүрэхийн тулд хаяг, нэр, утасны дугаараа зөв оруулна уу.</p>
        </div>
        <span class="ql-arrow material-symbols-outlined">arrow_forward</span>
      </a>
    </section>

    <section class="steps-section">
      <div class="steps">
        <h2>Тээврийн явц</h2>
        <div class="title-line"></div>

        <div class="steps-grid">

          <article class="step">
            <div class="step-icon">
              <span class="material-symbols-outlined">send</span>
            </div>
            <span class="step-label">Захиалга үүсгэсэн</span>
            <p>Та захиалгаа манай системд бүртгүүлснээр илгээмжний мэдээлэл үүснэ. Энэ шатанд захиалгын мэдээллээ засах эсвэл цуцлах боломжтой.</p>
          </article>

          <article class="step">
            <div class="step-icon">
              <span class="material-symbols-outlined">inventory_2</span>
            </div>
            <span class="step-label">Хятадын агуулахад</span>
            <p>Таны илгээмж Хятад дахь агуулахад ирж, жин хэмжилт хийгдэнэ. Ачаа ихэвчлэн тухайн өдөр эсвэл маргааш нь тээвэрлэгдэнэ.</p>
          </article>

          <article class="step">
            <div class="step-icon">
              <span class="material-symbols-outlined">local_shipping</span>
            </div>
            <span class="step-label">Замын Үүд дээр</span>
            <p>Илгээмж хилээр нэвтрэх гаалийн бүрдүүлэлтэд орно. Гаалийн шалгалт дундажаар 3–24 цаг орчим үргэлжилдэг.</p>
          </article>

          <article class="step">
            <div class="step-icon">
              <span class="material-symbols-outlined">warehouse</span>
            </div>
            <span class="step-label">Улаанбаатарт ирсэн</span>
            <p>Илгээмжээ хүлээн авахдаа хяналтын код эсвэл бүртгэлтэй утасны дугаараа баталгаажуулна.</p>
          </article>

          <article class="step">
            <div class="step-icon">
              <span class="material-symbols-outlined">check_circle</span>
            </div>
            <span class="step-label">Олгогдсон</span>
            <p>Та илгээмжээ хүлээн авч, захиалга амжилттай дуусгавар болно.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <div class="stats">
        <article class="stat">
          <strong>5000+</strong>
          <span>Илгээмж</span>
        </article>

        <article class="stat">
          <strong>1200+</strong>
          <span>Харилцагч</span>
        </article>

        <article class="stat">
          <strong>3–7</strong>
          <span>Хоногт хүргэнэ</span>
        </article>
      </div>
    </section>

    <section class="reviews-section">
      <div class="reviews">
        <h2>Харилцагчдын сэтгэгдэл</h2>
        <div class="title-line"></div>

        <div class="reviews-grid">

          <article class="review-card">
            <div class="review-stars">★★★★★</div>
            <p class="review-text">Маш хурдан, найдвартай үйлчилгээ. Захиалсан барааг 5 хоногийн дотор хүлээн авсан. Дараа дараагийн захиалгуудаа энд өгнө.</p>
            <div class="review-author">
              <div class="review-avatar">БА</div>
              <div>
                <p class="review-name">Батаа Ариунаа</p>
                <p class="review-meta">2 сарын өмнө</p>
              </div>
            </div>
          </article>

          <article class="review-card">
            <div class="review-stars">★★★★★</div>
            <p class="review-text">Хяналтын систем нь маш тохиромжтой, илгээмжээ хаана явж байгааг шууд мэдэж байлаа. Ажилтнууд туслахад бэлэн байдаг.</p>
            <div class="review-author">
              <div class="review-avatar">ДМ</div>
              <div>
                <p class="review-name">Дорж Мөнхбат</p>
                <p class="review-meta">1 сарын өмнө</p>
              </div>
            </div>
          </article>

          <article class="review-card">
            <div class="review-stars">★★★★☆</div>
            <p class="review-text">Үнэ нь боломжийн, бараа бүрэн бүтэн ирсэн. Гаалийн бүрдүүлэлтийг өөрсдөө шийддэг нь маш том давуу тал.</p>
            <div class="review-author">
              <div class="review-avatar">НО</div>
              <div>
                <p class="review-name">Номин Оюун</p>
                <p class="review-meta">3 сарын өмнө</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="bottom-cta">
      <div class="bottom-cta-content">
        <h2>Захиалга үүсгэх үү?</h2>
        <p>Захиалгаа үүсгээд илгээмжээ бодит хугацаанд хянах боломжтой.</p>

        <div class="bottom-cta-actions">
          <a href="#/create-order" class="btn">Захиалга үүсгэх</a>
          <a href="#/about-us" class="btn secondary">Холбоо барих</a>
        </div>
      </div>
    </section>

    <section id="warehouse-section" class="warehouse-section">
      <div class="warehouse">

        <div class="warehouse-header">
          <h2 class="warehouse-title">Хаяг холбох заавар</h2>
          <div class="title-line"></div>
        </div>

        <article class="warehouse-item">
          <h3>收件人 / Хүлээн авагч</h3>
          <div class="warehouse-copy-row">
            <span class="warehouse-value warehouse-value-nowrap">Cash4Cargo (утасны дугаар)</span>
            <button type="button" class="warehouse-copy-btn" data-copy="Cash4Cargo (утасны дугаар)" aria-label="Хуулах">
              <span class="material-symbols-outlined">content_copy</span>
            </button>
          </div>
        </article>

        <article class="warehouse-item warehouse-item-wide">
          <h3>街道地址 / Хаяг</h3>
          <div class="warehouse-copy-row">
            <span class="warehouse-value">义乌市场西文都苏旅店 Cash4Cargo (17547558506)</span>
            <button type="button" class="warehouse-copy-btn" data-copy="义乌市场西文都苏旅店 Cash4Cargo (17547558506)" aria-label="Хуулах">
              <span class="material-symbols-outlined">content_copy</span>
            </button>
          </div>
        </article>

        <article class="warehouse-item">
          <h3>电话 / Утасны дугаар</h3>
          <div class="warehouse-copy-row">
            <span class="warehouse-value warehouse-value-nowrap">17547558506</span>
            <button type="button" class="warehouse-copy-btn" data-copy="17547558506" aria-label="Хуулах">
              <span class="material-symbols-outlined">content_copy</span>
            </button>
          </div>
        </article>

        <article class="warehouse-item warehouse-item-wide">
          <h3>所在地区 / Бүс нутаг</h3>
          <div class="warehouse-copy-row">
            <span class="warehouse-value">内蒙古自治区锡林郭勒盟二连浩特市二连浩特市社区建设管理局</span>
            <button type="button" class="warehouse-copy-btn" data-copy="内蒙古自治区锡林郭勒盟二连浩特市二连浩特市社区建设管理局" aria-label="Хуулах">
              <span class="material-symbols-outlined">content_copy</span>
            </button>
          </div>
        </article>
      </div>
    </section>
  `;
}