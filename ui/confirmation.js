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

  // 1. Целевое число (targetNumber)
  const targetNumberOptions = t('settings.targetNumberOptions');
  const targetOption = Array.isArray(targetNumberOptions)
    ? targetNumberOptions.find(opt => opt.value === String(settings.targetNumber))
    : null;
  const targetText = targetOption ? targetOption.label : (settings.targetNumber || "5");
  addConfigItem(config, t('confirmation.list.targetNumber'), targetText);

  // 2. Режим игры (gameMode)
  const modeKeyMap = {
    'houses_only': 'modeHouses_only',
    'examples_only': 'modeExamples_only',
    'combined': 'modeCombined'
  };
  const modeKey = modeKeyMap[settings.gameMode] || 'modeHouses_only';
  const modeText = t(`settings.${modeKey}`);
  addConfigItem(config, t('confirmation.list.mode'), modeText);

  // 3. Количество заданий (taskCount)
  const taskCountText = settings.taskCount?.infinite
    ? t('settings.taskCount.infinityLabel') || '∞'
    : String(settings.taskCount?.count || 3);
  addConfigItem(config, t('confirmation.list.taskCount'), taskCountText);

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
