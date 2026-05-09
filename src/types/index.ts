export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface Question {
  questionNumber: number;
  questionId: number;
  assessmentType: string;
  knowledgeArea: string;
  question: string;
  question_ja?: string;
  answers: Answer[];
  answers_ja?: Answer[];
  correctAnswer: string;
  correctAnswerText: string;
  explanation: string;
  explanation_ja?: string;
  links: string[];
  relatedLecture: string | null;
  test_number: number;
}

export interface QuizFile {
  course: string;
  totalQuestions: number;
  questions: Omit<Question, 'test_number'>[];
}

export interface QuizSession {
  questionIds: number[];
  currentIndex: number;
  correctCount: number;
  wrongCount: number;
  mode: 'normal' | 'review';
  results: { questionId: number; isCorrect: boolean }[];
}

export interface QuestionStat {
  questionId: number;
  testNumber: number;
  knowledgeArea: string;
  wrongCount: number;
  correctCount: number;
  lastAnsweredAt: string | null;
}

export interface AreaStat {
  knowledgeArea: string;
  correct: number;
  wrong: number;
}

export interface OverallStats {
  totalAnswered: number;
  wrongQuestions: number;
  totalCorrect: number;
  totalWrong: number;
}
