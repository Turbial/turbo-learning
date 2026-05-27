// components/ui/Modal.tsx — reusable modal (confirm / alert / action sheet).
import React from 'react';
import { Modal as RNModal, View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, fontSize, fontWeight } from '../../theme/tokens';
import { Button } from './Button';

export function Modal({ visible, onClose, title, message, confirmLabel = 'OK', onConfirm, cancelLabel, children }:
  { visible: boolean; onClose: () => void; title?: string; message?: string;
    confirmLabel?: string; onConfirm?: () => void; cancelLabel?: string; children?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: spacing.xl }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md }}>
          {title ? <Text style={{ color: colors.text, fontSize: fontSize.subtitle, fontWeight: fontWeight.bold }}>{title}</Text> : null}
          {message ? <Text style={{ color: colors.textMuted, fontSize: fontSize.bodyLg, lineHeight: 22 }}>{message}</Text> : null}
          {children}
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
            {cancelLabel ? <View style={{ flex: 1 }}><Button title={cancelLabel} variant="secondary" onPress={onClose} /></View> : null}
            <View style={{ flex: 1 }}><Button title={confirmLabel} onPress={() => { onConfirm?.(); onClose(); }} /></View>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
