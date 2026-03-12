import re

with open('ext/math-trainer.js', 'r') as f:
    content = f.read()

# Replace the style block
style_block = """
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
  `;
"""
content = re.sub(r'const style = document\.createElement\(\'style\'\);.*? container\.appendChild\(style\);', style_block + "\n  container.appendChild(style);", content, flags=re.DOTALL)
with open('ext/math-trainer.js', 'w') as f:
    f.write(content)
