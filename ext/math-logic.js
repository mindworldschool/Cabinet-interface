/**
 * Math Houses - Logic module
 */

// Fisher-Yates shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Parses targetNumber (could be "mix") into a real number.
 * If "mix", returns a random number between 2 and 10.
 * @param {string|number} targetNumber
 * @returns {number}
 */
export function getActualTargetNumber(targetNumber) {
  if (targetNumber === "mix") {
    return Math.floor(Math.random() * 9) + 2; // 2 to 10
  }
  return parseInt(targetNumber, 10) || 5;
}

/**
 * Generates a house for a given target number.
 * Returns an array of floors, where each floor is an object:
 * {
 *   left: number | null,
 *   right: number | null,
 *   expectedLeft: number,
 *   expectedRight: number
 * }
 */
export function generateHouse(targetNumber) {
  const num = parseInt(targetNumber, 10);
  const pairs = [];

  // Create all pairs [0, N], [1, N-1] ... [N, 0]
  for (let i = 0; i <= num; i++) {
    pairs.push([i, num - i]);
  }

  // Shuffle floors
  const shuffledPairs = shuffleArray(pairs);

  const floors = shuffledPairs.map(([leftNum, rightNum]) => {
    // Randomly hide either left or right
    const hideLeft = Math.random() < 0.5;

    return {
      left: hideLeft ? null : leftNum,
      right: hideLeft ? rightNum : null,
      expectedLeft: leftNum,
      expectedRight: rightNum
    };
  });

  return floors;
}

/**
 * Generates addition and subtraction examples for a target number.
 */
export function generateExamples(targetNumber, count = 5) {
  const num = parseInt(targetNumber, 10);
  const examples = [];

  for (let i = 0; i < count; i++) {
    const isAddition = Math.random() < 0.5;

    if (isAddition) {
      // A + B = targetNumber
      const a = Math.floor(Math.random() * (num + 1));
      const b = num - a;
      // Randomly hide one part
      const hidePart = Math.floor(Math.random() * 3); // 0: A, 1: B, 2: Result

      examples.push({
        type: 'addition',
        a: hidePart === 0 ? null : a,
        b: hidePart === 1 ? null : b,
        result: hidePart === 2 ? null : num,
        expectedA: a,
        expectedB: b,
        expectedResult: num,
        operator: '+'
      });
    } else {
      // targetNumber - A = B
      const a = Math.floor(Math.random() * (num + 1));
      const b = num - a;
      const hidePart = Math.floor(Math.random() * 3); // 0: targetNumber, 1: A, 2: B

      examples.push({
        type: 'subtraction',
        a: hidePart === 0 ? null : num,
        b: hidePart === 1 ? null : a,
        result: hidePart === 2 ? null : b,
        expectedA: num,
        expectedB: a,
        expectedResult: b,
        operator: '-'
      });
    }
  }

  return examples;
}

/**
 * Generate a complete task based on settings
 */
export function generateTask(settings) {
  const num = getActualTargetNumber(settings.targetNumber);
  const mode = settings.gameMode || 'houses_only';

  let house = null;
  let examples = null;

  if (mode === 'houses_only' || mode === 'combined') {
    house = generateHouse(num);
  }

  if (mode === 'examples_only' || mode === 'combined') {
    // Determine how many examples to show.
    // If combined, match the number of floors or a fixed amount.
    const count = mode === 'combined' ? Math.max(4, house.length) : 6;
    examples = generateExamples(num, count);
  }

  return {
    targetNumber: num,
    house,
    examples
  };
}
