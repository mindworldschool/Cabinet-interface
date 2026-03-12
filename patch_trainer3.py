import re

with open('ext/math-trainer.js', 'r') as f:
    content = f.read()

# Replace the OVERLAY_CONFIG_8 object with updated coordinates
new_config = """
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
      { y: 76.0, leftX: 42.0, rightX: 58.0 }  // Floor 9
    ],
    target: { x: 50.0, y: 34.0 } // Top of the tower
  };
"""

content = re.sub(r'const OVERLAY_CONFIG_8 = \{.*?\}\s*;\s*', new_config, content, flags=re.DOTALL)

with open('ext/math-trainer.js', 'w') as f:
    f.write(content)
