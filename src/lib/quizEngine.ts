import type { Question, QuizSession } from '@/types';
import { getQuestionPool, getQuestionById } from '@/lib/questions';
import { getAnsweredMap, getWrongQuestionIds } from '@/lib/database';

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function selectQuestions(
  mode: 'normal' | 'review',
  testNum: 'all' | number,
  count: number,
): Promise<number[]> {
  if (mode === 'review') {
    return selectReviewQuestions(count);
  }
  return selectNormalQuestions(testNum, count);
}

async function selectReviewQuestions(count: number): Promise<number[]> {
  const wrongMap = await getWrongQuestionIds();
  if (wrongMap.size === 0) return [];

  const pool = getQuestionPool('all');
  const wrongQuestions = pool.filter(q => wrongMap.has(q.questionId));

  // Sort by wrong count descending
  wrongQuestions.sort((a, b) => {
    const aCount = wrongMap.get(a.questionId) ?? 0;
    const bCount = wrongMap.get(b.questionId) ?? 0;
    return bCount - aCount;
  });

  return wrongQuestions.slice(0, count).map(q => q.questionId);
}

async function selectNormalQuestions(testNum: 'all' | number, count: number): Promise<number[]> {
  const pool = getQuestionPool(testNum);
  const answeredMap = await getAnsweredMap();

  // Sort: unanswered first, then by least attempted
  const sorted = [...pool].sort(
    (a, b) => (answeredMap.get(a.questionId) ?? 0) - (answeredMap.get(b.questionId) ?? 0),
  );

  const unanswered = sorted.filter(q => !answeredMap.has(q.questionId));

  if (unanswered.length >= count) {
    const sampled = shuffleArray(unanswered).slice(0, count);
    return sampled.map(q => q.questionId);
  }

  // Fill with least-attempted answered questions
  const selected: Question[] = [...unanswered];
  const remaining = sorted.filter(q => answeredMap.has(q.questionId));
  const needed = count - selected.length;
  selected.push(...remaining.slice(0, needed));

  return shuffleArray(selected).map(q => q.questionId);
}

export function createSession(questionIds: number[], mode: 'normal' | 'review'): QuizSession {
  return {
    questionIds,
    currentIndex: 0,
    correctCount: 0,
    wrongCount: 0,
    mode,
    results: [],
  };
}

export function getCurrentQuestion(session: QuizSession): Question | undefined {
  if (session.currentIndex >= session.questionIds.length) return undefined;
  const qid = session.questionIds[session.currentIndex];
  return getQuestionById(qid);
}

export function recordSessionAnswer(
  session: QuizSession,
  questionId: number,
  isCorrect: boolean,
): QuizSession {
  return {
    ...session,
    correctCount: session.correctCount + (isCorrect ? 1 : 0),
    wrongCount: session.wrongCount + (isCorrect ? 0 : 1),
    results: [...session.results, { questionId, isCorrect }],
  };
}

export function advanceSession(session: QuizSession): QuizSession {
  return {
    ...session,
    currentIndex: session.currentIndex + 1,
  };
}

export function isSessionComplete(session: QuizSession): boolean {
  return session.currentIndex >= session.questionIds.length;
}
