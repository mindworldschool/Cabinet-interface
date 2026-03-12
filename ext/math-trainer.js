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

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; flex-shrink: 0;';

  const progressText = document.createElement('div');
  progressText.style.cssText = 'font-weight: 700; font-size: 1.2rem; color: #7d733a;';

  const exitBtn = document.createElement('button');
  exitBtn.className = 'btn btn--secondary';
  exitBtn.textContent = t('trainer.exitButton');
  exitBtn.onclick = () => {
    eventBus.emit(EVENTS.TRAINING_FINISH, { phase: 'exit' });
  };

  header.append(progressText, exitBtn);
  gameWrapper.appendChild(header);

  // Main interactive area (Flex container: Numpad on left, House on right)
  const mainArea = document.createElement('div');
  mainArea.className = 'math-main-area';
  gameWrapper.appendChild(mainArea);

  // Custom Numpad (Left Panel)
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
  mainArea.appendChild(numpadPanel);

  // Content Area (Right Panel: House and Examples)
  const contentArea = document.createElement('div');
  contentArea.className = 'math-content-area';
  mainArea.appendChild(contentArea);

  container.appendChild(gameWrapper);

  // Styling for Layout, House and Examples
  const style = document.createElement('style');
  style.textContent = `
    .math-main-area {
      display: flex;
      flex-direction: row;
      flex: 1;
      width: 100%;
      gap: 40px;
      align-items: flex-start;
      padding: 20px;
      box-sizing: border-box;
    }

    .math-numpad-panel {
      flex: 0 0 auto;
      background: #fff;
      border-radius: 24px;
      padding: 20px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .math-numpad-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      justify-items: center;
    }

    /* 10 is centered in the last row */
    .math-numpad-btn:last-child {
      grid-column: 2;
    }

    .math-numpad-btn {
      width: 70px;
      height: 70px;
      border-radius: 16px;
      border: none;
      background: var(--color-primary);
      color: #fff;
      font-size: 1.8rem;
      font-weight: 700;
      font-family: "Nunito", sans-serif;
      cursor: pointer;
      box-shadow: 0 6px 0 var(--color-primary-dark);
      transition: transform 0.1s, box-shadow 0.1s;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .math-numpad-btn.pressed {
      transform: translateY(6px);
      box-shadow: 0 0 0 var(--color-primary-dark);
    }

    .math-content-area {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fdf8f3;
      border-radius: 24px;
      padding: 30px;
      box-shadow: inset 0 4px 12px rgba(0,0,0,0.05);
      min-height: 400px;
    }

    .math-task-container {
      display: flex;
      flex-direction: column;
      gap: 40px;
      width: 100%;
      align-items: center;
    }
    .math-house {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 320px;
    }
    .house-roof {
      width: 0;
      height: 0;
      border-left: 100px solid transparent;
      border-right: 100px solid transparent;
      border-bottom: 100px solid #ef4444;
      position: relative;
      margin-bottom: 5px;
    }
    .house-target {
      position: absolute;
      top: 40px;
      left: -20px;
      width: 40px;
      text-align: center;
      color: white;
      font-size: 2.5rem;
      font-weight: 800;
      font-family: "Nunito", sans-serif;
    }
    .house-body {
      width: 100%;
      background: #fef3c7;
      border: 4px solid #d97706;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
    }
    .house-floor {
      display: flex;
      border-bottom: 4px solid #d97706;
    }
    .house-floor:last-child {
      border-bottom: none;
    }
    .house-room {
      flex: 1;
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-right: 4px solid #d97706;
    }
    .house-room:last-child {
      border-right: none;
    }
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
        flex-direction: column-reverse;
        align-items: center;
        padding: 10px;
        gap: 20px;
      }

      .math-numpad-panel {
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
      .house-roof {
        border-left-width: 120px;
        border-right-width: 120px;
        border-bottom-width: 100px;
      }
      .house-target {
        top: 30px;
        left: -15px;
        font-size: 2rem;
      }
      .math-input {
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
      }
      .math-examples {
        font-size: 1.5rem;
      }
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

  function renderTask() {
    contentArea.innerHTML = '';
    allInputs = [];
    currentTask = generateTask(settings);

    const taskContainer = document.createElement('div');
    taskContainer.className = 'math-task-container';

    if (currentTask.house) {
      const houseWrapper = document.createElement('div');
      houseWrapper.className = 'math-house';

      const roof = document.createElement('div');
      roof.className = 'house-roof';
      const target = document.createElement('div');
      target.className = 'house-target';
      target.textContent = currentTask.targetNumber;
      roof.appendChild(target);
      houseWrapper.appendChild(roof);

      const body = document.createElement('div');
      body.className = 'house-body';

      currentTask.house.forEach((floor) => {
        const floorRow = document.createElement('div');
        floorRow.className = 'house-floor';

        // Left room
        const leftRoom = document.createElement('div');
        leftRoom.className = 'house-room';
        const leftInput = createInput(floor.left, floor.expectedLeft);
        leftRoom.appendChild(leftInput);

        // Right room
        const rightRoom = document.createElement('div');
        rightRoom.className = 'house-room';
        const rightInput = createInput(floor.right, floor.expectedRight);
        rightRoom.appendChild(rightInput);

        floorRow.append(leftRoom, rightRoom);
        body.appendChild(floorRow);
      });

      houseWrapper.appendChild(body);
      taskContainer.appendChild(houseWrapper);
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