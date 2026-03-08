/**
 * Confirmation screen - Stroop Effect
 */

import { createScreenShell, createButton, createStepIndicator } from './helper.js';

export function renderConfirmation(container, { t, state, navigate }) {
  const { section, body, heading, paragraph } = createScreenShell({
    title: t('confirmation.title'),
    description: t('confirmation.description'),
    className: 'confirmation-screen'
  });

  const indicator = createStepIndicator('confirmation', t);
  section.insertBefore(indicator, section.firstChild);

  // Configuration list
  const config = document.createElement('div');
  config.className = 'confirmation-list';

  const settings = state.settings || {};

  // 1. Количество цветов (colorsCount)
  const colorsOptions = t('settings.colorsCountOptions');
  const colorOption = Array.isArray(colorsOptions)
    ? colorsOptions.find(opt => opt.value === settings.colorsCount)
    : null;
  const colorsText = colorOption ? colorOption.label : (settings.colorsCount || "4");
  addConfigItem(config, t('confirmation.list.colorsCount'), colorsText);

  // 2. Количество раундов (examples)
  const examplesText = settings.examples?.infinite
    ? t('confirmation.counter.infinity')
    : String(settings.examples?.count || 10);
  addConfigItem(config, t('confirmation.list.examples'), examplesText);

  // 3. Режим игры (Classic / Hardcore)
  // Формируем ключ для словаря (modeClassic или modeHardcore)
  const modeKey = settings.gameMode === 'hardcore' ? 'modeHardcore' : 'modeClassic';
  const modeText = t(`settings.${modeKey}`);
  addConfigItem(config, t('confirmation.list.mode'), modeText);

  body.appendChild(config);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'form__actions';

  const backButton = createButton({
    label: t('buttons.back'),
    onClick: () => navigate('settings'),
    variant: 'secondary'
  });

  const startButton = createButton({
    label: t('buttons.start'),
    onClick: () => navigate('game'),
    variant: 'primary'
  });

  actions.append(backButton, startButton);
  body.appendChild(actions);

  container.appendChild(section);
}

function addConfigItem(container, label, value) {
  // Создаем одну строку с label и value
  const row = document.createElement('div');
  row.className = 'confirmation-list__item';

  const labelSpan = document.createElement('span');
  labelSpan.className = 'confirmation-list__label';
  labelSpan.textContent = label;

  const valueSpan = document.createElement('span');
  valueSpan.className = 'confirmation-list__value';
  valueSpan.textContent = value;

  row.append(labelSpan, valueSpan);
  container.appendChild(row);
}
