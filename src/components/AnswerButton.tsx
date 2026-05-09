import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface AnswerButtonProps {
  id: string;
  text: string;
  onPress: () => void;
  disabled: boolean;
  state: 'default' | 'correct' | 'wrong';
}

export function AnswerButton({ id, text, onPress, disabled, state }: AnswerButtonProps) {
  const borderColor = useThemeColor({}, 'border');
  const cardBg = useThemeColor({}, 'card');
  const bgColor = useThemeColor({}, 'background');
  const successColor = useThemeColor({}, 'success');
  const successBg = useThemeColor({}, 'successBg');
  const dangerColor = useThemeColor({}, 'danger');
  const dangerBg = useThemeColor({}, 'dangerBg');
  const tint = useThemeColor({}, 'tint');

  const getBorderColor = () => {
    if (state === 'correct') return successColor;
    if (state === 'wrong') return dangerColor;
    return borderColor;
  };

  const getBackgroundColor = () => {
    if (state === 'correct') return successBg;
    if (state === 'wrong') return dangerBg;
    return cardBg;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          borderColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View style={[styles.label, { backgroundColor: bgColor }]}>
        <ThemedText type="defaultSemiBold" style={{ color: tint, fontSize: 14 }}>
          {id.toUpperCase()}
        </ThemedText>
      </View>
      <ThemedText style={styles.text}>{text}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    paddingTop: 4,
    fontSize: 15,
    lineHeight: 22,
  },
});
