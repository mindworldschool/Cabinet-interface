/**
 * БАЗА ДАННЫХ ЦВЕТОВ
 * Используем ключи (id), чтобы потом переводить их через i18n
 */
export const STROOP_COLORS = [
  { id: 'color_red', hex: '#FF0000' },        // Червоний
  { id: 'color_blue', hex: '#0000FF' },       // Синій
  { id: 'color_green', hex: '#008000' },      // Зелений
  { id: 'color_yellow', hex: '#FFFF00' },     // Жовтий
  { id: 'color_purple', hex: '#8A2BE2' },     // Фіолетовий
  { id: 'color_orange', hex: '#FF8C00' },     // Помаранчевий
  { id: 'color_pink', hex: '#FF69B4' },       // Рожевий
  { id: 'color_cyan', hex: '#ADD8E6' },       // Блакитний
  { id: 'color_brown', hex: '#8B4513' },      // Коричневий
  { id: 'color_gray', hex: '#808080' },       // Сірий
  { id: 'color_black', hex: '#000000' },      // Чорний
  { id: 'color_lime', hex: '#00FF00' },       // Лайм
  { id: 'color_raspberry', hex: '#DC143C' },  // Малиновий
  { id: 'color_olive', hex: '#808000' },      // Оливковий
  { id: 'color_lilac', hex: '#D946EF' },      // Бузковий
  { id: 'color_white', hex: '#FFFFFF' }       // Білий
];

// Утилита для перемешивания массива (Алгоритм Фишера-Йейтса)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Утилита для получения случайного элемента массива
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * ГЕНЕРАТОР ВОПРОСА
 * @param {Object} settings - Настройки раунда
 * @param {number} settings.colorsCount - Количество цветов в игре (4, 8, 12, 16)
 * @param {boolean} settings.isHardcore - Включен ли режим "Двойная ловушка"
 * @returns {Object} Объект с данными для отрисовки UI
 */
export function generateStroopTask(settings) {
  const { colorsCount = 4, isHardcore = false } = settings;
  
  // 1. Берем нужное количество цветов для текущей сложности
  const activeColors = STROOP_COLORS.slice(0, colorsCount);
  
  // 2. Генерируем главный стимул (вопрос)
  const targetWord = getRandomItem(activeColors);
  let targetColor = getRandomItem(activeColors);
  
  // Цвет и слово вопроса не должны совпадать!
  while (targetColor.id === targetWord.id) {
    targetColor = getRandomItem(activeColors);
  }

  // 3. Генерируем 3 кнопки ответов
  let options = [];

  if (!isHardcore) {
    // === LEVEL 1: КЛАССИКА ===
    // Текст кнопок цветной, но мы ищем просто совпадение смысла. Цвет текста кнопок нейтральный (черный/серый).
    const neutralHex = '#333333';

    // Правильный ответ (Текст совпадает с цветом вопроса)
    options.push({ textId: targetColor.id, hex: neutralHex, isCorrect: true });
    
    // Ловушка 1 (Текст совпадает с текстом вопроса)
    options.push({ textId: targetWord.id, hex: neutralHex, isCorrect: false });
    
    // Ловушка 2 (Случайное слово)
    let randomTrap = getRandomItem(activeColors);
    while (randomTrap.id === targetWord.id || randomTrap.id === targetColor.id) {
      randomTrap = getRandomItem(activeColors);
    }
    options.push({ textId: randomTrap.id, hex: neutralHex, isCorrect: false });

  } else {
    // === LEVEL 2: ХАРДКОР (ДВОЙНАЯ ЛОВУШКА) ===
    // Здесь сами кнопки тоже покрашены в разные цвета, чтобы сбивать с толку.

    // 1. Правильный ответ: Текст = targetColor, Цвет = случайный (но не targetColor)
    let correctBtnColor = getRandomItem(activeColors);
    while (correctBtnColor.id === targetColor.id) correctBtnColor = getRandomItem(activeColors);
    options.push({ textId: targetColor.id, hex: correctBtnColor.hex, isCorrect: true });

    // 2. Текстовая ловушка: Текст = targetWord, Цвет = случайный
    let trap1BtnColor = getRandomItem(activeColors);
    options.push({ textId: targetWord.id, hex: trap1BtnColor.hex, isCorrect: false });

    // 3. Визуальная ловушка: Текст = случайный (не из уже использованных), Цвет = targetColor
    let trap2Word = getRandomItem(activeColors);
    while (trap2Word.id === targetColor.id || trap2Word.id === targetWord.id) {
      trap2Word = getRandomItem(activeColors);
    }
    options.push({ textId: trap2Word.id, hex: targetColor.hex, isCorrect: false });
  }

  // Возвращаем готовый объект для UI
  return {
    question: {
      textId: targetWord.id, // Что написано
      hex: targetColor.hex   // Каким цветом покрашено
    },
    options: shuffleArray(options) // Перемешиваем кнопки, чтобы правильная не всегда была первой
  };
}
