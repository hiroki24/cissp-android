import type { Question, QuizFile } from '@/types';

import test1 from '@/data/cissp_practice_test_1_100questions.json';
import test2 from '@/data/cissp_practice_test_2_100questions.json';
import test3 from '@/data/cissp_practice_test_3_100questions.json';
import test4 from '@/data/cissp_practice_test_4_100questions.json';
import test5 from '@/data/cissp_practice_test_5_100questions.json';
import test6 from '@/data/cissp_practice_test_6_100questions.json';

const testFiles: Record<number, QuizFile> = {
  1: test1 as QuizFile,
  2: test2 as QuizFile,
  3: test3 as QuizFile,
  4: test4 as QuizFile,
  5: test5 as QuizFile,
  6: test6 as QuizFile,
};

let allQuestionsCache: Map<number, Question[]> | null = null;

export function getAllQuestions(): Map<number, Question[]> {
  if (allQuestionsCache) return allQuestionsCache;

  allQuestionsCache = new Map();
  for (const [testNum, file] of Object.entries(testFiles)) {
    const num = parseInt(testNum, 10);
    const questions: Question[] = file.questions.map(q => ({
      ...q,
      test_number: num,
    }));
    allQuestionsCache.set(num, questions);
  }
  return allQuestionsCache;
}

export function getTestNumbers(): number[] {
  return Object.keys(testFiles)
    .map(Number)
    .sort((a, b) => a - b);
}

export function getTotalQuestionCount(): number {
  const questions = getAllQuestions();
  let total = 0;
  for (const qs of questions.values()) {
    total += qs.length;
  }
  return total;
}

export function getQuestionById(questionId: number): Question | undefined {
  const questions = getAllQuestions();
  for (const qs of questions.values()) {
    const found = qs.find(q => q.questionId === questionId);
    if (found) return found;
  }
  return undefined;
}

export function getQuestionPool(testNum: 'all' | number): Question[] {
  const questions = getAllQuestions();
  if (testNum === 'all') {
    const pool: Question[] = [];
    for (const qs of questions.values()) {
      pool.push(...qs);
    }
    return pool;
  }
  return questions.get(testNum) ?? [];
}
