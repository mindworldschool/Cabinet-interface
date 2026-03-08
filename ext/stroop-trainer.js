/**
 * Stroop Effect Trainer - Game Engine
 */
import { generateStroopTask } from './stroop-logic.js';
import { eventBus, EVENTS } from '../core/utils/events.js';

export function mountTrainerUI(container, { t, state, retryMode, onExitTrainer }) {
  // --- 1. ИНИЦИАЛИЗАЦИЯ СОСТОЯНИЯ ---
  const settings = state.settings;
  
  // Определяем количество раундов (если это режим работы над ошибками, берем их количество)
  const isRetry = retryMode && retryMode.enabled;
  const isInfinite = !isRetry && settings.examples.infinite;
  const totalExamples = isRetry ? retryMode.examples.length : settings.examples.count;
  
  let currentExampleIndex = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let wrongExamplesList = []; // Сюда будем сохранять ошибки для режима "Повторить"
  
  let sessionStartTime = Date.now();
  let questionStartTime = 0;
  let totalTimeMs = 0;

  // --- 2. СОЗДАНИЕ ИНТЕРФЕЙСА (UI) ---
  container.innerHTML = ''; // Очищаем контейнер

  const gameWrapper = document.createElement('div');
  gameWrapper.className = 'stroop-game-wrapper';
  gameWrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; gap: 40px;';

  // 2.1. Шапка со статистикой и кнопкой выхода
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 20px; margin-bottom: 20px;';

  const statsDiv = document.createElement('div');
  statsDiv.style.cssText = 'display: flex; gap: 20px; font-weight: 600; font-size: 1.1rem;';
  
  const correctEl = document.createElement('span');
  correctEl.style.color = '#10B981'; // Зеленый
  correctEl.textContent = `${t('trainer.correctLabel') || 'Верно:'} 0`;

  const wrongEl = document.createElement('span');
  wrongEl.style.color = '#EF4444'; // Красный
  wrongEl.textContent = `${t('trainer.incorrectLabel') || 'Ошибки:'} 0`;

  statsDiv.append(correctEl, wrongEl);

  const exitBtn = document.createElement('button');
  exitBtn.className = 'btn btn--secondary';
  exitBtn.textContent = t('trainer.exitButton');
  exitBtn.onclick = () => {
    // Отправляем событие о досрочном выходе
    eventBus.emit(EVENTS.TRAINING_FINISH, { phase: 'exit' });
  };

  header.append(statsDiv, exitBtn);

  // 2.2. Главное слово (Стимул)
  const wordDisplay = document.createElement('div');
  wordDisplay.style.cssText = 'font-size: clamp(4rem, 12vw, 7rem); font-family: "Nunito", Arial, sans-serif; font-weight: 800; text-transform: uppercase; text-align: center; letter-spacing: 0.05em; text-shadow: 0 4px 12px rgba(0,0,0,0.1); min-height: 120px; display: flex; align-items: center;';

  // 2.3. Контейнер для кнопок-ответов
  const optionsContainer = document.createElement('div');
  optionsContainer.style.cssText = 'display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; width: 100%; max-width: 800px;';

  // Прогресс-бар (опционально, для красоты)
  const progressContainer = document.createElement('div');
  progressContainer.style.cssText = 'width: 100%; max-width: 400px; height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden; margin-top: 20px;';
  const progressBar = document.createElement('div');
  progressBar.style.cssText = 'height: 100%; background: var(--color-primary); width: 0%; transition: width 0.3s ease;';
  progressContainer.appendChild(progressBar);

  gameWrapper.append(header, wordDisplay, optionsContainer, progressContainer);
  container.appendChild(gameWrapper);

  

  // --- 3. ЛОГИКА ИГРЫ ---

  function updateStatsUI() {
    correctEl.textContent = `${t('trainer.correctLabel') || 'Верно:'} ${correctAnswers}`;
    wrongEl.textContent = `${t('trainer.incorrectLabel') || 'Ошибки:'} ${wrongAnswers}`;
    if (!isInfinite) {
      const progress = (currentExampleIndex / totalExamples) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }

  function finishGame() {
    // Отправляем финальные результаты в GameScreen
    eventBus.emit(EVENTS.TRAINING_FINISH, {
      phase: 'done',
      correct: correctAnswers,
      total: currentExampleIndex,
      wrongExamples: wrongExamplesList,
      totalTimeMs: totalTimeMs
    });
  }

  function renderNextQuestion() {
    // Проверка на завершение игры
    if (!isInfinite && currentExampleIndex >= totalExamples) {
      finishGame();
      return;
    }

    updateStatsUI();

    // Генерируем новый вопрос через нашу логику
    // Формируем настройки: { colorsCount: 4, isHardcore: true/false }
    const taskSettings = {
      colorsCount: parseInt(settings.colorsCount) || 4,
      isHardcore: settings.gameMode === 'hardcore'
    };

    const task = generateStroopTask(taskSettings);
    
    // Засекаем время появления слова
    questionStartTime = Date.now();

    // Отрисовываем главное слово
    // task.question.textId вернет что-то типа 'color_red', мы переводим это через i18n
    wordDisplay.textContent = t(`colors.${task.question.textId}`);
    wordDisplay.style.color = task.question.hex;
    // White is invisible on cream background — add 1px stroke
    wordDisplay.style.webkitTextStroke = task.question.hex.toUpperCase() === '#FFFFFF'
      ? '1px rgba(0,0,0,0.45)'
      : '';

    // Очищаем старые кнопки
    optionsContainer.innerHTML = '';

    // Отрисовываем новые кнопки
    task.options.forEach(option => {
      const btn = document.createElement('button');
      // White is invisible on white button — add 1px stroke
      const textStroke = option.hex.toUpperCase() === '#FFFFFF' ? '-webkit-text-stroke: 1px rgba(0,0,0,0.45);' : '';

      btn.style.cssText = `
        flex: 1 1 auto;
        min-width: 180px;
        max-width: 260px;
        padding: 8px 12px;
        font-size: clamp(1rem, 2.5vw, 1.4rem);
        font-weight: 700;
        font-family: "Nunito", Arial, sans-serif;
        text-transform: uppercase;
        border: 2px solid rgba(0,0,0,0.1);
        border-radius: 16px;
        background: #FFFFFF;
        color: ${option.hex};
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        transition: transform 0.1s, box-shadow 0.1s;
        white-space: nowrap;
        text-align: center;
        line-height: 1;
        height: auto;
        min-height: 56px;
        ${textStroke}
      `;

      // Добавляем эффект нажатия
      btn.onmousedown = () => btn.style.transform = 'scale(0.95)';
      btn.onmouseup = () => btn.style.transform = 'scale(1)';
      btn.onmouseleave = () => btn.style.transform = 'scale(1)';

      btn.textContent = t(`colors.${option.textId}`);

      btn.onclick = () => handleAnswer(option, task);

      optionsContainer.appendChild(btn);
    });
  }

  function handleAnswer(selectedOption, currentTask) {
    // Считаем время, затраченное на этот ответ
    const timeTaken = Date.now() - questionStartTime;
    totalTimeMs += timeTaken;

    if (selectedOption.isCorrect) {
      // Правильный ответ
      correctAnswers++;
      // Здесь можно добавить воспроизведение звука, если в проекте есть sound.js
      // playCorrectSound(); 
    } else {
      // Ошибка
      wrongAnswers++;
      wrongExamplesList.push(currentTask); // Сохраняем, чтобы потом передать в "Повторить ошибки"
      
      // Визуальный фидбек ошибки (красная вспышка экрана)
      const flash = document.createElement('div');
      flash.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(239, 68, 68, 0.2); z-index: 9999; pointer-events: none; transition: opacity 0.3s ease;';
      document.body.appendChild(flash);
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 300);
      }, 100);
      
      // playWrongSound();
    }

    currentExampleIndex++;
    renderNextQuestion();
  }

  // --- 4. ЗАПУСК ИГРЫ ---
  renderNextQuestion();

  // Функция очистки (вызывается при уходе с экрана)
  return function cleanup() {
    container.innerHTML = '';
  };
}
