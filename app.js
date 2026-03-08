import {
  initI18n,
  t,
  setLanguage,
  getAvailableLanguages,
  getCurrentLanguage,
  onLanguageChange
} from "./core/i18n.js";
import {
  state,
  setRoute,
  updateSettings,
  setLanguagePreference
} from "./core/state.js";
import { renderSettings } from "./ui/settings.js";
import { renderConfirmation } from "./ui/confirmation.js";
import { renderGame } from "./ui/game.js";
import { renderResults } from "./ui/results.js";
import { logger } from "./core/utils/logger.js";
import toast from "./ui/components/Toast.js";
import { preloadSounds } from "./js/utils/sound.js";

const CONTEXT = "Main";

const mainContainer = document.getElementById("app");
const titleElement = document.getElementById("appTitle");
const taglineElement = document.getElementById("appTagline");
const languageContainer = document.getElementById("languageSwitcher");
const footerElement = document.getElementById("appFooter");

const screens = {
  settings: renderSettings,
  confirmation: renderConfirmation,
  game: renderGame,
  results: renderResults
};

let currentCleanup = null;

// ==========================================
// LMS INTEGRATION (MindWorld School)
// ==========================================
const _lmsParams = new URLSearchParams(window.location.search);
const isHomeworkMode = _lmsParams.get('mode') === 'homework';
const homeworkOpener = isHomeworkMode ? window.opener : null;

window.sendHomeworkResults = function(customResults = null) {
  if (!isHomeworkMode || !homeworkOpener) return;
  
  // Шукаємо результати у переданому об'єкті або в глобальному state
  const r = customResults || state.results || state.game || state || {};
  
  // Адаптація під можливі ключі в стейті тренажера
  const total = r.total ?? state.settings?.examples ?? 10;
  const correct = r.correct ?? r.score ?? r.success ?? 0;
  const wrong = r.wrong ?? r.errors ?? (r.total != null && r.success != null ? r.total - r.success : 0);
  const timeSpent = r.timeSpent ?? r.time ?? (r.totalTimeMs != null ? Math.round(r.totalTimeMs / 1000) : 0);
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  homeworkOpener.postMessage({
    type: 'HOMEWORK_RESULT',
    total: total,
    correct: correct,
    wrong: wrong,
    percentage: percentage,
    completed: true,
    answeredCount: correct + wrong,
    timeSpent: timeSpent
  }, '*');
  
  logger.info(CONTEXT, '✅ Результати відправлено в LMS:', { total, correct, wrong, percentage, timeSpent });
};
// ==========================================

function updateHeaderTexts() {
  const titleMain = document.querySelector('.title-main');
  const titleSub = document.querySelector('.title-sub');

  if (titleMain) titleMain.textContent = t("header.titleMain");
  if (titleSub) titleSub.textContent = t("header.titleSub");

  taglineElement.textContent = t("header.tagline");
  footerElement.textContent = t("footer");
  document.title = t("header.titleMain");
  document.documentElement.lang = getCurrentLanguage();
}

function renderLanguageButtons() {
  // У режимі ДЗ приховуємо вибір мови, щоб учень не відволікався
  if (isHomeworkMode) {
    if (languageContainer) languageContainer.style.display = 'none';
    return;
  }

  const languages = getAvailableLanguages();
  languageContainer.innerHTML = "";
  const capsule = document.createElement("div");
  capsule.className = "language-capsule";

  languages.forEach(({ code, label }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = code.toUpperCase();
    button.title = label;
    button.dataset.lang = code;
    if (code === getCurrentLanguage()) {
      button.classList.add("language-capsule__btn--active");
    }
    button.addEventListener("click", () => {
      setLanguagePreference(code);
      setLanguage(code);
    });
    capsule.appendChild(button);
  });

  languageContainer.appendChild(capsule);
}

function renderScreen(name) {
  if (!screens[name]) {
    logger.warn(CONTEXT, `Unknown route: ${name}`);
    return;
  }

  if (typeof currentCleanup === "function") {
    currentCleanup();
    currentCleanup = null;
  }

  mainContainer.innerHTML = "";
  const context = {
    t,
    state,
    navigate: route,
    updateSettings
  };
  const cleanup = screens[name](mainContainer, context);
  if (typeof cleanup === "function") {
    currentCleanup = cleanup;
  }

  // --- LMS: АВТОМАТИЧНА ВІДПРАВКА ТА ПРИХОВУВАННЯ КНОПОК ---
  if (isHomeworkMode) {
    if (name === "results") {
      // 1. Відправляємо результати як тільки відкрився екран "results"
      setTimeout(() => {
        if (typeof window.sendHomeworkResults === "function") {
          window.sendHomeworkResults();
        }
      }, 500);

      // 2. Ховаємо кнопки повернення до налаштувань (щоб учень міг тільки закрити вкладку)
      setTimeout(() => {
        const backButtons = mainContainer.querySelectorAll('button[data-action="settings"], .btn-settings, button.secondary');
        backButtons.forEach(btn => {
           // Ховаємо кнопку, якщо вона веде до налаштувань
           if(btn.textContent.includes('Налаштування') || btn.textContent.includes('Settings') || btn.textContent.includes('Ajustes') || btn.textContent.includes('Настройки')) {
               btn.style.display = 'none';
           }
        });
      }, 100);
    }
  }
}

export function route(name) {
  logger.debug(CONTEXT, `Navigating to: ${name}`);
  setRoute(name);
  renderScreen(name);
}

async function bootstrap() {
  try {
    // Проверка критических DOM элементов
    if (
      !mainContainer ||
      !titleElement ||
      !taglineElement ||
      !languageContainer ||
      !footerElement
    ) {
      const missing = [];
      if (!mainContainer) missing.push("app");
      if (!titleElement) missing.push("appTitle");
      if (!taglineElement) missing.push("appTagline");
      if (!languageContainer) missing.push("languageSwitcher");
      if (!footerElement) missing.push("appFooter");

      throw new Error(
        `Missing required DOM elements: ${missing.join(", ")}`
      );
    }

    logger.info(CONTEXT, "Application starting...");

    // 🔹 1. Определяем язык из URL (?lang=ua / ?lang=en / ?lang=ru / ?lang=es)
    const SUPPORTED_LANGS = ["ua", "en", "ru", "es"];
    const params = new URLSearchParams(window.location.search);
    let initialLang = params.get("lang");

    // 🔹 2. Если в URL нет или неправильный — пробуем из state или localStorage
    if (!SUPPORTED_LANGS.includes(initialLang)) {
      if (SUPPORTED_LANGS.includes(state.language)) {
        initialLang = state.language;
      } else {
        const saved = localStorage.getItem("mws_lang");
        if (SUPPORTED_LANGS.includes(saved)) {
          initialLang = saved;
        } else {
          initialLang = "ua";
        }
      }
    }

    // 🔹 3. Сохраняем выбор языка для будущих сессий
    localStorage.setItem("mws_lang", initialLang);
    setLanguagePreference(initialLang);

    // 🔹 4. Инициализируем i18n с нужным языком
    await initI18n(initialLang);
    preloadSounds();
    // initI18n уже ставит currentLanguage, но на всякий случай синхронизируем:
    setLanguage(initialLang);

    updateHeaderTexts();
    renderLanguageButtons();
    route(state.route);

    onLanguageChange(() => {
      updateHeaderTexts();
      renderLanguageButtons();
      renderScreen(state.route);
    });

    logger.info(CONTEXT, "Application initialized successfully");
  } catch (error) {
    logger.error(CONTEXT, "Failed to initialize application:", error);
    toast.error("Не удалось загрузить приложение");
    throw error;
  }
}

// Escape key handler with cleanup
const escapeHandler = (event) => {
  if (event.key === "Escape" && state.route !== "settings") {
    // LMS: Блокуємо повернення в налаштування по Escape для учнів
    if (isHomeworkMode) return; 
    route("settings");
  }
};

document.addEventListener("keydown", escapeHandler);

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  logger.debug(CONTEXT, "Cleaning up before unload");
  if (typeof currentCleanup === "function") {
    currentCleanup();
  }
  document.removeEventListener("keydown", escapeHandler);
});

// Start application
bootstrap().catch((error) => {
  logger.error(CONTEXT, "Bootstrap failed:", error);
});
