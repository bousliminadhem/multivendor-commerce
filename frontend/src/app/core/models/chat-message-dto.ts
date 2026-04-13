export interface ChatMessageDto {
  id?: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  content: string;
  isRead: boolean;
  createdAt?: string;
  attachmentUrl?: string;
}

export interface ConversationDto {
  id?: number;
  participantIds: number[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt?: string;
}
