// api.js файлаас getSession function import хийж байна.
// getSession нь login хийсэн хэрэглэгчийн session мэдээллийг авна.
import { getSession } from "../js/api.js";

// Утасны дугаарыг харагдах хэлбэрт оруулах function.
// Жишээ: 99447176 → +976 9944-7176
function formatPhone(phone = "") {
  // phone утгыг string болгоод, зөвхөн тоонуудыг үлдээнэ.
  // Жишээ: "+976 9944-7176" → "97699447176"
  const digits = String(phone).replace(/\D/g, "");

  // Хэрэв 8 оронтой Монгол утасны дугаар байвал
  // +976 XXXX-XXXX хэлбэрээр форматлана.
  if (digits.length === 8) {
    return `+976 ${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  // Хэрэв 8 оронтой биш бол ирсэн phone-г өөрчлөхгүй буцаана.
  // phone байхгүй бол "-" гэж харуулна.
  return phone || "-";
}

// Profile page-ийн HTML-ийг буцаах function.
// default export хийж байгаа тул app.js дээр dynamic import хийж ашиглана.
export default function profilePage() {
  // Login хийсэн хэрэглэгчийн session мэдээллийг авна.
  const session = getSession();

  // Session дотор user байвал авна.
  // Хэрэв session эсвэл user байхгүй бол хоосон object ашиглана.
  const user = session?.user || {};

  // Хэрэглэгчийн нэрийг авна.
  // Нэр байхгүй бол default-аар "Хэрэглэгч" гэж харуулна.
  const name = user.name || "Хэрэглэгч";

  // Хэрэглэгчийн утсыг formatPhone function ашиглаж format хийнэ.
  const phone = formatPhone(user.phone);

  // Profile page дээр харагдах HTML-ийг буцаана.
  return `
    <section class="profile-page">
      
      <!-- Profile-ийн үндсэн card -->
      <div class="profile-card">
        
        <!-- Profile-ийн дээд хэсэг: avatar, нэр, утас -->
        <div class="profile-top">
          
          <!-- Avatar болон зураг солих button-ийг хамтад нь барих wrapper -->
          <div class="profile-avatar-wrap">
            
            <!-- Хэрэглэгчийн avatar хэсэг -->
            <div class="profile-avatar">
              <span class="material-symbols-outlined">account_box</span>
            </div>

            <!-- Avatar зураг солих button -->
            <!-- Одоогоор зөвхөн UI button байна, logic нь нэмэгдээгүй -->
            <button
              class="profile-edit-avatar"
              type="button"
              title="Зураг солих"
            >
              <span class="material-symbols-outlined">edit</span>
            </button>
          </div>

          <!-- Хэрэглэгчийн нэр -->
          <h1>${name}</h1>

          <!-- Хэрэглэгчийн утас -->
          <p class="profile-phone">
            <span class="material-symbols-outlined">call</span>
            <span>${phone}</span>
          </p>
        </div>

        <!-- Нууц үг шинэчлэх form -->
        <form id="profile-password-form" class="profile-form">
          
          <!-- Алдаа эсвэл амжилтын message энд харагдана -->
          <p id="profile-message" class="profile-message"></p>

          <!-- Одоогийн нууц үг -->
          <label class="profile-field">
            <span>Одоогийн нууц үг</span>
            <input
              id="current-password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </label>

          <!-- Шинэ нууц үг -->
          <label class="profile-field">
            <span>Шинэ нууц үг</span>
            <input
              id="new-password"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
            />
          </label>

          <!-- Шинэ нууц үгээ давтаж оруулах талбар -->
          <label class="profile-field">
            <span>Шинэ нууц үг давтах</span>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
            />
          </label>

          <!-- Нууц үг шинэчлэх submit button -->
          <button class="profile-update-btn" type="submit">
            Нууц үг шинэчлэх
          </button>
        </form>

        <!-- Form болон logout button хоорондын divider -->
        <div class="profile-divider"></div>

        <!-- Системээс гарах button -->
        <!-- Энэ button-ийн click logic нь initProfile.js дээр байх боломжтой -->
        <button id="profile-logout-btn" class="profile-logout-btn" type="button">
          <span class="material-symbols-outlined">logout</span>
          <span>Гарах</span>
        </button>
      </div>
    </section>
  `;
}