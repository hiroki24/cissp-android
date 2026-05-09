import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { StatsCard } from '@/components/StatsCard';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ correct: string; wrong: string; mode: string }>();
  const tint = useThemeColor({}, 'tint');
  const textLight = useThemeColor({}, 'textLight');
  const successColor = useThemeColor({}, 'success');
  const dangerBg = useThemeColor({}, 'dangerBg');
  const warningColor = useThemeColor({}, 'warning');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const correct = parseInt(params.correct || '0', 10);
  const wrong = parseInt(params.wrong || '0', 10);
  const total = correct + wrong;
  const mode = params.mode || 'normal';
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  const handleReview = () => {
    router.replace({
      pathname: '/quiz',
      params: { mode: 'review', testNum: 'all', count: String(wrong) },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>
          📊 結果
        </ThemedText>

        <View style={[styles.scoreBox, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.scoreRow}>
            <ThemedText style={[styles.scoreNumber, { color: tint }]}>{correct}</ThemedText>
            <ThemedText style={[styles.scoreDivider, { color: textLight }]}>/</ThemedText>
            <ThemedText style={[styles.scoreTotal, { color: textLight }]}>{total}</ThemedText>
          </View>
          <ThemedText style={[styles.scorePercent, { color: textLight }]}>
            正答率: {percent}%
          </ThemedText>
          {total > 0 && (
            <View style={[styles.barTrack, { backgroundColor: dangerBg }]}>
              <View
                style={[styles.barFill, { backgroundColor: successColor, width: `${percent}%` }]}
              />
            </View>
          )}
        </View>

        <StatsCard title="詳細">
          <ThemedText>✅ 正解: {correct} 問</ThemedText>
          <ThemedText>❌ 不正解: {wrong} 問</ThemedText>
          <ThemedText>モード: {mode === 'review' ? '🔄 復習' : '📝 通常'}</ThemedText>
        </StatsCard>

        <View style={styles.actions}>
          {wrong > 0 && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: warningColor }]}
              onPress={handleReview}>
              <ThemedText style={styles.buttonText}>🔄 間違えた問題を復習</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: tint }]}
            onPress={() => router.replace('/')}>
            <ThemedText style={styles.buttonText}>🏠 トップへ戻る</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  title: { textAlign: 'center', marginBottom: 24 },
  scoreBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline' },
  scoreNumber: { fontSize: 48, fontWeight: '700' },
  scoreDivider: { fontSize: 36, marginHorizontal: 4 },
  scoreTotal: { fontSize: 36 },
  scorePercent: { fontSize: 18, marginTop: 8 },
  barTrack: { height: 12, borderRadius: 6, marginTop: 16, width: '100%', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  actions: { gap: 12, marginTop: 8, marginBottom: 32 },
  button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
