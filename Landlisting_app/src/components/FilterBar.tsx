import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type HomeFilterState = {
  propertyType: 'all' | 'agricultural' | 'residential' | 'commercial' | 'industrial' | 'farm-lot';
  priceRange: 'all' | 'under-300k' | '300k-600k' | '600k-plus';
};

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: HomeFilterState) => void;
}

const propertyOptions: HomeFilterState['propertyType'][] = [
  'all',
  'agricultural',
  'residential',
  'commercial',
  'industrial',
  'farm-lot',
];

const priceOptions: HomeFilterState['priceRange'][] = [
  'all',
  'under-300k',
  '300k-600k',
  '600k-plus',
];

const formatPropertyLabel = (value: HomeFilterState['propertyType']) => {
  if (value === 'all') return 'All types';
  if (value === 'farm-lot') return 'Farm Lot';
  return `${value[0].toUpperCase()}${value.slice(1)}`;
};

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const formatPriceLabel = (value: HomeFilterState['priceRange']) => {
  if (value === 'all') return 'Any price';
  if (value === 'under-300k') return `Under ${pesoFormatter.format(17_400_000)}`;
  if (value === '300k-600k') return `${pesoFormatter.format(17_400_000)} - ${pesoFormatter.format(34_800_000)}`;
  return `${pesoFormatter.format(34_800_000)}+`;
};

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  onFilterChange,
}) => {
  const [activeFilters, setActiveFilters] = useState<HomeFilterState>({
    propertyType: 'all',
    priceRange: 'all',
  });

  const summary = useMemo(() => {
    const parts = [formatPropertyLabel(activeFilters.propertyType)];
    parts.push(formatPriceLabel(activeFilters.priceRange));
    return parts.join(' • ');
  }, [activeFilters]);

  const updateFilter = (next: Partial<HomeFilterState>) => {
    const merged = { ...activeFilters, ...next };
    setActiveFilters(merged);
    onFilterChange(merged);
  };

  const resetFilters = () => {
    const defaults = { propertyType: 'all', priceRange: 'all' } as HomeFilterState;
    setActiveFilters(defaults);
    onFilterChange(defaults);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Find your next land listing</Text>
          <Text style={styles.subtitle}>Search by location or narrow with quick filters.</Text>
        </View>
        <Pressable onPress={resetFilters}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by city, county, or keywords"
        value={searchQuery}
        onChangeText={onSearchChange}
        returnKeyType="search"
        autoCapitalize="none"
      />

      <Text style={styles.summary}>{summary}</Text>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>Property type</Text>
        <View style={styles.chipRow}>
          {propertyOptions.map((option) => {
            const active = activeFilters.propertyType === option;
            return (
              <Pressable
                key={option}
                style={[styles.chip, active && styles.activeChip]}
                onPress={() => updateFilter({ propertyType: option })}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>
                  {formatPropertyLabel(option)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>Price range</Text>
        <View style={styles.chipRow}>
          {priceOptions.map((option) => {
            const active = activeFilters.priceRange === option;
            return (
              <Pressable
                key={option}
                style={[styles.chip, active && styles.activeChip]}
                onPress={() => updateFilter({ priceRange: option })}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>
                  {formatPriceLabel(option)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  resetText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    color: '#0F172A',
    fontSize: 15,
    marginBottom: 12,
  },
  summary: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
  },
  sectionRow: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  activeChip: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
});

export default FilterBar;
