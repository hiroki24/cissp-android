import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const borderColor = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={[styles.track, { backgroundColor: borderColor }]}>
      <View style={[styles.fill, { backgroundColor: tint, width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
