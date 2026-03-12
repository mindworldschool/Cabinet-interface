import { generateTask } from './math-logic.js';
import { eventBus, EVENTS } from '../core/utils/events.js';
import { playSound } from '../js/utils/sound.js';

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
  progressText.style.cssText = 'font-weight: 700; font-size: 1.2rem; color: #7d733a; margin-top: 15px; margin-bottom: 20px; align-self: flex-start;';

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
  exitBtnContainer.style.cssText = 'display: flex; justify-content: flex-end; width: 100%; margin-top: 20px;';

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
      justify-content: center;
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

  const OVERLAY_CONFIG_8 = {
    image: './assets/buildings/building_8.png',
    floors: [
      { y: 39.0, leftX: 42.0, rightX: 58.0 }, // Floor 1
      { y: 44.0, leftX: 42.0, rightX: 58.0 }, // Floor 2
      { y: 49.0, leftX: 42.0, rightX: 58.0 }, // Floor 3
      { y: 53.5, leftX: 42.0, rightX: 58.0 }, // Floor 4
      { y: 58.0, leftX: 42.0, rightX: 58.0 }, // Floor 5
      { y: 62.5, leftX: 42.0, rightX: 58.0 }, // Floor 6
      { y: 67.0, leftX: 42.0, rightX: 58.0 }, // Floor 7
      { y: 71.5, leftX: 42.0, rightX: 58.0 }, // Floor 8
      { y: 76.0, leftX: 42.0, rightX: 58.0 }, // Floor 9
      { y: 80.5, leftX: 42.0, rightX: 58.0 }  // Floor 10 (for target 9)
    ],
    target: { x: 50.0, y: 34.0 } // Top of the tower
  };
function renderTask() {
    contentArea.innerHTML = '';
    allInputs = [];
    currentTask = generateTask(settings);

    const taskContainer = document.createElement('div');
    taskContainer.className = 'math-task-container';

    if (currentTask.house) {
      const totalTaskFloors = currentTask.house.length;

      // Check if we can use the overlay config (only if floors match exactly 9, which means target 8)
      // Or if targetNumber is 8 or 9 we should ideally use building_8... wait, if target 9, we need 10 floors. building_8.png has 9.
      // The user wants conditional fallback:
      const canUseOverlay = totalTaskFloors <= OVERLAY_CONFIG_8.floors.length;

      if (canUseOverlay && (currentTask.targetNumber === 8 || currentTask.targetNumber === 9)) {
        // OVERLAY ARCHITECTURE
        const houseWrapper = document.createElement('div');
        houseWrapper.className = 'math-house-overlay';

        const houseImage = document.createElement('img');
        houseImage.src = OVERLAY_CONFIG_8.image;
        houseImage.className = 'math-house-image';

        const overlayContainer = document.createElement('div');
        overlayContainer.className = 'math-house-overlay-container';
        overlayContainer.appendChild(houseImage);

        // Target Number
        const targetElement = document.createElement('div');
        targetElement.className = 'math-house-target-overlay';
        targetElement.textContent = currentTask.targetNumber;
        targetElement.style.left = `${OVERLAY_CONFIG_8.target.x}%`;
        targetElement.style.top = `${OVERLAY_CONFIG_8.target.y}%`;
        overlayContainer.appendChild(targetElement);

        currentTask.house.forEach((floor, index) => {
          const floorConfig = OVERLAY_CONFIG_8.floors[index];

          // Left room
          const leftInput = createInput(floor.left, floor.expectedLeft);
          leftInput.classList.add('math-input-overlay');
          leftInput.style.left = `${floorConfig.leftX}%`;
          leftInput.style.top = `${floorConfig.y}%`;
          overlayContainer.appendChild(leftInput);

          // Right room
          const rightInput = createInput(floor.right, floor.expectedRight);
          rightInput.classList.add('math-input-overlay');
          rightInput.style.left = `${floorConfig.rightX}%`;
          rightInput.style.top = `${floorConfig.y}%`;
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
      if (!isInfinite && currentTaskIndex + 1 >= taskCount) {
        // Last task finished, small delay then results
        setTimeout(() => {
          finishGame();
        }, 1000);
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