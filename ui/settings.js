import { createScreenShell, createButton, createStepIndicator } from "./helper.js";
import { state } from "../core/state.js";

// Вспомогательные функции оставляем без изменений, они отличные!
function createFormRow(labelText) {
  const row = document.createElement("div");
  row.className = "settings-grid__row";

  const label = document.createElement("span");
  label.className = "settings-grid__label";
  label.textContent = labelText;

  const control = document.createElement("div");
  control.className = "settings-grid__control";

  row.append(label, control);

  return { row, control, label };
}

function createSelect(options, value, onChange) {
  const select = document.createElement("select");

  const currentValue = value || "none";

  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    if (option.value === currentValue) opt.selected = true;
    select.appendChild(opt);
  });

  if (![...select.options].some(o => o.selected)) {
    select.value = "none";
  }

  select.addEventListener("change", () => onChange(select.value));
  return select;
}

function createCounter({ count, infinite, infinityLabel, onUpdate }) {
  let finiteValue = count || 1;

  const wrapper = document.createElement("div");
  wrapper.className = "counter";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.className = "counter__btn";
  minus.textContent = "−";

  const input = document.createElement("input");
  input.type = "number";
  input.className = "counter__input";
  input.min = "1";
  input.value = String(count ?? finiteValue);
  input.disabled = infinite;
  if (infinite) {
    input.value = "";
    input.placeholder = infinityLabel;
  }

  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "counter__btn";
  plus.textContent = "+";

  const infinityWrap = document.createElement("label");
  infinityWrap.className = "counter__infinity";
  const infinityInput = document.createElement("input");
  infinityInput.type = "checkbox";
  infinityInput.checked = infinite;
  const infinityText = document.createElement("span");
  infinityText.textContent = infinityLabel;
  infinityWrap.append(infinityInput, infinityText);

  function emit(countValue, infiniteValue) {
    const nextCount = Math.max(1, Number.isNaN(Number(countValue)) ? 1 : Number(countValue));
    if (!infiniteValue) finiteValue = nextCount;
    onUpdate({ count: nextCount, infinite: infiniteValue });
  }

  minus.addEventListener("click", () => {
    if (infinityInput.checked) return;
    const next = Math.max(1, (parseInt(input.value, 10) || finiteValue) - 1);
    input.value = String(next);
    emit(next, false);
  });

  plus.addEventListener("click", () => {
    if (infinityInput.checked) return;
    const next = (parseInt(input.value, 10) || finiteValue) + 1;
    input.value = String(next);
    emit(next, false);
  });

  input.addEventListener("change", () => {
    const value = Math.max(1, parseInt(input.value, 10) || finiteValue);
    input.value = String(value);
    emit(value, false);
  });

  infinityInput.addEventListener("change", () => {
    const isInfinite = infinityInput.checked;
    input.disabled = isInfinite;
    if (isInfinite) {
      input.value = "";
      input.placeholder = infinityLabel;
    } else {
      input.value = String(finiteValue);
      input.placeholder = "";
    }
    emit(finiteValue, isInfinite);
  });

  wrapper.append(minus, input, plus, infinityWrap);
  return wrapper;
}

function createSection(title) {
  const section = document.createElement("section");
  section.className = "settings-section";

  const heading = document.createElement("h3");
  heading.className = "settings-section__title";
  heading.textContent = title;

  section.appendChild(heading);
  return section;
}

// === ОСНОВНОЙ РЕНДЕР ЭКРАНА НАСТРОЕК ===
export function renderSettings(container, { t, state, updateSettings, navigate }) {
  const { section, body, heading, paragraph } = createScreenShell({
    title: t("settings.title"),
    description: t("settings.description"),
    className: "settings-screen"
  });

  const indicator = createStepIndicator("settings", t);
  section.insertBefore(indicator, section.firstChild);

  heading.textContent = t("settings.title");
  paragraph.textContent = t("settings.description");

  // Берем дефолтные настройки из state (или ставим резервные)
  const settingsState = state.settings || {
    colorsCount: "4",
    gameMode: "classic",
    examples: { count: 10, infinite: false }
  };

  const form = document.createElement("form");
  form.className = "form settings-form";

  const baseGrid = document.createElement("div");
  baseGrid.className = "settings-grid";

  // 1. Выбор количества цветов
  const colorsRow = createFormRow(t("settings.colorsCountLabel"));
  colorsRow.control.appendChild(
    createSelect(t("settings.colorsCountOptions"), settingsState.colorsCount, (value) => {
      updateSettings({ colorsCount: value });
    })
  );
  baseGrid.appendChild(colorsRow.row);

  // 2. Выбор количества раундов (используем твой крутой счетчик с бесконечностью)
  const examplesRow = createFormRow(t("settings.examples.label"));
  examplesRow.control.appendChild(
    createCounter({
      count: settingsState.examples.count,
      infinite: settingsState.examples.infinite,
      infinityLabel: t("settings.examples.infinityLabel"),
      onUpdate: ({ count, infinite }) => {
        const current = state.settings.examples;
        updateSettings({ examples: { ...current, count, infinite } });
      }
    })
  );
  baseGrid.appendChild(examplesRow.row);

  form.appendChild(baseGrid);

  // 3. Секция "Режим Игры" (Классика / Хардкор)
  const modeSection = createSection(t("settings.gameModeLabel"));
  const modeList = document.createElement("div");
  modeList.className = "toggle-list";

  ['classic', 'hardcore'].forEach(mode => {
    const isSelected = (settingsState.gameMode || 'classic') === mode;
    
    // Создаем кастомный toggle-pill (как у тебя было для "Позиция неизвестного")
    const label = document.createElement("label");
    label.className = "toggle-pill" + (isSelected ? " is-active" : "");
    
    const input = document.createElement("input");
    input.type = "radio"; // Используем radio, так как выбрать можно только один режим
    input.name = "gameMode";
    input.value = mode;
    input.checked = isSelected;
    
    input.addEventListener("change", () => {
      if (input.checked) {
        updateSettings({ gameMode: mode });
        // Обновляем визуал: убираем активный класс у всех, добавляем текущему
        modeList.querySelectorAll('label').forEach(l => l.classList.remove('is-active'));
        label.classList.add('is-active');
      }
    });

    const text = document.createElement("span");
    // Ключи из словаря: t("settings.modeClassic") и t("settings.modeHardcore")
    text.textContent = t(`settings.mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);

    label.append(input, text);
    modeList.appendChild(label);
  });

  modeSection.appendChild(modeList);
  form.appendChild(modeSection);

  // Кнопка сохранения и перехода дальше
  const actions = document.createElement("div");
  actions.className = "form__actions";
  const submitButton = createButton({
    label: t("settings.submit"),
    onClick: () => form.requestSubmit()
  });
  actions.appendChild(submitButton);

  form.appendChild(actions);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    navigate("confirmation");
  });

  body.appendChild(form);
  container.appendChild(section);
}
