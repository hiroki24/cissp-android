import { getAllQuestions, getTestNumbers, getTotalQuestionCount, getQuestionById, getQuestionPool } from '@/lib/questions';

describe('questions', () => {
  it('loads all 6 test files', () => {
    const testNumbers = getTestNumbers();
    expect(testNumbers).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('loads 600 total questions', () => {
    const total = getTotalQuestionCount();
    expect(total).toBe(600);
  });

  it('returns questions grouped by test number', () => {
    const questions = getAllQuestions();
    expect(questions.size).toBe(6);
    for (const [_, qs] of questions) {
      expect(qs.length).toBe(100);
    }
  });

  it('finds a question by ID', () => {
    const questions = getAllQuestions();
    const firstQuestion = questions.get(1)![0];
    const found = getQuestionById(firstQuestion.questionId);
    expect(found).toBeDefined();
    expect(found!.questionId).toBe(firstQuestion.questionId);
  });

  it('returns undefined for non-existent question ID', () => {
    const found = getQuestionById(-999);
    expect(found).toBeUndefined();
  });

  it('returns all questions when pool is "all"', () => {
    const pool = getQuestionPool('all');
    expect(pool.length).toBe(600);
  });

  it('returns test-specific questions', () => {
    const pool = getQuestionPool(1);
    expect(pool.length).toBe(100);
    pool.forEach(q => expect(q.test_number).toBe(1));
  });

  it('each question has required fields', () => {
    const pool = getQuestionPool('all');
    pool.forEach(q => {
      expect(q.questionId).toBeDefined();
      expect(q.question).toBeTruthy();
      expect(q.answers.length).toBeGreaterThanOrEqual(4);
      expect(q.correctAnswer).toBeTruthy();
      expect(q.knowledgeArea).toBeTruthy();
    });
  });

  it('each question has Japanese translations', () => {
    const pool = getQuestionPool('all');
    pool.forEach(q => {
      expect(q.question_ja).toBeTruthy();
      expect(q.answers_ja).toBeDefined();
      expect(q.answers_ja!.length).toBe(q.answers.length);
    });
  });
});
