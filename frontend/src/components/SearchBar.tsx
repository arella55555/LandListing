import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search listings or locations',
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search-outline" size={18} color="#6B7280" />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleSearch}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={clearSearch} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#6B7280" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
});

export default SearchBar;
