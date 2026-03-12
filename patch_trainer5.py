import re

with open('styles.css', 'r') as f:
    css_content = f.read()

# Make sure old CSS is back
fallback_css = """
/* Math House styles (Fallback) */
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
"""

if '.math-house {' not in css_content:
    with open('styles.css', 'a') as f:
        f.write("\n" + fallback_css)
