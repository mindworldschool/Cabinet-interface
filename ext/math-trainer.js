import { generateTask } from './math-logic.js';
import { eventBus, EVENTS } from '../core/utils/events.js';
import { playSound } from '../js/utils/sound.js';

export const BUILDINGS_DATA = {
    1: { name: "Пирамида Хеопса", city: "Гиза", country: "Египет", flag: "🇪🇬" },
    2: { name: "Киево-Печерская лавра", city: "Киев", country: "Украина", flag: "🇺🇦" },
    3: { name: "Биг-Бен", city: "Лондон", country: "Великобритания", flag: "🇬🇧" },
    4: { name: "Тадж-Махал", city: "Агра", country: "Индия", flag: "🇮🇳" },
    5: { name: "Храм Неба", city: "Пекин", country: "Китай", flag: "🇨🇳" },
    6: { name: "Сиднейский оперный театр", city: "Сидней", country: "Австралия", flag: "🇦🇺" },
    7: { name: "Пизанская башня", city: "Пиза", country: "Италия", flag: "🇮🇹" },
    8: { name: "Бурдж-Халифа", city: "Дубай", country: "ОАЭ", flag: "🇦🇪" },
    9: { name: "Статуя Свободы", city: "Нью-Йорк", country: "США", flag: "🇺🇸" },
    10: { name: "Эйфелева башня", city: "Париж", country: "Франция", flag: "🇫🇷" }
};


const BUILDINGS_OVERLAYS = {
  1: {
    image: './assets/buildings/building_1.png',
    target: { x: 50, y: 5 },
    floors: [
      { left: { x: 30.0, y: 80.0 }, right: { x: 70.0, y: 80.0 } },
      { left: { x: 45.0, y: 30.0 }, right: { x: 55.0, y: 30.0 } }
    ]
  },
  2: {
    image: './assets/buildings/building_2.png',
    target: { x: 50, y: 5 },
    floors: [
      { left: { x: 30.0, y: 80.0 }, right: { x: 70.0, y: 80.0 } },
      { left: { x: 36.5, y: 55.0 }, right: { x: 63.5, y: 55.0 } },
      { left: { x: 45.0, y: 30.0 }, right: { x: 55.0, y: 30.0 } }
    ]
  },
  3: {
    image: './assets/buildings/building_3.png',
    target: { x: 50, y: 5 },
    floors: [
      { left: { x: 30.0, y: 80.0 }, right: { x: 70.0, y: 80.0 } },
      { left: { x: 34.0, y: 63.3 }, right: { x: 66.0, y: 63.3 } },
      { left: { x: 39.2, y: 46.7 }, right: { x: 60.8, y: 46.7 } },
      { left: { x: 45.0, y: 30.0 }, right: { x: 55.0, y: 30.0 } }
    ]
  },
  4: {
    image: './assets/buildings/building_4.png',
    target: { x: 50, y: 5 },
    floors: [
      { left: { x: 30.0, y: 80.0 }, right: { x: 70.0, y: 80.0 } },
      { left: { x: 32.8, y: 67.5 }, right: { x: 67.2, y: 67.5 } },
      { left: { x: 36.5, y: 55.0 }, right: { x: 63.5, y: 55.0 } },
      { left: { x: 40.6, y: 42.5 }, right: { x: 59.4, y: 42.5 } },
      { left: { x: 45.0, y: 30.0 }, right: { x: 55.0, y: 30.0 } }
    ]
  },
  5: {
    image: './assets/buildings/building_5.png',
    target: { x: 50, y: 5 },
    floors: [
      { left: { x: 30.0, y: 80.0 }, right: { x: 70.0, y: 80.0 } },
      { left: { x: 32.2, y: 70.0 }, right: { x: 67.8, y: 70.0 } },
      { left: { x: 35.0, y: 60.0 }, right: { x: 65.0, y: 60.0 } },
      { left: { x: 38.1, y: 50.0 }, right: { x: 61.9, y: 50.0 } },
      { left: { x: 41.5, y: 40.0 }, right: { x: 58.5, y: 40.0 } },
      { left: { x: 45.0, y: 30.0 }, right: { x: 55.0, y: 30.0 } }
    ]
  },
  6: {
    image: './assets/buildings/building_6.png',
    target: { x: 50, y: 5 },
    floors: [
      { left: { x: 30.0, y: 80.0 }, right: { x: 70.0, y: 80.0 } },
      { left: { x: 31.7, y: 71.7 }, right: { x: 68.3, y: 71.7 } },
      { left: { x: 34.0, y: 63.3 }, right: { x: 66.0, y: 63.3 } },
      { left: { x: 36.5, y: 55.0 }, right: { x: 63.5, y: 55.0 } },
      { left: { x: 39.2, y: 46.7 }, right: { x: 60.8, y: 46.7 } },
      { left: { x: 42.1, y: 38.3 }, right: { x: 57.9, y: 38.3 } },
      { left: { x: 45.0, y: 30.0 }, right: { x: 55.0, y: 30.0 } }
    ]
  },
  7: {
    image: './assets/buildings/building_7.png',
    target: { x: 50, y: 5 },
    floors: [
      { left: { x: 30.0, y: 80.0 }, right: { x: 70.0, y: 80.0 } },
      { left: { x: 31.5, y: 72.9 }, right: { x: 68.5, y: 72.9 } },
      { left: { x: 33.3, y: 65.7 }, right: { x: 66.7, y: 65.7 } },
      { left: { x: 35.4, y: 58.6 }, right: { x: 64.6, y: 58.6 } },
      { left: { x: 37.7, y: 51.4 }, right: { x: 62.3, y: 51.4 } },
      { left: { x: 40.0, y: 44.3 }, right: { x: 60.0, y: 44.3 } },
      { left: { x: 42.5, y: 37.1 }, right: { x: 57.5, y: 37.1 } },
      { left: { x: 45.0, y: 30.0 }, right: { x: 55.0, y: 30.0 } }
    ]
  },
  8: {
    image: './assets/buildings/building_8.png',
    target: { x: 50, y: -4 },
    floors: [
      { left: { x: 20.0, y: 88.0 }, right: { x: 80.0, y: 88.0 } },
      { left: { x: 21.9, y: 79.9 }, right: { x: 78.1, y: 79.9 } },
      { left: { x: 24.4, y: 71.8 }, right: { x: 75.6, y: 71.8 } },
      { left: { x: 27.1, y: 63.6 }, right: { x: 72.9, y: 63.6 } },
      { left: { x: 30.0, y: 55.5 }, right: { x: 70.0, y: 55.5 } },
      { left: { x: 33.1, y: 47.4 }, right: { x: 66.9, y: 47.4 } },
      { left: { x: 36.3, y: 39.3 }, right: { x: 63.7, y: 39.3 } },
      { left: { x: 39.6, y: 31.1 }, right: { x: 60.4, y: 31.1 } },
      { left: { x: 43.0, y: 23.0 }, right: { x: 57.0, y: 23.0 } }
    ]
  },
  9: {
    image: './assets/buildings/building_9.png',
    target: { x: 50, y: 5 },
    floors: [
      { left: { x: 30.0, y: 80.0 }, right: { x: 70.0, y: 80.0 } },
      { left: { x: 31.1, y: 74.4 }, right: { x: 68.9, y: 74.4 } },
      { left: { x: 32.5, y: 68.9 }, right: { x: 67.5, y: 68.9 } },
      { left: { x: 34.0, y: 63.3 }, right: { x: 66.0, y: 63.3 } },
      { left: { x: 35.7, y: 57.8 }, right: { x: 64.3, y: 57.8 } },
      { left: { x: 37.4, y: 52.2 }, right: { x: 62.6, y: 52.2 } },
      { left: { x: 39.2, y: 46.7 }, right: { x: 60.8, y: 46.7 } },
      { left: { x: 41.1, y: 41.1 }, right: { x: 58.9, y: 41.1 } },
      { left: { x: 43.0, y: 35.6 }, right: { x: 57.0, y: 35.6 } },
      { left: { x: 45.0, y: 30.0 }, right: { x: 55.0, y: 30.0 } }
    ]
  },
  10: {
    image: './assets/buildings/building_10.png',
    target: { x: 50, y: 5 },
    floors: [
      { left: { x: 30.0, y: 80.0 }, right: { x: 70.0, y: 80.0 } },
      { left: { x: 30.9, y: 75.0 }, right: { x: 69.1, y: 75.0 } },
      { left: { x: 32.2, y: 70.0 }, right: { x: 67.8, y: 70.0 } },
      { left: { x: 33.5, y: 65.0 }, right: { x: 66.5, y: 65.0 } },
      { left: { x: 35.0, y: 60.0 }, right: { x: 65.0, y: 60.0 } },
      { left: { x: 36.5, y: 55.0 }, right: { x: 63.5, y: 55.0 } },
      { left: { x: 38.1, y: 50.0 }, right: { x: 61.9, y: 50.0 } },
      { left: { x: 39.8, y: 45.0 }, right: { x: 60.2, y: 45.0 } },
      { left: { x: 41.5, y: 40.0 }, right: { x: 58.5, y: 40.0 } },
      { left: { x: 43.2, y: 35.0 }, right: { x: 56.8, y: 35.0 } },
      { left: { x: 45.0, y: 30.0 }, right: { x: 55.0, y: 30.0 } }
    ]
  }
};


export function mountTrainerUI(container, { t, state, onExitTrainer }) {
  const settings = state.settings;
  const taskCount = settings.taskCount?.count || 3;
  const isInfinite = settings.taskCount?.infinite;

  let currentTaskIndex = 0;
  let correctAnswers = 0; // for stats
  let totalAnswers = 0;   // for stats
  let errorCount = 0;

  let currentTask = null;
  let activeInput = null;
  let allInputs = [];

  let startTime = Date.now();

  // Create Main Layout
  container.innerHTML = '';

  const gameWrapper = document.createElement('div');
  gameWrapper.className = 'math-game-wrapper';
  gameWrapper.style.cssText = 'display: flex; flex-direction: column; width: 100%; height: 100%; max-width: 1200px; margin: 0 auto; padding-bottom: 20px;';

  // Main interactive area (Flex container: Left Column on left, Content on right)
  const mainArea = document.createElement('div');
  mainArea.className = 'math-main-area';
  gameWrapper.appendChild(mainArea);

  const leftColumn = document.createElement('div');
  leftColumn.className = 'math-left-column';

  const progressText = document.createElement('div');
  progressText.style.cssText = 'font-weight: 700; font-size: 1.2rem; color: #7d733a; margin-top: 15px; margin-bottom: 20px; text-align: center; width: 100%;';

  // Custom Numpad
  const numpadPanel = document.createElement('div');
  numpadPanel.className = 'math-numpad-panel';

  const numpadGrid = document.createElement('div');
  numpadGrid.className = 'math-numpad-grid';

  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.className = 'math-numpad-btn';
    btn.textContent = i;

    btn.onmousedown = (e) => {
      e.preventDefault(); // Prevent losing focus on inputs
      btn.classList.add('pressed');
    };
    btn.onmouseup = () => {
      btn.classList.remove('pressed');
    };
    btn.onmouseleave = () => {
      btn.classList.remove('pressed');
    };
    btn.onclick = () => handleNumpadInput(i);

    numpadGrid.appendChild(btn);
  }

  numpadPanel.appendChild(numpadGrid);

  const exitBtnContainer = document.createElement('div');
  exitBtnContainer.style.cssText = 'display: flex; justify-content: center; width: 100%; margin-top: 20px;';

  const exitBtn = document.createElement('button');
  exitBtn.className = 'btn btn--secondary';
  exitBtn.textContent = t('trainer.exitButton');
  exitBtn.onclick = () => {
    eventBus.emit(EVENTS.TRAINING_FINISH, { phase: 'exit' });
  };

  exitBtnContainer.appendChild(exitBtn);

  leftColumn.appendChild(progressText);
  leftColumn.appendChild(numpadPanel);
  leftColumn.appendChild(exitBtnContainer);
  mainArea.appendChild(leftColumn);

  // Content Area (Right Panel: House and Examples)
  const contentArea = document.createElement('div');
  contentArea.className = 'math-content-area';
  mainArea.appendChild(contentArea);

  container.appendChild(gameWrapper);

  // Styling for Layout, House and Examples

  const style = document.createElement('style');
  style.textContent = `

    .math-house-overlay-container {
      position: relative;
      display: inline-block;
    }
    .math-house-image {
      max-width: 100%;
      height: auto;
      display: block;
    }
    .math-house-target-overlay {
      position: absolute;
      transform: translate(-50%, -50%);
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
    }
    .math-input-overlay {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 50px;
      height: 50px;
      text-align: center;
      font-size: 2rem;
      font-weight: 900;
      color: #111;
      background-color: rgba(255, 255, 255, 0.6) !important;
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      border-radius: 4px !important;
      border: 2px solid transparent !important;
      outline: none;
      caret-color: transparent;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }
    .math-input-overlay:focus, .math-input-overlay.active {
      border-color: #ff8c00 !important;
      background-color: rgba(255, 255, 255, 0.9) !important;
      box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.3);
      z-index: 10;
    }
    .math-input-overlay.correct {
      border-color: #10b981 !important;
      color: #065f46;
      background-color: rgba(236, 253, 245, 0.8) !important;
    }
    .math-input-overlay.error {
      border-color: #ef4444 !important;
      color: #991b1b;
      background-color: rgba(254, 242, 242, 0.8) !important;
      animation: shake 0.4s;
    }

    .math-trainer-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      font-family: 'Nunito', sans-serif;
    }
    .math-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .math-progress {
      font-size: 1.2rem;
      font-weight: 700;
      color: #666;
    }
    .math-main-area {
      flex: 1;
      display: flex;
      gap: 30px;
      justify-content: center;
      align-items: flex-start;
      margin-top: 20px;
    }
    .math-left-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      order: 2;
    }
    .math-content-area {
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);

      order: 1;
    }
    .math-numpad-panel {
      width: 320px;
      background: #fff;
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
    }
    .math-numpad-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .math-numpad-btn {
      aspect-ratio: 1;
      border-radius: 12px;
      border: none;
      background: #ff8c00;
      color: white;
      font-size: 2rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 0 #d97706;
      transition: all 0.1s;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .math-numpad-btn:active {
      transform: translateY(4px);
      box-shadow: 0 0 0 #d97706;
    }
    .math-numpad-btn:last-child {
      grid-column: 2; /* Center the 0 */
    }
    .math-numpad-btn:hover {
      background: #ffa500;
    }

    .math-task-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
      width: 100%;
    }

    /* We removed the old house CSS here, keeping only examples and base inputs */
    .math-examples {
      display: flex;
      flex-direction: column;
      gap: 15px;
      font-family: "Nunito", sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #333;
    }
    .math-example-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .math-input {
      width: 60px;
      height: 60px;
      border: 3px solid #cbd5e1;
      border-radius: 12px;
      background: #fff;
      font-size: 2rem;
      font-weight: 800;
      text-align: center;
      color: #333;
      outline: none;
      caret-color: transparent; /* Hide cursor */
    }
    .math-input:focus, .math-input.active {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px rgba(255, 124, 0, 0.2);
    }
    .math-input.correct {
      border-color: #10b981;
      color: #10b981;
      background: #ecfdf5;
    }
    .math-input.error {
      border-color: #ef4444;
      color: #ef4444;
      background: #fef2f2;
      animation: shake 0.4s;
    }
    .math-input[readonly] {
      background: transparent;
      border-color: transparent;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-5px); }
      40%, 80% { transform: translateX(5px); }
    }

    .next-btn-container {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-top: 30px;
    }

    @media (max-width: 900px) {
      .math-main-area {
        flex-direction: column;
        align-items: center;
        padding: 10px;
        gap: 20px;
      }

      .math-left-column {
        display: contents;
      }

      .math-content-area {
        order: 2;
      }

      .math-numpad-panel {
        order: 3;
        width: 100%;
        max-width: 600px;
        padding: 15px;
      }

      .math-numpad-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }

      .math-numpad-btn:last-child {
        grid-column: auto;
      }

      .math-numpad-btn {
        width: clamp(50px, 12vw, 70px);
        height: clamp(50px, 12vw, 70px);
        font-size: clamp(1.2rem, 4vw, 1.8rem);
      }

      .math-content-area {
        width: 100%;
        padding: 20px 10px;
      }
    }

    @media (max-width: 480px) {
      .math-input {
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
      }
      .math-examples {
        font-size: 1.5rem;
      }
    }

    .math-house {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
    }

    .math-house-roof {
      width: 0;
      height: 0;
      border-left: 100px solid transparent;
      border-right: 100px solid transparent;
      border-bottom: 80px solid var(--color-primary);
      position: relative;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      color: white;
      font-size: 2.5rem;
      font-weight: 800;
      padding-top: 30px;
    }

    .math-house-roof::after {
      content: '';
      position: absolute;
      top: 40px;
      left: -20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: white;
      opacity: 0.2;
    }

    .math-house-body {
      display: flex;
      flex-direction: column;
      width: 200px;
      background-color: var(--color-surface);
      border: 4px solid var(--color-primary);
      border-top: none;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .math-house-floor {
      display: flex;
      border-bottom: 2px solid var(--color-primary-light);
    }

    .math-house-floor:last-child {
      border-bottom: none;
    }

    .math-house-room {
      flex: 1;
      padding: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-right: 2px solid var(--color-primary-light);
    }

    .math-house-room:last-child {
      border-right: none;
    }

  `;

  container.appendChild(style);

  // --- LOGIC ---

  function updateProgress() {
    if (isInfinite) {
      progressText.textContent = `${t('game.task') || 'Task:'} ${currentTaskIndex + 1}`;
    } else {
      progressText.textContent = `${t('game.task') || 'Task:'} ${currentTaskIndex + 1} / ${taskCount}`;
    }

  }


  // Overlay config for building_8.png
  // building_8.png is assumed to have 8 floors + 1 roof level.
  // There are 9 rows of pairs. (0+8, 1+7, ..., 8+0)
  // We define percentage coordinates for 9 floors (from top to bottom).
  // The building_8 image needs to be styled relative, inputs absolute.


  // Overlay config for building_8.png (Eiffel Tower)
  // X, Y are in percentages from top-left of the image.

  function renderTask() {
    contentArea.innerHTML = '';
    allInputs = [];
    const oldInfo = document.querySelector('.math-building-info');
    if (oldInfo) oldInfo.remove();

    currentTask = generateTask(settings);

    const taskContainer = document.createElement('div');
    taskContainer.className = 'math-task-container';

    if (currentTask.house) {
      const totalTaskFloors = currentTask.house.length;

      // Check if we can use the overlay config (only if floors match exactly 9, which means target 8)
      // Or if targetNumber is 8 or 9 we should ideally use building_8... wait, if target 9, we need 10 floors. building_8.png has 9.
      // The user wants conditional fallback:
      const currentOverlayConfig = BUILDINGS_OVERLAYS[currentTask.targetNumber];
      const canUseOverlay = !!currentOverlayConfig;

      if (canUseOverlay) {
        // OVERLAY ARCHITECTURE
        const houseWrapper = document.createElement('div');
        houseWrapper.className = 'math-house-overlay';

        const houseImage = document.createElement('img');
        houseImage.src = currentOverlayConfig.image;
        houseImage.className = 'math-house-image';

        const overlayContainer = document.createElement('div');
        overlayContainer.className = 'math-house-overlay-container';
        overlayContainer.appendChild(houseImage);

        // Target Number
        const targetElement = document.createElement('div');
        targetElement.className = 'math-house-target-overlay';
        targetElement.textContent = currentTask.targetNumber;
        targetElement.style.left = `${currentOverlayConfig.target.x}%`;
        targetElement.style.top = `${currentOverlayConfig.target.y}%`;
        overlayContainer.appendChild(targetElement);

        currentTask.house.forEach((floor, index) => {
          const floorConfig = currentOverlayConfig.floors[index];
          if (!floorConfig) return; // fallback if somehow floors mismatch

          // Left room
          const leftInput = createInput(floor.left, floor.expectedLeft);
          leftInput.classList.add('math-input-overlay');
          const centerX = (floorConfig.left.x + floorConfig.right.x) / 2;
          leftInput.style.left = `calc(${centerX}% - 2.5px)`;
          leftInput.style.top = `${floorConfig.left.y}%`;
          leftInput.style.transform = 'translate(-100%, -50%)';
          overlayContainer.appendChild(leftInput);

          // Right room
          const rightInput = createInput(floor.right, floor.expectedRight);
          rightInput.classList.add('math-input-overlay');
          rightInput.style.left = `calc(${centerX}% + 2.5px)`;
          rightInput.style.top = `${floorConfig.right.y}%`;
          rightInput.style.transform = 'translate(0%, -50%)';
          overlayContainer.appendChild(rightInput);
        });

        houseWrapper.appendChild(overlayContainer);
        taskContainer.appendChild(houseWrapper);
      } else {
        // CSS FALLBACK ARCHITECTURE
        const houseWrapper = document.createElement('div');
        houseWrapper.className = 'math-house';

        const roof = document.createElement('div');
        roof.className = 'math-house-roof';
        roof.textContent = currentTask.targetNumber;
        houseWrapper.appendChild(roof);

        const houseBody = document.createElement('div');
        houseBody.className = 'math-house-body';

        currentTask.house.forEach(floor => {
          const floorDiv = document.createElement('div');
          floorDiv.className = 'math-house-floor';

          const leftRoom = document.createElement('div');
          leftRoom.className = 'math-house-room';
          const leftInput = createInput(floor.left, floor.expectedLeft);
          leftRoom.appendChild(leftInput);

          const rightRoom = document.createElement('div');
          rightRoom.className = 'math-house-room';
          const rightInput = createInput(floor.right, floor.expectedRight);
          rightRoom.appendChild(rightInput);

          floorDiv.appendChild(leftRoom);
          floorDiv.appendChild(rightRoom);
          houseBody.appendChild(floorDiv);
        });

        houseWrapper.appendChild(houseBody);
        taskContainer.appendChild(houseWrapper);
      }
    }

    if (currentTask.examples) {
      const examplesWrapper = document.createElement('div');
      examplesWrapper.className = 'math-examples';

      currentTask.examples.forEach(ex => {
        const row = document.createElement('div');
        row.className = 'math-example-row';

        const aInput = createInput(ex.a, ex.expectedA);
        const opNode = document.createTextNode(` ${ex.operator} `);
        const bInput = createInput(ex.b, ex.expectedB);
        const eqNode = document.createTextNode(' = ');
        const resInput = createInput(ex.result, ex.expectedResult);

        row.append(aInput, opNode, bInput, eqNode, resInput);
        examplesWrapper.appendChild(row);
      });

      taskContainer.appendChild(examplesWrapper);
    }

    const layoutWrapper = document.createElement('div');
    layoutWrapper.style.width = '100%';
    layoutWrapper.appendChild(taskContainer);

    const nextBtnContainer = document.createElement('div');
    nextBtnContainer.className = 'next-btn-container';
    nextBtnContainer.id = 'nextBtnContainer';
    nextBtnContainer.style.display = 'none';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn--primary';
    nextBtn.textContent = t('game.next') || 'Next';
    nextBtn.style.fontSize = '1.2rem';
    nextBtn.style.padding = '15px 40px';
    nextBtn.onclick = handleNextTask;
    nextBtnContainer.appendChild(nextBtn);

    layoutWrapper.appendChild(nextBtnContainer);

    contentArea.appendChild(layoutWrapper);

    updateProgress();
    focusNextInput();
  }
function createInput(value, expected) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'math-input';
    input.readOnly = true; // Prevent system keyboard

    if (value !== null) {
      input.value = value;
      input.style.border = 'none';
      input.style.background = 'transparent';
      // It's a static value, not an interactive input
      input.dataset.static = "true";
    } else {
      input.dataset.expected = expected;
      input.onclick = () => {
        if (!input.classList.contains('correct')) {
          setActiveInput(input);
        }
      };
      allInputs.push(input);
    }

    return input;
  }

  function setActiveInput(input) {
    if (activeInput) {
      activeInput.classList.remove('active');
    }
    activeInput = input;
    if (activeInput) {
      activeInput.classList.add('active');
    }
  }

  function focusNextInput() {
    const nextEmpty = allInputs.find(i => !i.classList.contains('correct'));
    setActiveInput(nextEmpty || null);

    if (!activeInput) {
      checkTaskCompletion();
    }
  }

  // Basic debounce logic to avoid double clicks
  let isProcessing = false;

  function handleNumpadInput(numStr) {
    if (!activeInput || isProcessing) return;

    isProcessing = true;
    const input = activeInput;
    const expected = input.dataset.expected;

    input.value = numStr;
    totalAnswers++;

    if (String(numStr) === String(expected)) {
      // Correct
      input.classList.remove('error', 'active');
      input.classList.add('correct');
      correctAnswers++;
      playSound('correct');

      setTimeout(() => {
        isProcessing = false;
        focusNextInput();
      }, 300);

    } else {
      // Error
      input.classList.remove('active');
      input.classList.add('error');
      errorCount++;
      playSound('wrong');

      setTimeout(() => {
        input.value = '';
        input.classList.remove('error');
        input.classList.add('active'); // Keep focus
        isProcessing = false;
      }, 600);
    }
  }

  function checkTaskCompletion() {
    const isAllCorrect = allInputs.every(i => i.classList.contains('correct'));

    if (isAllCorrect) {
      if (typeof showBuildingInfo === 'function' && currentTask && currentTask.targetNumber) {
          showBuildingInfo(currentTask.targetNumber);
      }

      if (!isInfinite && currentTaskIndex + 1 >= taskCount) {
        // Last task finished, small delay then results
        setTimeout(() => {
          finishGame();
        }, 4000); // Wait longer so the building info can be read
      } else {
        // Show Next button
        const nextBtnCont = document.getElementById('nextBtnContainer');
        if (nextBtnCont) {
          nextBtnCont.style.display = 'flex';
        }
      }
    }
  }

  function handleNextTask() {
    currentTaskIndex++;
    renderTask();
  }

  function finishGame() {
    const totalTimeMs = Date.now() - startTime;
    eventBus.emit(EVENTS.TRAINING_FINISH, {
      phase: 'done',
      correct: correctAnswers,
      total: totalAnswers,
      errorCount: errorCount,
      totalTimeMs: totalTimeMs
    });
  }

  // Start the first task
  renderTask();

  return function cleanup() {
    container.innerHTML = '';
  };
}

function showBuildingInfo(number) {
    const data = BUILDINGS_DATA[number];
    if (!data) return;

    // Check if it already exists
    if (document.querySelector('.math-building-info')) return;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'math-building-info math-animate-pop';
    infoDiv.innerHTML = `

        <div class="math-building-details">
            <h3 class="math-building-name">${data.name}</h3>
            <p class="math-building-location">${data.country}, ${data.city}</p>
        </div>
    `;

    // Append it to the main area, maybe centered as an absolute overlay
    const gameWrapper = document.querySelector('.math-game-wrapper');
    infoDiv.style.position = 'absolute';
    infoDiv.style.bottom = '30px';
    infoDiv.style.right = '30px';
    infoDiv.style.maxWidth = '300px';
    infoDiv.style.zIndex = '1000';
    infoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    infoDiv.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    infoDiv.style.padding = '20px 40px';
    infoDiv.style.border = '4px solid #ff9800';
    infoDiv.style.borderRadius = '20px';

    // Animate pop override
    infoDiv.style.animation = 'math-pop-center 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both';

    // Add custom keyframes
    const styleBlock = document.createElement('style');
    styleBlock.textContent = `
      @keyframes math-pop-center {
        0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
        100% { transform: translate(0, 0) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(styleBlock);

    if (gameWrapper) {
        gameWrapper.style.position = 'relative';
        gameWrapper.appendChild(infoDiv);
    } else {
        document.body.appendChild(infoDiv);
    }

}
