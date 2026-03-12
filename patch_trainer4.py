import re

with open('ext/math-trainer.js', 'r') as f:
    content = f.read()

# We need to add the fallback logic inside `renderTask` when `currentTask.house` is generated
# Original logic before the last change used `.math-house`, `.math-house-roof`, `.math-house-body`, `.math-house-floor`, `.math-house-room`

fallback_html_generator = """
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
"""

content = re.sub(
    r'// OVERLAY ARCHITECTURE.*?houseWrapper\.appendChild\(overlayContainer\);\s*taskContainer\.appendChild\(houseWrapper\);',
    fallback_html_generator.strip(),
    content,
    flags=re.DOTALL
)

with open('ext/math-trainer.js', 'w') as f:
    f.write(content)
