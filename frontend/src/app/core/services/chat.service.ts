import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ChatMessageDto, ConversationDto } from '../models/chat-message-dto';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/chat`;

  getConversations() {
    return this.http.get<ConversationDto[]>(`${this.baseUrl}/conversations`);
  }

  getMessages(conversationId: number, page: number = 0, size: number = 50) {
    return this.http.get<ChatMessageDto[]>(`${this.baseUrl}/conversations/${conversationId}/messages`, {
      params: { page, size }
    });
  }

  sendMessage(conversationId: number, content: string, attachmentUrl?: string) {
    return this.http.post<ChatMessageDto>(`${this.baseUrl}/conversations/${conversationId}/messages`, {
      content,
      attachmentUrl
    });
  }

  createConversation(participantIds: number[]) {
    return this.http.post<ConversationDto>(`${this.baseUrl}/conversations`, { participantIds });
  }

  markMessagesAsRead(conversationId: number) {
    return this.http.put<void>(`${this.baseUrl}/conversations/${conversationId}/mark-read`, {});
  }
}
