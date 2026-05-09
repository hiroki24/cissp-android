import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { StatsCard } from '@/components/StatsCard';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getOverallStats } from '@/lib/database';
import { getTotalQuestionCount, getTestNumbers } from '@/lib/questions';
import type { OverallStats } from '@/types';

const COUNT_OPTIONS = [10, 20, 50, 100];

export default function HomeScreen() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'danger');
  const warningColor = useThemeColor({}, 'warning');

  const [stats, setStats] = useState<OverallStats>({
    totalAnswered: 0,
    wrongQuestions: 0,
    totalCorrect: 0,
    totalWrong: 0,
  });
  const [mode, setMode] = useState<'normal' | 'review'>('normal');
  const [testNum, setTestNum] = useState<'all' | number>('all');
  const [count, setCount] = useState(20);

  const totalQuestions = getTotalQuestionCount();
  const testNumbers = getTestNumbers();

  useFocusEffect(
    useCallback(() => {
      getOverallStats()
        .then(setStats)
        .catch(err => console.error('Failed to load stats:', err));
    }, []),
  );

  const handleStart = () => {
    router.push({
      pathname: '/quiz',
      params: { mode, testNum: String(testNum), count: String(count) },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>
          🔒 CISSP 練習問題
        </ThemedText>

        <StatsCard title="📊 学習状況">
          <ThemedText>全問題数: {totalQuestions}</ThemedText>
          {stats.totalAnswered > 0 ? (
            <>
              <ThemedText>回答済み: {stats.totalAnswered} 問</ThemedText>
              <ThemedText>
                正解: {stats.totalCorrect} / 不正解: {stats.totalWrong}
              </ThemedText>
              <ThemedText>
                要復習:{' '}
                <ThemedText style={{ color: dangerColor }}>{stats.wrongQuestions}</ThemedText> 問
              </ThemedText>
            </>
          ) : (
            <ThemedText>まだ回答履歴がありません。さっそく始めましょう！</ThemedText>
          )}
        </StatsCard>

        <View style={[styles.form, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            📝 モード選択
          </ThemedText>
          <View style={styles.radioGroup}>
            <TouchableOpacity style={styles.radioRow} onPress={() => setMode('normal')}>
              <View
                style={[styles.radio, { borderColor: tint }, mode === 'normal' && styles.radioOn]}
              />
              <ThemedText>通常モード</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.radioRow} onPress={() => setMode('review')}>
              <View
                style={[
                  styles.radio,
                  { borderColor: warningColor },
                  mode === 'review' && { ...styles.radioOn, backgroundColor: warningColor },
                ]}
              />
              <ThemedText>🔄 復習モード（間違えた問題のみ）</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText type="defaultSemiBold" style={styles.label}>
            📚 テスト選択
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <TouchableOpacity
              style={[
                styles.chip,
                { borderColor },
                testNum === 'all' && { backgroundColor: tint, borderColor: tint },
              ]}
              onPress={() => setTestNum('all')}>
              <ThemedText
                style={[styles.chipText, testNum === 'all' && { color: '#fff' }]}
                type="small">
                全テスト
              </ThemedText>
            </TouchableOpacity>
            {testNumbers.map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.chip,
                  { borderColor },
                  testNum === num && { backgroundColor: tint, borderColor: tint },
                ]}
                onPress={() => setTestNum(num)}>
                <ThemedText
                  style={[styles.chipText, testNum === num && { color: '#fff' }]}
                  type="small">
                  Test {num}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ThemedText type="defaultSemiBold" style={styles.label}>
            🔢 問題数
          </ThemedText>
          <View style={styles.chipRow}>
            {COUNT_OPTIONS.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.chip,
                  { borderColor },
                  count === c && { backgroundColor: tint, borderColor: tint },
                ]}
                onPress={() => setCount(c)}>
                <ThemedText
                  style={[styles.chipText, count === c && { color: '#fff' }]}
                  type="small">
                  {c}問
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: tint }]}
            onPress={handleStart}>
            <ThemedText style={styles.startText}>スタート 🚀</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.statsLink} onPress={() => router.push('/stats')}>
          <ThemedText style={{ color: tint }}>📈 詳細統計を見る</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  title: { textAlign: 'center', marginBottom: 24 },
  form: { borderWidth: 1, borderRadius: 12, padding: 24, marginBottom: 16 },
  label: { marginBottom: 8, marginTop: 16 },
  radioGroup: { gap: 12 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  radioOn: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipScroll: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: { fontWeight: '500' },
  startButton: { marginTop: 24, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  startText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  statsLink: { alignItems: 'center', marginTop: 8, marginBottom: 32 },
});
