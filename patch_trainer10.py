import re

with open('ext/math-trainer.js', 'r') as f:
    js_content = f.read()

# Add a 10th floor for target number 9
js_content = js_content.replace(
    "{ y: 76.0, leftX: 42.0, rightX: 58.0 }  // Floor 9",
    "{ y: 76.0, leftX: 42.0, rightX: 58.0 }, // Floor 9\n      { y: 80.5, leftX: 42.0, rightX: 58.0 }  // Floor 10 (for target 9)"
)

with open('ext/math-trainer.js', 'w') as f:
    f.write(js_content)
