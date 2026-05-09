import * as SQLite from 'expo-sqlite';
import type { OverallStats, AreaStat, QuestionStat } from '@/types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('cisspquiz.db');
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS question_stats (
      question_id INTEGER PRIMARY KEY,
      test_number INTEGER NOT NULL,
      knowledge_area TEXT,
      wrong_count INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      last_answered_at TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      test_number INTEGER NOT NULL,
      is_correct INTEGER NOT NULL,
      answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function recordAnswer(
  questionId: number,
  testNumber: number,
  knowledgeArea: string,
  isCorrect: boolean,
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    'INSERT INTO answers (question_id, test_number, is_correct) VALUES (?, ?, ?)',
    questionId,
    testNumber,
    isCorrect ? 1 : 0,
  );

  if (isCorrect) {
    await database.runAsync(
      `INSERT INTO question_stats (question_id, test_number, knowledge_area, correct_count, last_answered_at)
       VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
       ON CONFLICT(question_id) DO UPDATE SET
         correct_count = correct_count + 1,
         last_answered_at = CURRENT_TIMESTAMP`,
      questionId,
      testNumber,
      knowledgeArea,
    );
  } else {
    await database.runAsync(
      `INSERT INTO question_stats (question_id, test_number, knowledge_area, wrong_count, last_answered_at)
       VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
       ON CONFLICT(question_id) DO UPDATE SET
         wrong_count = wrong_count + 1,
         last_answered_at = CURRENT_TIMESTAMP`,
      questionId,
      testNumber,
      knowledgeArea,
    );
  }
}

export async function getOverallStats(): Promise<OverallStats> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    total_answered: number;
    wrong_questions: number;
    total_correct: number;
    total_wrong: number;
  }>(`
    SELECT
      COUNT(*) as total_answered,
      SUM(CASE WHEN wrong_count > 0 THEN 1 ELSE 0 END) as wrong_questions,
      SUM(correct_count) as total_correct,
      SUM(wrong_count) as total_wrong
    FROM question_stats
  `);

  return {
    totalAnswered: row?.total_answered ?? 0,
    wrongQuestions: row?.wrong_questions ?? 0,
    totalCorrect: row?.total_correct ?? 0,
    totalWrong: row?.total_wrong ?? 0,
  };
}

export async function getAnsweredMap(): Promise<Map<number, number>> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    question_id: number;
    total_count: number;
  }>('SELECT question_id, (correct_count + wrong_count) as total_count FROM question_stats');

  const map = new Map<number, number>();
  for (const row of rows) {
    map.set(row.question_id, row.total_count);
  }
  return map;
}

export async function getWrongQuestionIds(): Promise<Map<number, number>> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    question_id: number;
    wrong_count: number;
  }>(
    'SELECT question_id, wrong_count FROM question_stats WHERE wrong_count > 0 ORDER BY wrong_count DESC',
  );

  const map = new Map<number, number>();
  for (const row of rows) {
    map.set(row.question_id, row.wrong_count);
  }
  return map;
}

export async function getAreaStats(): Promise<AreaStat[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    knowledge_area: string;
    correct: number;
    wrong: number;
  }>(`
    SELECT knowledge_area,
           SUM(correct_count) as correct,
           SUM(wrong_count) as wrong
    FROM question_stats
    WHERE knowledge_area != ''
    GROUP BY knowledge_area
    ORDER BY knowledge_area
  `);

  return rows.map(r => ({
    knowledgeArea: r.knowledge_area,
    correct: r.correct ?? 0,
    wrong: r.wrong ?? 0,
  }));
}

export async function getWorstQuestions(): Promise<QuestionStat[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    question_id: number;
    test_number: number;
    knowledge_area: string;
    wrong_count: number;
    correct_count: number;
    last_answered_at: string | null;
  }>(`
    SELECT question_id, test_number, knowledge_area, wrong_count, correct_count, last_answered_at
    FROM question_stats
    WHERE wrong_count > 0
    ORDER BY wrong_count DESC
    LIMIT 20
  `);

  return rows.map(r => ({
    questionId: r.question_id,
    testNumber: r.test_number,
    knowledgeArea: r.knowledge_area,
    wrongCount: r.wrong_count,
    correctCount: r.correct_count,
    lastAnsweredAt: r.last_answered_at,
  }));
}
