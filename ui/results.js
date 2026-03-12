/**
 * Results screen - Stroop Effect
 */

import { createScreenShell, createButton, createStepIndicator } from './helper.js';

export function renderResults(container, { t, state, navigate }) {
  const { section, body } = createScreenShell({
    title: t('results.title'),
    description: t('results.description'),
    className: 'results-screen'
  });

  const indicator = createStepIndicator('results', t);
  section.insertBefore(indicator, section.firstChild);

  // Получаем результаты
  const results = state.results || { success: 0, total: 0, errorCount: 0, totalTimeMs: 0 };

  const errorCount = results.errorCount || 0;

  // Рассчитываем среднюю скорость ответа в секундах
  const avgSpeedMs = results.total > 0 ? (results.totalTimeMs / results.total) : 0;
  const avgSpeedSec = (avgSpeedMs / 1000).toFixed(2);

  const statsContainer = document.createElement('div');
  statsContainer.className = 'results-stats-container';
  statsContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 20px;';

  // Определяем картинку и текст фидбека в зависимости от количества ошибок
  let imageEmoji = '';
  let feedbackText = '';

  if (errorCount === 0) {
    imageEmoji = '☀️'; // Сияющее солнышко
    feedbackText = t('results.feedback0');
  } else if (errorCount <= 2) {
    imageEmoji = '🌤️'; // Солнышко с облачком
    feedbackText = t('results.feedback1_2');
  } else {
    imageEmoji = '🌧️'; // Тучка
    let template = t('results.feedbackMore');
    feedbackText = template ? template.replace('{errorCount}', errorCount) : `Нужно еще потренироваться. Ошибок: ${errorCount}`;
  }

  const emojiDiv = document.createElement('div');
  emojiDiv.style.cssText = 'font-size: 5rem; line-height: 1;';
  emojiDiv.textContent = imageEmoji;

  const feedbackDiv = document.createElement('div');
  feedbackDiv.style.cssText = 'font-size: 1.5rem; font-weight: 700; text-align: center; color: var(--color-text);';
  feedbackDiv.textContent = feedbackText;

  const speedDiv = document.createElement('div');
  speedDiv.style.cssText = 'font-size: 1.1rem; color: var(--color-muted);';
  speedDiv.textContent = `${t('results.speed')}: ${avgSpeedSec} сек/ответ`;

  statsContainer.append(emojiDiv, feedbackDiv, speedDiv);
  body.appendChild(statsContainer);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'form__actions results-actions';

  const repeatButton = createButton({
    label: t('results.cta') || 'Повторить',
    onClick: () => navigate('game'),
    variant: 'primary'
  });

  const settingsButton = createButton({
    label: t('results.retryErrors') || 'В настройки',
    onClick: () => navigate('settings'),
    variant: 'secondary'
  });

  actions.append(settingsButton, repeatButton);
  body.appendChild(actions);
  container.appendChild(section);
}
