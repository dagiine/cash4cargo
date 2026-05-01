export default function support() {
  return `
    <h1>Тусламж</h1>
    <p>Түгээмэл асуудаг асуултууд болон таньд хэрэгтэй мэдээллүүд</p>

    <label class="search">
      <span class="material-symbols-outlined">search</span>
      <input type="search" id="faq-search" placeholder="Захиалгын мэдээлэл болон бусад хайх..." />
    </label>

    <article>
      <input type="radio" name="faq" id="faq-all" checked hidden />
      <input type="radio" name="faq" id="faq-ordering" hidden />
      <input type="radio" name="faq" id="faq-shipping" hidden />
      <input type="radio" name="faq" id="faq-payments" hidden />

      <div class="categories" id="faq-categories">
        <label for="faq-all">
          <span class="material-symbols-outlined">view_list</span>
          Бүгд
        </label>
        <label for="faq-ordering">
          <span class="material-symbols-outlined">shopping_cart</span>
          Захиалга
        </label>
        <label for="faq-shipping">
          <span class="material-symbols-outlined">local_shipping</span>
          Тээвэрлэлт
        </label>
        <label for="faq-payments">
          <span class="material-symbols-outlined">payments</span>
          Төлбөр
        </label>
      </div>

      <section>
        <h2 id="faq-section-title">Түгээмэл асуултууд</h2>

        <!-- Захиалгатай холбоотой -->
        <div class="faq-group" id="faq-ordering">
          <article>
            <details>
              <summary>Яаж захиалга өгөх вэ?</summary>
              <p>Бүртгэл үүсгээд барааны мэдээлэл болон хүргэх хаягаа бөглөж, захиалгаа баталгаажуулна. Захиалга үүссэний дараа танд SMS-ээр хяналтын код илгээгдэнэ.</p>
            </details>
          </article>

          <article>
            <details>
              <summary>Ямар ч Хятадын сайтаас захиалж болох уу?</summary>
              <p>Тийм — бид Taobao, 1688, JD.com, Pinduoduo болон ихэнх томоохон Хятадын онлайн худалдааны сайтуудаас захиалга дэмждэг. Захиалга үүсгэхдээ барааны холбоос (URL)-ийг оруулахад хангалттай.</p>
            </details>
          </article>

          <article>
            <details>
              <summary>Ямар барааг хориглодог вэ?</summary>
              <p>Шатамхай бүтээгдэхүүн, 100Wh-аас дээш литийн зай, хуурамч бүтээгдэхүүн, мансууруулах бодис, амьд амьтад зэрэг бараа хориглогдоно. Тодорхой бараанд эргэлзэж байвал манай тусламжийн багтай холбогдоно уу.</p>
            </details>
          </article>

          <article>
            <details>
              <summary>Захиалгаа өөрчлөх эсвэл цуцлах боломжтой юу?</summary>
              <p>Барааг худалдагчаас авахаас өмнө захиалгыг өөрчлөх эсвэл цуцлах боломжтой. Тээвэрлэлт эхэлсний дараа цуцлах боломжгүй тул аль болох хурдан холбогдоно уу.</p>
            </details>
          </article>
          
          <article>
            <details>
              <summary>Хагарч гэмтэх барааг хэрхэн захиалах вэ?</summary>
              <p>Ширээний тавцан, зурагт, шил толин эд зүйл гэх мэт хагарч гэмтэх барааг захиалсан хятад дэлгүүртэйгээ харьцан гадуур нь модон торхтой явуулбал хагарч гэмтэхгүй ирдэг.</p>
            </details>
          </article>
        </div>

        <!-- Тээвэрлэлттэй холбоотой -->
        <div class="faq-group" id="faq-shipping">
          <article>
            <details>
              <summary>Захиалсан бараа хэд хоногт Улаанбаатарт ирэх вэ?</summary>
              <p>Эрээнд хүргэгдсэн бараа 3-5 хоногт улаанбаатарт ирнэ. Хил гаалийн шалгалт, ачаалал дараалал, бороо цас орох, замд машин эвдэрч саатах зэргээс хамаарч удах тохиолдол гардаг.</p>
            </details>
          </article>

          <article>
            <details>
              <summary>Ачаагаа хэрхэн хянах вэ?</summary>
              <p>Манай Track хуудсанд 6 тэмдэгттэй хяналтын код эсвэл утасны дугаараа оруулна. Таны ачаа манай агуулахуудаар дамжих үед бодит цагийн мэдээлэл шинэчлэгдэнэ.</p>
            </details>
          </article>

          <article>
            <details>
              <summary>Ачаагаа улаанбаатарт ирэхээр нь хаанаас авах вэ?</summary>
              <p>Бид Улаанбаатар хотод (Зайсан, Баянзүрх) агуулахтай бөгөөд аймгийн төвүүдэд хамтран ажиллах авах цэгүүдтэй. SMS мэдэгдэлд танд хамгийн ойр байршил мэдээлэгдэнэ.</p>
            </details>
          </article>

          <article>
            <details>
              <summary>Миний бараа тээвэрлэлт төлөвтэй болохгүй байна. Шалгаад өгөөч?</summary>
              <p>Бид эрээнд таны захиалсан барааг хүлээж аваад машин дээр жин, овор хэмжээгээр нь үнийг тогтоогоод монгол руу ачиж явуулдаг. Том овортой барааг ингэж уншуулах боломжгүй тул барааны төлөв нь "бүртгэсэн" гэдгээс шууд "улаанбаатарт ирсэн" болдог.</p>
            </details>
          </article>
        </div>

        <!-- Төлбөртэй холбоотой -->
        <div class="faq-group" id="faq-payments">
          <article>
            <details>
              <summary>Барааны үнээс хэрхэн боддог вэ?</summary>
              <p>Таны захиалсан бараанаас шалтгаалаад кг нь 2500, м3 нь 750 юань-р бодно. Утасны case-с томгүй барааг 1500-р бодно. Та үнэ тооцоолох хэсэгт тооцоолж бодох боломжтой.</p>
            </details>
          </article>

          <article>
            <details>
              <summary>Ямар төлбөрийн хэрэгслүүдийг хүлээн авдаг вэ?</summary>
              <p>Бид Visa, MasterCard, QPay, SocialPay болон банкны шууд шилжүүлгийг хүлээн авдаг. Байгууллагын харилцагчид сар бүрийн нэхэмжлэл авах боломжтой.</p>
            </details>
          </article>

          <article>
            <details>
              <summary>Төлбөрөө хэзээ хийдэг вэ?</summary>
              <p>Бараа Хятад дахь манай агуулахад ирж жин, хэмжээ баталгаажсаны дараа төлбөр авна. Төлбөр хийхээс өмнө танд нэхэмжлэл илгээгдэнэ.</p>
            </details>
          </article>

          <article>
            <details>
              <summary>Өндөр үнэ бүхий ачааг даатгуулах боломжтой юу?</summary>
              <p>Тийм. Даатгалыг төлбөр хийх үед нэмэх эсвэл аль хэдийн илгээгдсэн ачаанд тусламжийн багтай холбогдон нэмэх боломжтой. Даатгалын үнэ нь барааны зарласан үнээс хамаарна.</p>
            </details>
          </article>

          <article>
            <details>
              <summary>Гаалийн татвар ногдох уу?</summary>
              <p>Монгол Улсын гаалийн татваргүй дүнгээс давсан ачаанд гаалийн татвар ногдоно. Бид төлбөр хийх үед урьдчилсан тооцоог харуулж, бүх гаалийн бичиг баримтыг таны өмнөөс бүрдүүлнэ.</p>
            </details>
          </article>
        </div>

        <!-- Хайлтад тохирох асуулт олдоогүй -->
        <p id="faq-no-results" style="display:none; color: var(--color-muted); text-align:center; padding: 32px 0;">
          Хайлтад тохирох асуулт олдсонгүй.
        </p>

      </section>
    </article>
  `;
}