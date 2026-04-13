import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { AuthStore } from '../../../core/store/auth.store';
import { ChatMessageDto, ConversationDto } from '../../../core/models/chat-message-dto';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Chat Widget Button -->
    @if (!chatOpen()) {
      <button 
        (click)="onToggleChat()"
        class="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
      >
        <svg class="h-6 w-6 group-hover:hidden" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
        </svg>
        <span class="group-hover:flex hidden">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </span>
        
        <!-- Notification Badge -->
        @if (unreadCount() > 0) {
          <span class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {{ unreadCount() }}
          </span>
        }
      </button>
    } @else {
      <!-- Chat Panel -->
      <div class="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 class="font-bold">Chat Support</h3>
            <p class="text-xs text-indigo-100">We typically reply in minutes</p>
          </div>
          <button 
            (click)="onToggleChat()"
            class="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          @if (messages().length === 0) {
            <div class="flex h-full items-center justify-center text-center">
              <div class="space-y-2">
                <svg class="h-12 w-12 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p class="text-sm font-semibold text-slate-600">Start a conversation</p>
                <p class="text-xs text-slate-500">Send us a message and we'll respond as soon as possible.</p>
              </div>
            </div>
          } @else {
            @for (message of messages(); track message.id) {
              <div 
                class="flex gap-2"
                [class.justify-end]="isCurrentUserMessage(message)"
                [class.justify-start]="!isCurrentUserMessage(message)"
              >
                <div 
                  class="max-w-xs px-4 py-2 rounded-2xl break-words"
                  [class.bg-indigo-600]="isCurrentUserMessage(message)"
                  [class.text-white]="isCurrentUserMessage(message)"
                  [class.bg-slate-200]="!isCurrentUserMessage(message)"
                  [class.text-slate-900]="!isCurrentUserMessage(message)"
                >
                  <p class="text-sm">{{ message.content }}</p>
                  <p class="text-xs opacity-70 mt-1">{{ formatTime(message.createdAt) }}</p>
                </div>
              </div>
            }
          }
          <div #messagesEnd></div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-slate-200 p-4 bg-white">
          <form (ngSubmit)="onSendMessage()" class="flex gap-2" #chatForm="ngForm">
            <input 
              type="text"
              [(ngModel)]="newMessage"
              name="message"
              placeholder="Type a message..."
              class="flex-1 px-4 py-2 rounded-full border border-slate-300 bg-slate-50 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            />
            <button 
              type="submit"
              [disabled]="!newMessage().trim() || sending()"
              class="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (sending()) {
                <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else {
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              }
            </button>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes slide-in-from-bottom {
      from {
        opacity: 0;
        transform: translateY(1rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-in {
      animation: slide-in-from-bottom 0.3s ease-out;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  private readonly chatService = inject(ChatService);
  private readonly authStore = inject(AuthStore);

  readonly chatOpen = signal(false);
  readonly messages = signal<ChatMessageDto[]>([]);
  readonly sending = signal(false);
  readonly newMessage = signal('');
  readonly currentConversation = signal<ConversationDto | null>(null);
  readonly unreadCount = computed(() => this.currentConversation()?.unreadCount ?? 0);

  ngOnInit(): void {
    // Auto-load or create conversation
    this.loadConversation();
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions
  }

  onToggleChat(): void {
    this.chatOpen.update(v => !v);
    if (!this.chatOpen()) return;
    
    // Mark as read when opening
    if (this.currentConversation()?.id) {
      const conversationId = this.currentConversation()!.id;
      if (conversationId) {
        this.chatService.markMessagesAsRead(conversationId).subscribe();
      }
    }
  }

  private loadConversation(): void {
    this.chatService.getConversations().subscribe({
      next: (conversations) => {
        if (conversations.length > 0) {
          this.currentConversation.set(conversations[0]);
          this.loadMessages(conversations[0].id!);
        }
      }
    });
  }

  private loadMessages(conversationId: number): void {
    this.chatService.getMessages(conversationId).subscribe({
      next: (messages) => this.messages.set(messages)
    });
  }

  onSendMessage(): void {
    const content = this.newMessage().trim();
    if (!content || !this.currentConversation()) return;

    this.sending.set(true);
    this.newMessage.set('');

    this.chatService.sendMessage(this.currentConversation()!.id!, content).subscribe({
      next: (message) => {
        this.messages.update(m => [...m, message]);
        this.sending.set(false);
      },
      error: () => this.sending.set(false)
    });
  }

  isCurrentUserMessage(message: ChatMessageDto): boolean {
    const currentUser = this.authStore.user();
    return message.senderId === currentUser?.id;
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}
