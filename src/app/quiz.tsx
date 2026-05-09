import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { AnswerButton } from '@/components/AnswerButton';
import { ProgressBar } from '@/components/ProgressBar';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useThemeColor } from '@/hooks/useThemeColor';
import { recordAnswer } from '@/lib/database';
import {
  selectQuestions,
  createSession,
  getCurrentQuestion,
  recordSessionAnswer,
  advanceSession,
} from '@/lib/quizEngine';
import type { QuizSession, Answer } from '@/types';

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode: string; testNum: string; count: string }>();
  const tint = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const successColor = useThemeColor({}, 'success');
  const dangerColor = useThemeColor({}, 'danger');
  const warningColor = useThemeColor({}, 'warning');
  const textLight = useThemeColor({}, 'textLight');

  const [session, setSession] = useState<QuizSession | null>(null);
  const [language, setLanguage] = useState<'ja' | 'en'>('ja');
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<{ ja: string; en: string }>({ ja: '', en: '' });
  const [correctText, setCorrectText] = useState<{ ja: string; en: string }>({ ja: '', en: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const quizMode = (params.mode as 'normal' | 'review') || 'normal';
      const testNum = params.testNum === 'all' ? 'all' : parseInt(params.testNum || '0', 10);
      const count = parseInt(params.count || '20', 10);

      const questionIds = await selectQuestions(quizMode, testNum, count);
      if (questionIds.length === 0) {
        router.replace('/');
        return;
      }
      setSession(createSession(questionIds, quizMode));
      setLoading(false);
    };
    init();
  }, []);

  if (loading || !session) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={tint} />
        <ThemedText style={{ marginTop: 12 }}>問題を選択中...</ThemedText>
      </SafeAreaView>
    );
  }

  const question = getCurrentQuestion(session);
  if (!question) {
    router.replace({
      pathname: '/result',
      params: {
        correct: String(session.correctCount),
        wrong: String(session.wrongCount),
        mode: session.mode,
      },
    });
    return null;
  }

  const questionText =
    language === 'ja' ? question.question_ja || question.question : question.question;

  const answers: Answer[] =
    language === 'ja' ? question.answers_ja || question.answers : question.answers;

  const getAnswerState = (id: string): 'default' | 'correct' | 'wrong' => {
    if (!answered) return 'default';
    if (id === correctAnswer) return 'correct';
    if (id === selectedAnswer && id !== correctAnswer) return 'wrong';
    return 'default';
  };

  const handleAnswer = async (answerId: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(answerId);

    const isCorrect = answerId === question.correctAnswer;
    setCorrectAnswer(question.correctAnswer);

    // Find correct answer text in both languages
    const answersJa = question.answers_ja || question.answers;
    const answersEn = question.answers;
    const correctJa = answersJa.find(a => a.isCorrect)?.text ?? '';
    const correctEn = answersEn.find(a => a.isCorrect)?.text ?? '';
    setCorrectText({ ja: correctJa, en: correctEn });

    setExplanation({
      ja: question.explanation_ja || question.explanation,
      en: question.explanation,
    });

    await recordAnswer(
      question.questionId,
      question.test_number,
      question.knowledgeArea,
      isCorrect,
    );
    setSession(prev => (prev ? recordSessionAnswer(prev, question.questionId, isCorrect) : prev));
  };

  const handleNext = () => {
    setAnswered(false);
    setSelectedAnswer(null);
    setCorrectAnswer(null);
    setSession(prev => {
      if (!prev) return prev;
      const next = advanceSession(prev);
      if (next.currentIndex >= next.questionIds.length) {
        router.replace({
          pathname: '/result',
          params: {
            correct: String(next.correctCount),
            wrong: String(next.wrongCount),
            mode: next.mode,
          },
        });
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ProgressBar current={session.currentIndex + 1} total={session.questionIds.length} />

        <View style={styles.header}>
          <View
            style={[
              styles.badge,
              { backgroundColor: session.mode === 'review' ? warningColor : tint },
            ]}>
            <ThemedText style={styles.badgeText}>
              {session.mode === 'review' ? '🔄 復習モード' : '📝 通常モード'}
            </ThemedText>
          </View>
          <ThemedText style={{ color: textLight, fontWeight: '600' }}>
            {session.currentIndex + 1} / {session.questionIds.length}
          </ThemedText>
        </View>

        <LanguageToggle language={language} onToggle={setLanguage} />

        <View style={styles.questionArea}>
          <ThemedText style={{ color: textLight, fontSize: 13 }}>
            {question.knowledgeArea}
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.questionText}>
            {questionText}
          </ThemedText>
        </View>

        <View style={styles.answers}>
          {answers.map(ans => (
            <AnswerButton
              key={ans.id}
              id={ans.id}
              text={ans.text}
              onPress={() => handleAnswer(ans.id)}
              disabled={answered}
              state={getAnswerState(ans.id)}
            />
          ))}
        </View>

        {answered && (
          <View style={[styles.feedback, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText
              type="subtitle"
              style={{
                color: selectedAnswer === correctAnswer ? successColor : dangerColor,
                marginBottom: 12,
              }}>
              {selectedAnswer === correctAnswer ? '✅ 正解！' : '❌ 不正解'}
            </ThemedText>
            <ThemedText type="defaultSemiBold">
              正解: {correctAnswer?.toUpperCase()}.{' '}
              {language === 'ja' ? correctText.ja : correctText.en}
            </ThemedText>
            <ThemedText style={{ color: textLight, marginTop: 8, fontSize: 15, lineHeight: 24 }}>
              {language === 'ja' ? explanation.ja : explanation.en}
            </ThemedText>
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: tint }]}
              onPress={handleNext}>
              <ThemedText style={styles.nextText}>次の問題 →</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  questionArea: { marginBottom: 24 },
  questionText: { fontSize: 17, lineHeight: 28, marginTop: 8 },
  answers: { marginBottom: 8 },
  feedback: { borderWidth: 1, borderRadius: 12, padding: 20, marginTop: 8 },
  nextButton: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
