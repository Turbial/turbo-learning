// components/feedback/Toast.tsx — non-blocking toast + provider/hook.
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, fontSize } from '../../theme/tokens';

type Kind = 'success' | 'error' | 'info';
const ToastCtx = createContext<(msg: string, kind?: Kind) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [toast, setToast] = useState<{ msg: string; kind: Kind } | null>(null);
  const o = useRef(new Animated.Value(0)).current;
  const show = useCallback((msg: string, kind: Kind = 'info') => {
    setToast({ msg, kind });
    Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2400),
      Animated.timing(o, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [o]);
  const bg = toast?.kind === 'error' ? colors.error : toast?.kind === 'success' ? colors.success : colors.text;
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast ? (
        <Animated.View style={{ position: 'absolute', bottom: 40, left: spacing.xl, right: spacing.xl, opacity: o,
          backgroundColor: bg, borderRadius: radius.md, padding: spacing.md }}>
          <Text style={{ color: colors.background, fontSize: fontSize.body, textAlign: 'center' }}>{toast.msg}</Text>
        </Animated.View>
      ) : null}
    </ToastCtx.Provider>
  );
}
