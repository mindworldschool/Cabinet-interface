/**
 * Homework result saving to Firestore.
 * Used only when the trainer is opened in homework mode (?mode=homework&hwId=...).
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAgLxmCdJeyWLmg2_CZbTMGzqn3gPMmyCY",
  authDomain: "mindworld-lms.firebaseapp.com",
  projectId: "mindworld-lms",
  storageBucket: "mindworld-lms.firebasestorage.app",
  messagingSenderId: "121738586563",
  appId: "1:121738586563:web:20ca7ad72fef674db5b576"
};

let _db = null;

function getDb() {
  if (!_db) {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    _db = getFirestore(app);
  }
  return _db;
}

export function getHwId() {
  return new URLSearchParams(window.location.search).get('hwId') || null;
}

/**
 * Saves training results to Firestore homework document.
 * @param {{ success: number, total: number }} results
 * @param {boolean} isRetry - true if this is a retry session (fixes errors)
 */
export async function saveHomeworkResult(results, isRetry) {
  const hwId = getHwId();
  if (!hwId) return;

  const resultData = {
    success: results.success,
    total: results.total,
    percent: results.total > 0 ? Math.round((results.success / results.total) * 100) : 0,
    savedAt: new Date().toISOString()
  };

  // Перевіряємо чи вже є initialResult — якщо так, завжди пишемо в retryResult
  const hwRef = doc(getDb(), 'homework', hwId);
  let writeAsRetry = isRetry;
  if (!isRetry) {
    try {
      const snap = await getDoc(hwRef);
      if (snap.exists() && snap.data().initialResult) {
        writeAsRetry = true;
      }
    } catch (_) {
      // якщо не вдалося прочитати — продовжуємо як планувалось
    }
  }

  const update = { status: 'done' };
  if (writeAsRetry) {
    update.retryResult = resultData;
  } else {
    update.initialResult = resultData;
  }

  await updateDoc(hwRef, update);
}
