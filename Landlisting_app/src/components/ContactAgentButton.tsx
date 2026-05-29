import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ContactAgentButtonProps {
  label?: string;
  onPress?: () => void;
}

const ContactAgentButton: React.FC<ContactAgentButtonProps> = ({
  label = 'Contact Agent',
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0077B6',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0077B6',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ContactAgentButton;
