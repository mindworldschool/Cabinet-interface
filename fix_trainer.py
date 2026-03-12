import os

with open('ext/math-trainer.js', 'r') as f:
    content = f.read()

# We need to find the part where it generates the floors and replace it with a conditional approach
search_block = """
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
"""

# And the wrapping house image creation needs to be conditional based on whether we use building_8 or CSS layout
# Let's see the whole block

import re
