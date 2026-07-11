import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { EWText } from '@/components/ew/typography';
import { EW, EWRadius, EWSpacing } from '@/constants/echowave-theme';

export function RenameDialog({
  visible,
  initialValue,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  initialValue: string;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync field to prop when dialog opens
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const submit = () => {
    const clean = value.trim();
    if (clean) onSubmit(clean);
    else onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.card} onPress={() => {}}>
            <EWText variant="headlineMd" color={EW.onSurface} style={styles.title}>
              Rename recording
            </EWText>
            <TextInput
              value={value}
              onChangeText={setValue}
              autoFocus
              selectTextOnFocus
              placeholder="Recording name"
              placeholderTextColor={EW.outlineVariant}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={submit}
            />
            <View style={styles.row}>
              <Pressable
                onPress={onCancel}
                style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
                <EWText color={EW.onSurfaceVariant}>Cancel</EWText>
              </Pressable>
              <Pressable
                onPress={submit}
                style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}>
                <EWText color={EW.onPrimaryContainer}>Save</EWText>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: EWSpacing.gutter,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: EW.surfaceContainerHigh,
    borderRadius: EWRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
    padding: EWSpacing.stackLg,
    gap: EWSpacing.stackLg,
  },
  title: {
    fontSize: 20,
  },
  input: {
    color: EW.onSurface,
    fontSize: 16,
    backgroundColor: EW.surfaceContainerLow,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
    borderRadius: EWRadius.lg,
    paddingHorizontal: EWSpacing.stackMd,
    height: 52,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: EWSpacing.stackSm,
  },
  btn: {
    paddingHorizontal: EWSpacing.stackLg,
    paddingVertical: EWSpacing.stackMd,
    borderRadius: EWRadius.full,
  },
  btnPrimary: {
    backgroundColor: EW.primaryContainer,
  },
  pressed: {
    opacity: 0.75,
  },
});
