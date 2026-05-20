export default function home() {
  return `
    <section class="hero">
      <div class="hero-banner">
        <img src="./pics/hero.png" class="hero-bg" alt="Hero" />
        <div class="hero-text">
          <h1>Хятад - Монгол<br><span>Хялбар тээвэрлэлт</span></h1>
          <p>Шуурхай, найдвартай, ил тод карго шийдэл. Таны бизнес болон Монголын зах зээлийг холбох гүүр.</p>

          <div class="track">
            <label>Хурдан хяналт</label>
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

          <a href="#/create-order" class="btn big">Шинэ захиалга үүсгэх</a>
        </div>
      </div>
    </section>

    <section class="stats">
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
    </section>

    <section class="steps">
      <h2>Тээврийн явц</h2>
      <div class="title-line"></div>

      <div class="steps-grid">
        <article class="step">
          <div class="step-icon">
            <span class="material-symbols-outlined">send</span>
          </div>
          <span class="step-num">01</span>
          <span class="step-label">Захиалга үүсгэсэн</span>
          <p>Та захиалгаа манай системд бүртгүүлснээр илгээмжний мэдээлэл үүснэ. Энэ шатанд захиалгын мэдээллээ засах эсвэл цуцлах боломжтой.</p>
        </article>

        <article class="step">
          <div class="step-icon">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <span class="step-num">02</span>
          <span class="step-label">Хятадын агуулахад</span>
          <p>Таны илгээмж Хятад дахь агуулахад ирж, жин хэмжилт хийгдэнэ. Энэ шатанд захиалгаа цуцлах боломжтой бөгөөд ачаа ихэвчлэн тухайн өдөр эсвэл маргааш нь тээвэрлэгдэнэ. </p>
        </article>

        <article class="step">
          <div class="step-icon">
            <span class="material-symbols-outlined">local_shipping</span>
          </div>
          <span class="step-num">03</span>
          <span class="step-label">Замын Үүд дээр</span>
          <p>Илгээмж хилээр нэвтрэх гаалийн бүрдүүлэлтэд орно. Гаалийн шалгалт болон бүрдүүлэлт дундажаар 3 – 24 цаг орчим үргэлжилдэг.</p>
        </article>

        <article class="step">
          <div class="step-icon">
            <span class="material-symbols-outlined">warehouse</span>
          </div>
          <span class="step-num">04</span>
          <span class="step-label">Улаанбаатарт ирсэн</span>
          <p>Илгээмжээ хүлээн авахдаа танд мессэжээр очсон хяналтын код эсвэл бүртгэлтэй утасны дугаараа баталгаажуулна.</p>
        </article>

        <article class="step">
          <div class="step-icon">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <span class="step-num">05</span>
          <span class="step-label">Олгогдсон</span>
          <p>Та илгээмжээ хүлээн авч, захиалга амжилттай дуусгавар болно.</p>
        </article>

      </div>
    </section>

    <section class="warehouse">
      <div class="warehouse-header">
        <h2 class="warehouse-title">Хаяг холбох заавар</h2>
        <div class="title-line"></div>
      </div>

      <article class="warehouse-item">
        <h3>收件人 / Хүлээн авагч</h3>
        <div class="warehouse-copy-row warehouse-copy-row-inline">
          <span class="warehouse-value warehouse-value-nowrap">Cash4Cargo (утасны дугаар)</span>
          <button type="button" class="warehouse-copy-btn" aria-label="Хүлээн авагчийг хуулах">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
        </div>
      </article>

      <article class="warehouse-item warehouse-item-wide">
        <h3>街道地址 / Хаяг</h3>
        <div class="warehouse-copy-row">
          <span class="warehouse-value">义乌市场西文都苏旅店 Cash4Cargo (17547558506)</span>
          <button type="button" class="warehouse-copy-btn" aria-label="Хаягийг хуулах">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
        </div>
      </article>

      <article class="warehouse-item">
        <h3>电话 / Утасны дугаар</h3>
        <div class="warehouse-copy-row warehouse-copy-row-inline">
          <span class="warehouse-value warehouse-value-nowrap">17547558506</span>
          <button type="button" class="warehouse-copy-btn" aria-label="Утасны дугаарыг хуулах">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
        </div>
      </article>

      <article class="warehouse-item warehouse-item-wide">
        <h3>所在地区 / Бүс нутаг</h3>
        <div class="warehouse-copy-row">
          <span class="warehouse-value">内蒙古自治区锡林郭勒盟二连浩特市二连浩特市社区建设管理局</span>
          <button type="button" class="warehouse-copy-btn" aria-label="Бүс нутгийг хуулах">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
        </div>
      </article>
    </section>

    <section class="reviews">
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
          <p class="review-text">Хяналтын систем нь маш тохиромжтой, илгээмжээ хаана явж байгааг шууд мэдэж байлаа. Үйлчилгээ маш сайн, ажилтнууд туслахад бэлэн байдаг.</p>
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
    </section>

    <section class="bottom-cta">
      <div class="bottom-cta-content">
        <h2>Захиалга үүсгэх үү?</h2>

        <p>Захиалгаа үүсгээд илгээмжээ бодит хугацаанд хянах боломжтой.</p>

        <div class="bottom-cta-actions">
          <a href="#/create-order" class="btn">
            Захиалга үүсгэх
          </a>

          <a href="#/support" class="btn secondary">
            Холбоо барих
          </a>
        </div>

      </div>
    </section>
  `;
}