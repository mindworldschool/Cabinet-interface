// ui/game.js — Training screen wrapper
import { createStepIndicator } from "./helper.js";
import { setResults, state as globalState, resetResults } from "../core/state.js";
import { eventBus, EVENTS } from "../core/utils/events.js";
import { logger } from "../core/utils/logger.js";
import toast from "./components/Toast.js";
import { saveHomeworkResult, getHwId } from "../core/homework.js";

const CONTEXT = "GameScreen";

export async function renderGame(container, { t, state, navigate }) {
  // Очищаем контейнер
  container.innerHTML = "";

  // Обёртка экрана
  const section = document.createElement("section");
  section.className = "screen game-screen";

  // Индикация шага мастера (навигация по шагам)
  const indicator = createStepIndicator("game", t);
  section.appendChild(indicator);

  // Тело, куда маунтим тренажёр
  const body = document.createElement("div");
  body.className = "screen__body";
  section.appendChild(body);

  container.appendChild(section);

  // ====== EVENT: TRAINING_FINISH ======
  const unsubscribe = eventBus.on(EVENTS.TRAINING_FINISH, (stats) => {
    logger.info(CONTEXT, "TRAINING_FINISH event:", stats);

    // Если это нормальный финиш
    if (stats.phase === "done") {
      const isRetry = globalState.retryMode?.enabled === true;

      // СОХРАНЯЕМ РЕЗУЛЬТАТЫ (добавили totalTimeMs)
      setResults({
        success: stats.correct || 0,
        total: stats.total || 0,
        wrongExamples: stats.wrongExamples || [],
        totalTimeMs: stats.totalTimeMs || 0 // <-- Новое поле для подсчета скорости
      });

      // Вырубаем retryMode.enabled = false, если ошибок больше нет
      if (!stats.wrongExamples || stats.wrongExamples.length === 0) {
        globalState.retryMode = {
          enabled: false,
          examples: []
        };
      }

      // Save to Firestore if opened in homework mode
      if (getHwId()) {
        saveHomeworkResult({ success: stats.correct || 0, total: stats.total || 0 }, isRetry)
          .then(() => toast.success(isRetry ? '✅ Результат виправлення збережено!' : '✅ ДЗ збережено!'))
          .catch(() => toast.error('⚠️ Не вдалося зберегти результат. Перевір інтернет.'));
      }

      navigate("results");
      return;
    }

    // Если пользователь нажал "⏹ Выйти"
    if (stats.phase === "exit") {
      resetResults();
      globalState.retryMode = {
        enabled: false,
        examples: []
      };
      navigate("settings");
      return;
    }

    // fallback
    logger.warn(CONTEXT, "Unknown training finish phase, defaulting to results");
    setResults({
      success: stats.correct || 0,
      total: stats.total || 0,
      wrongExamples: stats.wrongExamples || [],
      totalTimeMs: stats.totalTimeMs || 0
    });
    navigate("results");
  });

  try {
    // ДИНАМИЧЕСКИ ГРУЗИМ НОВЫЙ ТРЕНАЖЕР СТРУПА
    const module = await import("../ext/stroop-trainer.js");
    
    if (!module?.mountTrainerUI) {
      throw new Error("Module stroop-trainer.js loaded but mountTrainerUI not found");
    }

    logger.info(CONTEXT, "Mounting trainer...");

    const isRetryMode = globalState.retryMode?.enabled === true;
    const effectiveSettings = isRetryMode 
      ? (globalState.lastSettings || state.settings)
      : state.settings;
    
    if (!isRetryMode) {
      globalState.lastSettings = state.settings;
    }

    const cleanupTrainer = module.mountTrainerUI(body, {
      t,
      state: { settings: effectiveSettings },
      retryMode: globalState.retryMode || {
        enabled: false,
        examples: []
      },

      onExitTrainer: () => {
        logger.info(CONTEXT, "Exit pressed → navigate(settings)");
        resetResults();
        globalState.retryMode = { enabled: false, examples: [] };
        navigate("settings");
      },

      onShowResultsScreen: () => {
        logger.info(CONTEXT, "Session done → navigate(results)");
        navigate("results");
      }
    });

    return () => {
      logger.debug(CONTEXT, "Cleaning up game screen");
      unsubscribe();
      if (typeof cleanupTrainer === "function") {
        cleanupTrainer();
      }
    };
  } catch (error) {
    logger.error(CONTEXT, "Failed to load trainer:", error);

    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = "color:#d93025; padding:20px; font-weight:600;";

    const message = document.createTextNode("Не удалось загрузить тренажёр.");
    const br = document.createElement("br");
    const small = document.createElement("small");
    small.textContent = error.message;

    errorDiv.append(message, br, small);
    body.appendChild(errorDiv);

    toast.error("Не удалось загрузить тренажёр");

    return () => {
      unsubscribe();
    };
  }
}
