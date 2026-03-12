import re

with open('ext/math-trainer.js', 'r') as f:
    content = f.read()

# Replace the HTML generator part
new_render_task = """
  // Overlay config for building_8.png
  // building_8.png is assumed to have 8 floors + 1 roof level.
  // There are 9 rows of pairs. (0+8, 1+7, ..., 8+0)
  // We define percentage coordinates for 9 floors (from top to bottom).
  // The building_8 image needs to be styled relative, inputs absolute.

  const OVERLAY_CONFIG_8 = {
    image: './assets/buildings/building_8.png',
    // We will define floor configurations (from top floor to bottom floor).
    // building_8.png has 9 rows of windows.
    // X, Y are in percentages from top-left of the image.
    // Left input X, Right input X, and Y for the row.
    floors: [
      { y: 20.0, leftX: 30.0, rightX: 60.0 }, // Floor 1 (top)
      { y: 28.5, leftX: 30.0, rightX: 60.0 }, // Floor 2
      { y: 37.0, leftX: 30.0, rightX: 60.0 }, // Floor 3
      { y: 45.5, leftX: 30.0, rightX: 60.0 }, // Floor 4
      { y: 54.0, leftX: 30.0, rightX: 60.0 }, // Floor 5
      { y: 62.5, leftX: 30.0, rightX: 60.0 }, // Floor 6
      { y: 71.0, leftX: 30.0, rightX: 60.0 }, // Floor 7
      { y: 79.5, leftX: 30.0, rightX: 60.0 }, // Floor 8
      { y: 88.0, leftX: 30.0, rightX: 60.0 }  // Floor 9 (bottom)
    ],
    // The target number is in the roof
    target: { x: 50.0, y: 8.0 }
  };

  function renderTask() {
    contentArea.innerHTML = '';
    allInputs = [];
    currentTask = generateTask(settings);

    const taskContainer = document.createElement('div');
    taskContainer.className = 'math-task-container';

    if (currentTask.house) {
      // OVERLAY ARCHITECTURE
      const houseWrapper = document.createElement('div');
      houseWrapper.className = 'math-house-overlay';

      const houseImage = document.createElement('img');
      // For now, only using building_8.png for all numbers as a test,
      // or we can select it if targetNumber is 8, but since we only have building_8.png:
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

      // Render Floors based on task house length vs config
      const totalTaskFloors = currentTask.house.length;

      // We map the task floors to the available config floors.
      // If task has fewer floors than building_8, we center them or just use top ones.
      // E.g. target 5 has 6 floors. Config has 9.
      // Let's just use the first `totalTaskFloors` config entries, offset by (9 - totalTaskFloors)/2 roughly,
      // or just start from the bottom. Usually, a building image matches the target exactly.
      // Since we only have building_8.png, we will map from the top down.

      currentTask.house.forEach((floor, index) => {
        // Fallback safely if we exceed config
        const configIndex = Math.min(index, OVERLAY_CONFIG_8.floors.length - 1);
        const floorConfig = OVERLAY_CONFIG_8.floors[configIndex];

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
"""

content = re.sub(r'function renderTask\(\) \{.*?(?=function createInput)', new_render_task, content, flags=re.DOTALL)

with open('ext/math-trainer.js', 'w') as f:
    f.write(content)
