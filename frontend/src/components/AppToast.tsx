import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastKind = 'success' | 'error' | 'info';

type ToastEvent = {
  message: string;
  kind?: ToastKind;
  duration?: number;
};

type ToastState = {
  visible: boolean;
  message: string;
  kind: ToastKind;
};

const listeners = new Set<(event: ToastEvent) => void>();

export function showToast(message: string, kind: ToastKind = 'success', duration = 2200) {
  listeners.forEach(listener => listener({ message, kind, duration }));
}

export function ToastHost() {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', kind: 'success' });
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleToast = ({ message, kind = 'success', duration = 2200 }: ToastEvent) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setToast({ visible: true, message, kind });
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();

      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -10, duration: 160, useNativeDriver: true }),
        ]).start(() => setToast(prev => ({ ...prev, visible: false })));
      }, duration);
    };

    listeners.add(handleToast);
    return () => {
      listeners.delete(handleToast);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [opacity, translateY]);

  if (!toast.visible) return null;

  const theme =
    toast.kind === 'error'
      ? { bg: '#FEE2E2', fg: '#991B1B', icon: 'alert-circle' as const }
      : toast.kind === 'info'
        ? { bg: '#DBEAFE', fg: '#1D4ED8', icon: 'information-circle' as const }
        : { bg: '#DCFCE7', fg: '#166534', icon: 'checkmark-circle' as const };

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -10, duration: 120, useNativeDriver: true }),
    ]).start(() => setToast(prev => ({ ...prev, visible: false })));
  };

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View style={[styles.toast, { backgroundColor: theme.bg, opacity, transform: [{ translateY }] }]}>
        <Ionicons name={theme.icon} size={18} color={theme.fg} />
        <Text style={[styles.message, { color: theme.fg }]} numberOfLines={2}>
          {toast.message}
        </Text>
        <Pressable onPress={dismiss} hitSlop={8}>
          <Ionicons name="close" size={16} color={theme.fg} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 999,
    elevation: 999,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
});