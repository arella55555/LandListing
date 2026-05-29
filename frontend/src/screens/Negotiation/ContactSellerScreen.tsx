import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listingService, Listing } from '../../services/listingService';
import { authAPI } from '../../services/api';
import { Linking } from 'react-native';
import { negotiationService, ChatMessage, Negotiation } from '../../services/negotiationService';
import { showToast } from '../../components/AppToast';

const PRIMARY = '#27AE60';
const PRIMARY_LIGHT = '#E8F8EF';
const TEXT_DARK = '#111827';
const TEXT_MED = '#6B7280';
const BG = '#FFFFFF';
const DIVIDER = '#F3F4F6';

export default function ContactSellerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ listingId?: string }>();
  const listingId = params.listingId as string | undefined;

  const [listing, setListing] = useState<Listing | null>(null);
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sellerContact, setSellerContact] = useState<any>(null);
  const [draft, setDraft] = useState('');

  const amBuyer = useMemo(() => {
    if (!listing || !currentUserId) return false;
    return listing.seller_id !== currentUserId;
  }, [listing, currentUserId]);

  useEffect(() => {
    const init = async () => {
      if (!listingId) {
        Alert.alert('Error', 'Missing listing id.');
        router.back();
        return;
      }

      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setCurrentUserId(storedUserId);

        const [listingData, negotiations] = await Promise.all([
          listingService.getById(listingId),
          negotiationService.getMyNegotiations(),
        ]);

        // attempt to fetch seller contact info for fallback
        (async () => {
          try {
            const u = await authAPI.getUser(listingData.seller_id);
            const seller = u.data?.user ?? u.data ?? null;
            setSellerContact(seller);
          } catch (e) {
            // ignore
          }
        })();

        setListing(listingData);

        let existing = negotiations.find(item => item.listing_id === listingId) ?? null;

        if (!existing) {
          try {
            existing = await negotiationService.createNegotiation(listingId, listingData.price);
          } catch (e) {
            // If negotiation creation fails, offer external contact fallback instead of closing immediately
            const message = e?.response?.data?.message ?? e?.message ?? 'Could not open conversation.';
            Alert.alert('Contact Seller', message, [
              { text: 'Contact externally', onPress: () => openExternalContact(listingData) },
              { text: 'Back', style: 'cancel', onPress: () => router.back() },
            ]);
            setLoading(false);
            return;
          }
        }

        setNegotiation(existing);
        const history = await negotiationService.getHistory(existing.id);
        setMessages(history);
      } catch (error: any) {
        const message = error?.response?.data?.message ?? error?.message ?? 'Could not open conversation.';
        Alert.alert('Contact Seller', message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [listingId, router]);

  const send = async () => {
    if (!negotiation || !draft.trim() || sending) return;

    const content = draft.trim();
    setDraft('');
    setSending(true);

    try {
      const sent = await negotiationService.sendMessage({
        negotiationId: negotiation.id,
        content,
        messageType: 'text',
      });
      setMessages(prev => [...prev, sent]);
      showToast('Message sent', 'success');
    } catch (error: any) {
      setDraft(content);
      Alert.alert('Send failed', error?.response?.data?.message ?? error?.message ?? 'Could not send your message.');
    } finally {
      setSending(false);
    }
  };

  const openExternalContact = (listing?: Listing) => {
    const phone = sellerContact?.phone;
    const email = sellerContact?.email;
    const listingText = listing ? `Hi, I'm interested in your listing \"${listing.title}\"` : 'Hi, I am interested in your listing.';

    const options: any[] = [];
    if (phone) options.push({ text: 'WhatsApp', onPress: () => openWhatsApp(phone, listingText) });
    if (phone) options.push({ text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) });
    if (email) options.push({ text: 'Email', onPress: () => Linking.openURL(`mailto:${email}?subject=${encodeURIComponent('Listing inquiry')}&body=${encodeURIComponent(listingText)}`) });
    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Contact Seller', 'Choose how to contact the seller', options as any);
  };

  const openWhatsApp = async (phone: string, text: string) => {
    const phoneClean = phone.replace(/[^0-9]/g, '');
    const appUrl = `whatsapp://send?phone=${phoneClean}&text=${encodeURIComponent(text)}`;
    const webUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
    try {
      const supported = await Linking.canOpenURL(appUrl);
      await Linking.openURL(supported ? appUrl : webUrl);
    } catch (err) {
      Alert.alert('Could not open WhatsApp', 'Please contact the seller manually.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Contact Seller
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {listing?.title ?? 'Conversation'}
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Listing</Text>
        <Text style={styles.summaryTitle} numberOfLines={2}>{listing?.title}</Text>
        <Text style={styles.summaryMeta}>
          {listing ? `₱${Number(listing.price).toLocaleString('en-PH')} • ${listing.municipality}, ${listing.province}` : ''}
        </Text>
        <Text style={[styles.summaryStatus, amBuyer ? styles.buyerTag : styles.sellerTag]}>
          {amBuyer ? 'Buyer view' : 'Seller view'}
        </Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContent}
        renderItem={({ item }) => {
          const isMine = item.sender_id === currentUserId;
          return (
            <View style={[styles.messageRow, isMine ? styles.messageRowMine : styles.messageRowTheirs]}>
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[styles.messageText, isMine ? styles.messageTextMine : styles.messageTextTheirs]}>
                  {item.content}
                </Text>
                <Text style={[styles.timeText, isMine ? styles.timeTextMine : styles.timeTextTheirs]}>
                  {new Date(item.sent_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Start the conversation</Text>
            <Text style={styles.emptyText}>Send a message to the seller to ask about the lot or make an offer.</Text>
          </View>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Write a message..."
            placeholderTextColor={TEXT_MED}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!draft.trim() || sending}
          >
            {sending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.sendText}>Send</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  backText: { fontSize: 26, color: TEXT_DARK, marginTop: -2 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  headerSubtitle: { fontSize: 13, color: TEXT_MED, marginTop: 2 },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: PRIMARY_LIGHT,
  },
  summaryLabel: { fontSize: 12, fontWeight: '700', color: PRIMARY, textTransform: 'uppercase', marginBottom: 4 },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: TEXT_DARK },
  summaryMeta: { marginTop: 4, fontSize: 13, color: TEXT_MED },
  summaryStatus: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  buyerTag: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  sellerTag: { backgroundColor: '#FCE7F3', color: '#BE185D' },
  messagesContent: { padding: 16, paddingBottom: 12 },
  emptyBox: { marginTop: 60, alignItems: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  emptyText: { marginTop: 6, textAlign: 'center', color: TEXT_MED, lineHeight: 20 },
  messageRow: { marginBottom: 10, flexDirection: 'row' },
  messageRowMine: { justifyContent: 'flex-end' },
  messageRowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleMine: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 21 },
  messageTextMine: { color: '#FFFFFF' },
  messageTextTheirs: { color: TEXT_DARK },
  timeText: { marginTop: 6, fontSize: 11 },
  timeTextMine: { color: 'rgba(255,255,255,0.8)' },
  timeTextTheirs: { color: TEXT_MED },
  composer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
    backgroundColor: BG,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT_DARK,
    backgroundColor: '#FFFFFF',
  },
  sendBtn: {
    minWidth: 80,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: '#FFFFFF', fontWeight: '800' },
});
