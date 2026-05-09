import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface LanguageToggleProps {
  language: 'ja' | 'en';
  onToggle: (lang: 'ja' | 'en') => void;
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  const borderColor = useThemeColor({}, 'border');
  const cardBg = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            borderColor: language === 'ja' ? tint : borderColor,
            backgroundColor: language === 'ja' ? tint + '15' : cardBg,
          },
        ]}
        onPress={() => onToggle('ja')}>
        <ThemedText
          style={[styles.text, { color: language === 'ja' ? tint : undefined }]}
          type="small">
          🇯🇵 日本語
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          {
            borderColor: language === 'en' ? tint : borderColor,
            backgroundColor: language === 'en' ? tint + '15' : cardBg,
          },
        ]}
        onPress={() => onToggle('en')}>
        <ThemedText
          style={[styles.text, { color: language === 'en' ? tint : undefined }]}
          type="small">
          🇺🇸 English
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 2,
    borderRadius: 20,
  },
  text: {
    fontWeight: '500',
  },
});
