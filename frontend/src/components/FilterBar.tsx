import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FilterOptions } from '../types/listing';

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const categoryOptions = ['all', 'agricultural', 'commercial', 'residential', 'industrial'] as const;
const statusOptions = ['all', 'available', 'pending', 'sold'] as const;

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterOptions>({});

  const selectedCategory = filters.category ?? 'all';
  const selectedStatus = filters.status ?? 'all';

  const updateFilters = (nextFilters: FilterOptions) => {
    setFilters(nextFilters);
    onFilterChange(nextFilters);
  };

  const setCategory = (category: (typeof categoryOptions)[number]) => {
    const next = {
      ...filters,
      category: category === 'all' ? undefined : category,
    };
    updateFilters(next);
  };

  const setStatus = (status: (typeof statusOptions)[number]) => {
    const next = {
      ...filters,
      status: status === 'all' ? undefined : status,
    };
    updateFilters(next);
  };

  const setNumber = (key: 'minPrice' | 'maxPrice' | 'minArea' | 'maxArea', value: string) => {
    const parsed = value === '' ? undefined : Number(value);
    const next = {
      ...filters,
      [key]: Number.isNaN(parsed) ? undefined : parsed,
    };
    updateFilters(next);
  };

  const resetFilters = () => {
    const next = {};
    setFilters(next);
    onFilterChange(next);
  };

  const summary = useMemo(() => {
    const parts = [];
    if (filters.category) parts.push(filters.category);
    if (filters.status) parts.push(filters.status);
    if (filters.location) parts.push(filters.location);
    return parts.join(' • ') || 'Quick filters';
  }, [filters]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Filters</Text>
        <Pressable onPress={resetFilters}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <Text style={styles.summary}>{summary}</Text>

      <View style={styles.chipRow}>
        {categoryOptions.map((option) => {
          const isActive = selectedCategory === option;
          return (
            <Pressable
              key={option}
              style={[styles.chip, isActive && styles.activeChip]}
              onPress={() => setCategory(option)}
            >
              <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                {option === 'all' ? 'All categories' : option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chipRow}>
        {statusOptions.map((option) => {
          const isActive = selectedStatus === option;
          return (
            <Pressable
              key={option}
              style={[styles.chip, isActive && styles.activeChip]}
              onPress={() => setStatus(option)}
            >
              <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                {option === 'all' ? 'All status' : option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.inputsGrid}>
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={filters.location ?? ''}
          onChangeText={(value) => updateFilters({ ...filters, location: value })}
        />
        <TextInput
          style={styles.input}
          placeholder="Min price"
          keyboardType="numeric"
          value={filters.minPrice?.toString() ?? ''}
          onChangeText={(value) => setNumber('minPrice', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Max price"
          keyboardType="numeric"
          value={filters.maxPrice?.toString() ?? ''}
          onChangeText={(value) => setNumber('maxPrice', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Min area"
          keyboardType="numeric"
          value={filters.minArea?.toString() ?? ''}
          onChangeText={(value) => setNumber('minArea', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Max area"
          keyboardType="numeric"
          value={filters.maxArea?.toString() ?? ''}
          onChangeText={(value) => setNumber('maxArea', value)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  resetText: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  summary: {
    color: '#4B5563',
    fontSize: 13,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  activeChip: {
    backgroundColor: '#2E7D32',
  },
  chipText: {
    color: '#111827',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  inputsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  input: {
    flexBasis: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});

export default FilterBar;
