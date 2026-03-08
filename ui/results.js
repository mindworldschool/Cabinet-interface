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

  // Получаем результаты, включая новое поле totalTimeMs
  const results = state.results || { success: 0, total: 0, wrongExamples: [], totalTimeMs: 0 };

  const successRate = results.total > 0
    ? Math.round((results.success / results.total) * 100)
    : 0;
  const errorsCount = results.total - results.success;
  const errorsRate = results.total > 0
    ? Math.round((errorsCount / results.total) * 100)
    : 0;

  // Рассчитываем среднюю скорость ответа в секундах
  const avgSpeedMs = results.total > 0 ? (results.totalTimeMs / results.total) : 0;
  const avgSpeedSec = (avgSpeedMs / 1000).toFixed(2);

  // Stats в стиле Mind Abacus
  const statsContainer = document.createElement('div');
  statsContainer.className = 'results-stats-container';

  // Верхняя статистика: Правильно | Ошибки | Скорость
  const statsTop = document.createElement('div');
  statsTop.className = 'results-stats-top';

  statsTop.innerHTML = `
    <div class="results-stat-item results-stat-item--success">
      <span class="results-stat-item__label">${t('results.success')}:</span>
      <span class="results-stat-item__value">${results.success} / ${results.total} (${successRate}%)</span>
    </div>
    <div class="results-stat-item results-stat-item--errors">
      <span class="results-stat-item__label">${t('results.mistakes')}:</span>
      <span class="results-stat-item__value">${errorsCount} / ${results.total} (${errorsRate}%)</span>
    </div>
    <div class="results-stat-item results-stat-item--speed" style="grid-column: 1 / -1; border-left: 4px solid #3b82f6;">
      <span class="results-stat-item__label">${t('results.speed') || 'Средняя скорость'}:</span>
      <span class="results-stat-item__value">${avgSpeedSec} сек/ответ</span>
    </div>
  `;

  // Прогресс-бар
  const progressBar = document.createElement('div');
  progressBar.className = 'results-progress';
  progressBar.innerHTML = `
    <div class="results-progress__bar">
      <div class="results-progress__fill results-progress__fill--success" style="width: ${successRate}%"></div>
    </div>
  `;

  statsContainer.append(statsTop, progressBar);
  body.appendChild(statsContainer);

  // Actions в стиле Mind Abacus
  const actions = document.createElement('div');
  actions.className = 'form__actions results-actions';

  // Retry button if there are errors (первая кнопка - коричневая)
  if (results.wrongExamples && results.wrongExamples.length > 0) {
    const retryButton = createButton({
      label: `${t('results.retryErrors')} (${results.wrongExamples.length})`,
      onClick: () => {
        state.retryMode = {
          enabled: true,
          examples: results.wrongExamples
        };
        navigate('game');
      },
      variant: 'secondary'
    });
    actions.appendChild(retryButton);
  }

  // New button (вторая кнопка - оранжевая)
  const newButton = createButton({
    label: t('results.cta'),
    onClick: () => navigate('settings'),
    variant: 'primary'
  });

  actions.appendChild(newButton);
  body.appendChild(actions);
  container.appendChild(section);
}
