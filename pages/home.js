export default function home() {
  return `
    <section class="hero">
      <div class="hero-text">
        <h1>Хятад Улсаас Монгол Улс руу <br><span>Хялбар тээвэрлэлт</span></h1>
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

        <p id="track-message" class="track-message"></p>

        <a href="#/create-order" class="btn big">Шинэ захиалга үүсгэх</a>
      </div>

      <div class="car-img-wrapper">
        <img src="./pics/truck.png" alt="Truck" class="car-img" />
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

    <section class="warehouse">
      <div>
        <h2>Хаяг холбох заавар</h2>
        <p>Илгээмжээ Хятад Улс дахь манай агуулахтай холбоорой.</p>
      </div>

      <div>
        <h3>收件人 / Хүлээн авагч</h3>
        <div>
          Cash4Cargo (утасны дугаар)
          <button type="button" aria-label="Хүлээн авагч хуулах">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
        </div>
      </div>

      <div class="wide">
        <h3>街道地址 / Хаяг</h3>
        <div>
          义乌市场西文都苏旅店 Cash4Cargo (17547558506)
          <button type="button" aria-label="Хаяг хуулах">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
        </div>
      </div>

      <div>
        <h3>电话 / Утасны дугаар</h3>
        <div>
          17547558506
          <button type="button" aria-label="Утасны дугаар хуулах">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
        </div>
      </div>

      <div class="wide">
        <h3>所在地区 / Бүс нутаг</h3>
        <div>
          内蒙古自治区锡林郭勒盟二连浩特市二连浩特市社区建设管理局
          <button type="button" aria-label="Бүс нутаг хуулах">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
        </div>
      </div>
    </section>

    <section class="services">
      <h2>Дэвшилтэт логистикийн шийдлүүд</h2>
      <p>Бид тээврийн бүхий л үе шатыг нарийн төлөвлөж, таны бараа саадгүй ирэх нөхцөлийг бүрдүүлнэ.</p>

      <div class="cards">
        <article class="card">
          <span class="material-symbols-outlined">bolt</span>
          <h3>Шуурхай тээвэрлэлт</h3>
          <p>Сайтар тооцоолсон маршрут болон түргэн гаалийн бүрдүүлэлтээр таны ачааг хил дамнан богино хугацаанд хүргэнэ.</p>
        </article>
        <article class="card">
          <span class="material-symbols-outlined">verified_user</span>
          <h3>Найдвартай</h3>
          <p>Даатгалтай тээвэрлэлт болон мэргэжлийн багийн ажиллагаа нь ачааг аюулгүй, найдвартай хүргэх баталгааг олгоно.</p>
        </article>
        <article class="card">
          <span class="material-symbols-outlined">monitoring</span>
          <h3>Шууд хяналтын систем</h3>
          <p>Орчин үеийн GPS хяналт болон тогтмол шинэчлэгдэх мэдээллээр та ачааныхаа хаана явж байгааг хэзээ ч хянах боломжтой.</p>
        </article>
      </div>
    </section>
  `;
}