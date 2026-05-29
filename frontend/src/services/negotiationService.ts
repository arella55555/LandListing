import api from './api';

export interface Negotiation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  asking_price: number;
  final_price?: number | null;
  status: 'open' | 'accepted' | 'rejected' | 'withdrawn' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  negotiation_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  message_type: 'text' | 'offer' | 'counter_offer' | 'acceptance' | 'rejection';
  offer_amount?: number | null;
  sent_at: string;
}

type ApiNegotiationResponse = { negotiation?: Negotiation } | Negotiation;

export const negotiationService = {
  async createNegotiation(listingId: string, askingPrice?: number): Promise<Negotiation> {
    const body: any = { listing_id: listingId };
    if (askingPrice !== undefined && askingPrice !== null) body.asking_price = askingPrice;
    const response = await api.post('/negotiations', body);

    return (response.data?.negotiation ?? response.data) as Negotiation;
  },

  async getMyNegotiations(): Promise<Negotiation[]> {
    const response = await api.get('/negotiations/my-offers');
    return (response.data?.negotiations ?? response.data ?? []) as Negotiation[];
  },

  async getNegotiationById(id: string): Promise<Negotiation> {
    const response = await api.get(`/negotiations/${id}`);
    return (response.data?.negotiation ?? response.data) as Negotiation;
  },

  async getHistory(negotiationId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/messages/history/${negotiationId}`);
    return (response.data?.history ?? response.data ?? []) as ChatMessage[];
  },

  async sendMessage(params: {
    negotiationId: string;
    content: string;
    messageType?: ChatMessage['message_type'];
    offerAmount?: number;
  }): Promise<ChatMessage> {
    const response = await api.post('/messages', {
      negotiation_id: params.negotiationId,
      content: params.content,
      message_type: params.messageType ?? 'text',
      offer_amount: params.offerAmount,
    });

    return (response.data?.chatMessage ?? response.data) as ChatMessage;
  },
};
