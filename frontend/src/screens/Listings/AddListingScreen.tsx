/**
 * AddListingScreen.tsx  –  lupa.ph
 * Uses expo-router: useRouter()
 */

import { useListings } from '../../hooks/useListings';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, SafeAreaView, StatusBar, Alert,
  ActivityIndicator, Image, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { listingService, CreateListingPayload } from '../../services/listingService';

const PRIMARY       = '#27AE60';
const PRIMARY_LIGHT = '#E8F8EF';
const DANGER        = '#EF4444';
const TEXT_DARK     = '#111827';
const TEXT_MED      = '#6B7280';
const TEXT_LIGHT    = '#9CA3AF';
const BG            = '#FFFFFF';
const INPUT_BG      = '#F9FAFB';
const BORDER        = '#E5E7EB';
const DIVIDER       = '#F3F4F6';

const CATEGORIES = [
  { id: 1, label: 'Agricultural 🌾' }, { id: 2, label: 'Residential 🏡' },
  { id: 3, label: 'Commercial 🏢' },   { id: 4, label: 'Industrial 🏭' },
  { id: 5, label: 'Farm Lot 🥥' },
];
const LISTING_TYPES = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'lease', label: 'For Lease' },
];
const TITLE_STATUSES = [
  { value: 'TCT', label: 'TCT' }, { value: 'OCT', label: 'OCT' },
  { value: 'tax_dec', label: 'Tax Dec' }, { value: 'other', label: 'Other' },
];

interface FormState {
  title: string; description: string; price: string; area_sqm: string;
  barangay: string; municipality: string; province: string;
  latitude: string; longitude: string; category_id: number;
  listing_type: 'sale' | 'rent' | 'lease';
  title_status: 'TCT' | 'OCT' | 'tax_dec' | 'other';
  negotiable: boolean; image_urls: string[]; imageInput: string;
}

const INITIAL: FormState = {
  title: '', description: '', price: '', area_sqm: '', barangay: '',
  municipality: '', province: '', latitude: '', longitude: '',
  category_id: 1, listing_type: 'sale', title_status: 'TCT',
  negotiable: true, image_urls: [], imageInput: '',
};

export default function AddListingScreen() {
  const router = useRouter();
  const [form, setForm]     = useState<FormState>(INITIAL);
  const [submitting, setSub]= useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { createListing } = useListings()
  const set = (key: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim())        e.title       = 'Title is required';
    if (!form.description.trim())  e.description = 'Description is required';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Enter a valid price';
    if (!form.area_sqm || isNaN(Number(form.area_sqm))) e.area_sqm = 'Enter a valid area';
    if (!form.municipality.trim()) e.municipality = 'Municipality is required';
    if (!form.province.trim())     e.province    = 'Province is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addImage = () => {
    const url = form.imageInput.trim();
    if (!url) return;
    if (form.image_urls.includes(url)) { Alert.alert('Duplicate', 'Already added.'); return; }
    set('image_urls', [...form.image_urls, url]);
    set('imageInput', '');
  };

  const removeImage = (url: string) =>
    set('image_urls', form.image_urls.filter(u => u !== url));

  const handleSubmit = async () => {
    if (!validate()) return;
    setSub(true);
    try {
      const payload: CreateListingPayload = {
        category_id: form.category_id, title: form.title.trim(),
        description: form.description.trim(), price: Number(form.price),
        area_sqm: Number(form.area_sqm),
        latitude: Number(form.latitude) || 0, longitude: Number(form.longitude) || 0,
        barangay: form.barangay.trim() || undefined,
        municipality: form.municipality.trim(), province: form.province.trim(),
        title_status: form.title_status, listing_type: form.listing_type,
        negotiable: form.negotiable, image_urls: form.image_urls,
      };
      await createListing(payload);   
      Alert.alert('Success', 'Listing created!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to create listing.');
    } finally {
      setSub(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Text style={styles.headerBackIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Listing</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <SectionHeader title="Basic Information" />
          <Field label="Title" error={errors.title} required>
            <TextInput style={[styles.input, !!errors.title && styles.inputError]}
              placeholder="e.g. Prime Agricultural Lot in Kalibo"
              placeholderTextColor={TEXT_LIGHT} value={form.title}
              onChangeText={v => set('title', v)} />
          </Field>
          <Field label="Description" error={errors.description} required>
            <TextInput style={[styles.input, styles.textArea, !!errors.description && styles.inputError]}
              placeholder="Describe the land..." placeholderTextColor={TEXT_LIGHT}
              value={form.description} onChangeText={v => set('description', v)}
              multiline numberOfLines={4} textAlignVertical="top" />
          </Field>

          <SectionHeader title="Pricing" />
          <Field label="Price (₱)" error={errors.price} required>
            <TextInput style={[styles.input, !!errors.price && styles.inputError]}
              placeholder="e.g. 2500000" placeholderTextColor={TEXT_LIGHT}
              value={form.price} onChangeText={v => set('price', v.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric" />
          </Field>
          <Field label="Land Size (sqm)" error={errors.area_sqm} required>
            <TextInput style={[styles.input, !!errors.area_sqm && styles.inputError]}
              placeholder="e.g. 2500" placeholderTextColor={TEXT_LIGHT}
              value={form.area_sqm} onChangeText={v => set('area_sqm', v.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric" />
          </Field>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Negotiable</Text>
              <Text style={styles.fieldHint}>Allow buyers to make offers</Text>
            </View>
            <TouchableOpacity style={[styles.toggle, form.negotiable && styles.toggleOn]}
              onPress={() => set('negotiable', !form.negotiable)}>
              <View style={[styles.toggleThumb, form.negotiable && styles.toggleThumbOn]} />
            </TouchableOpacity>
          </View>

          <SectionHeader title="Location" />
          <Field label="Province" error={errors.province} required>
            <TextInput style={[styles.input, !!errors.province && styles.inputError]}
              placeholder="e.g. Aklan" placeholderTextColor={TEXT_LIGHT}
              value={form.province} onChangeText={v => set('province', v)} />
          </Field>
          <Field label="Municipality / City" error={errors.municipality} required>
            <TextInput style={[styles.input, !!errors.municipality && styles.inputError]}
              placeholder="e.g. Kalibo" placeholderTextColor={TEXT_LIGHT}
              value={form.municipality} onChangeText={v => set('municipality', v)} />
          </Field>
          <Field label="Barangay">
            <TextInput style={styles.input} placeholder="e.g. Poblacion"
              placeholderTextColor={TEXT_LIGHT} value={form.barangay}
              onChangeText={v => set('barangay', v)} />
          </Field>

          <SectionHeader title="Listing Details" />
          <Field label="Category">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c.id}
                    style={[styles.selChip, form.category_id === c.id && styles.selChipActive]}
                    onPress={() => set('category_id', c.id)}>
                    <Text style={[styles.selChipText, form.category_id === c.id && styles.selChipTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Field>
          <Field label="Listing Type">
            <View style={styles.chipRow}>
              {LISTING_TYPES.map(t => (
                <TouchableOpacity key={t.value}
                  style={[styles.selChip, form.listing_type === t.value && styles.selChipActive]}
                  onPress={() => set('listing_type', t.value as any)}>
                  <Text style={[styles.selChipText, form.listing_type === t.value && styles.selChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>
          <Field label="Title Status">
            <View style={styles.chipRow}>
              {TITLE_STATUSES.map(t => (
                <TouchableOpacity key={t.value}
                  style={[styles.selChip, form.title_status === t.value && styles.selChipActive]}
                  onPress={() => set('title_status', t.value as any)}>
                  <Text style={[styles.selChipText, form.title_status === t.value && styles.selChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <SectionHeader title="Images" />
          {form.image_urls.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20 }}>
                {form.image_urls.map((url, i) => (
                  <View key={i} style={styles.thumbWrapper}>
                    <Image source={{ uri: url }} style={styles.thumb} resizeMode="cover" />
                    {i === 0 && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                    <TouchableOpacity style={styles.removeImg} onPress={() => removeImage(url)}>
                      <Text style={styles.removeImgText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
          <View style={styles.imgInputRow}>
            <TextInput style={[styles.input, styles.imgInput]}
              placeholder="Paste image URL to add" placeholderTextColor={TEXT_LIGHT}
              value={form.imageInput} onChangeText={v => set('imageInput', v)}
              autoCapitalize="none" returnKeyType="done" onSubmitEditing={addImage} />
            <TouchableOpacity style={styles.addImgBtn} onPress={addImage}>
              <Text style={styles.addImgBtnText}>↑ Add</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit} disabled={submitting}>
          {submitting
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.submitBtnText}>Create Listing</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}
        {required && <Text style={{ color: DANGER }}> *</Text>}
      </Text>
      {children}
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingBottom: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: DIVIDER,
  },
  headerBack: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerBackIcon: { fontSize: 28, color: TEXT_DARK, lineHeight: 32 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  sectionHeader: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: TEXT_MED, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionLine: { flex: 1, height: 1, backgroundColor: DIVIDER },
  field: { paddingHorizontal: 20, marginBottom: 14 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: TEXT_DARK, marginBottom: 6 },
  fieldHint: { fontSize: 12, color: TEXT_LIGHT, marginTop: 4 },
  fieldError: { fontSize: 12, color: DANGER, marginTop: 4 },
  input: {
    backgroundColor: INPUT_BG, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: TEXT_DARK,
  },
  inputError: { borderColor: DANGER },
  textArea: { height: 100, paddingTop: 12 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: DIVIDER, marginBottom: 4,
  },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: '#D1D5DB', justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: PRIMARY },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', elevation: 2 },
  toggleThumbOn: { alignSelf: 'flex-end' },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  selChip: { borderWidth: 1.5, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: BG },
  selChipActive: { borderColor: PRIMARY, backgroundColor: PRIMARY_LIGHT },
  selChipText: { fontSize: 13, fontWeight: '500', color: TEXT_MED },
  selChipTextActive: { color: PRIMARY, fontWeight: '700' },
  thumbWrapper: { position: 'relative', borderRadius: 10, overflow: 'hidden' },
  thumb: { width: 100, height: 75, borderRadius: 10 },
  primaryBadge: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 3, alignItems: 'center',
  },
  primaryBadgeText: { fontSize: 10, color: '#FFF', fontWeight: '600' },
  removeImg: {
    position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  removeImgText: { fontSize: 10, color: '#FFF', fontWeight: '700' },
  imgInputRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 4 },
  imgInput: { flex: 1 },
  addImgBtn: {
    backgroundColor: INPUT_BG, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center',
  },
  addImgBtnText: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  footer: {
    paddingHorizontal: 20, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1, borderTopColor: DIVIDER, backgroundColor: BG,
  },
  submitBtn: {
    backgroundColor: PRIMARY, borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
