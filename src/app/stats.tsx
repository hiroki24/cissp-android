import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getAreaStats, getWorstQuestions } from '@/lib/database';
import type { AreaStat, QuestionStat } from '@/types';

export default function StatsScreen() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textLight = useThemeColor({}, 'textLight');
  const dangerColor = useThemeColor({}, 'danger');
  const bgColor = useThemeColor({}, 'background');

  const [areaStats, setAreaStats] = useState<AreaStat[]>([]);
  const [worstQuestions, setWorstQuestions] = useState<QuestionStat[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getAreaStats(), getWorstQuestions()]).then(([areas, worst]) => {
        setAreaStats(areas);
        setWorstQuestions(worst);
      });
    }, []),
  );

  const getAccuracy = (correct: number, wrong: number) => {
    const total = correct + wrong;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>
          📈 詳細統計
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          知識エリア別成績
        </ThemedText>
        {areaStats.length > 0 ? (
          <View style={[styles.table, { backgroundColor: cardBg, borderColor }]}>
            <View style={[styles.tableHeader, { backgroundColor: bgColor }]}>
              <ThemedText style={[styles.headerCell, styles.areaCell, { color: textLight }]}>
                知識エリア
              </ThemedText>
              <ThemedText style={[styles.headerCell, styles.numCell, { color: textLight }]}>
                正解
              </ThemedText>
              <ThemedText style={[styles.headerCell, styles.numCell, { color: textLight }]}>
                不正解
              </ThemedText>
              <ThemedText style={[styles.headerCell, styles.numCell, { color: textLight }]}>
                正答率
              </ThemedText>
            </View>
            {areaStats.map((row, i) => (
              <View key={i} style={[styles.tableRow, { borderTopColor: borderColor }]}>
                <ThemedText style={[styles.cell, styles.areaCell]} type="small">
                  {row.knowledgeArea}
                </ThemedText>
                <ThemedText style={[styles.cell, styles.numCell]} type="small">
                  {row.correct}
                </ThemedText>
                <ThemedText style={[styles.cell, styles.numCell]} type="small">
                  {row.wrong}
                </ThemedText>
                <ThemedText style={[styles.cell, styles.numCell]} type="small">
                  {getAccuracy(row.correct, row.wrong)}%
                </ThemedText>
              </View>
            ))}
          </View>
        ) : (
          <ThemedText style={{ marginBottom: 16 }}>まだデータがありません。</ThemedText>
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          間違いが多い問題 TOP20
        </ThemedText>
        {worstQuestions.length > 0 ? (
          <View style={[styles.table, { backgroundColor: cardBg, borderColor }]}>
            <View style={[styles.tableHeader, { backgroundColor: bgColor }]}>
              <ThemedText style={[styles.headerCell, styles.smallCell, { color: textLight }]}>
                Test
              </ThemedText>
              <ThemedText style={[styles.headerCell, styles.areaCell, { color: textLight }]}>
                知識エリア
              </ThemedText>
              <ThemedText style={[styles.headerCell, styles.smallCell, { color: textLight }]}>
                間違い
              </ThemedText>
              <ThemedText style={[styles.headerCell, styles.smallCell, { color: textLight }]}>
                正解
              </ThemedText>
            </View>
            {worstQuestions.map((row, i) => (
              <View key={i} style={[styles.tableRow, { borderTopColor: borderColor }]}>
                <ThemedText style={[styles.cell, styles.smallCell]} type="small">
                  {row.testNumber}
                </ThemedText>
                <ThemedText style={[styles.cell, styles.areaCell]} type="small">
                  {row.knowledgeArea}
                </ThemedText>
                <ThemedText
                  style={[styles.cell, styles.smallCell, { color: dangerColor, fontWeight: '700' }]}
                  type="small">
                  {row.wrongCount}
                </ThemedText>
                <ThemedText style={[styles.cell, styles.smallCell]} type="small">
                  {row.correctCount}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : (
          <ThemedText style={{ marginBottom: 16 }}>
            まだ間違えた問題はありません。素晴らしい！
          </ThemedText>
        )}

        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: tint }]}
          onPress={() => router.replace('/')}>
          <ThemedText style={styles.homeText}>🏠 トップへ戻る</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  title: { textAlign: 'center', marginBottom: 24 },
  sectionTitle: { marginBottom: 12, marginTop: 8 },
  table: { borderWidth: 1, borderRadius: 12, overflow: 'hidden', marginBottom: 24 },
  tableHeader: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12 },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1 },
  headerCell: { fontWeight: '600', fontSize: 11, textTransform: 'uppercase' },
  cell: {},
  areaCell: { flex: 1 },
  numCell: { width: 55, textAlign: 'center' },
  smallCell: { width: 50, textAlign: 'center' },
  homeButton: {
    marginTop: 8,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  homeText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
