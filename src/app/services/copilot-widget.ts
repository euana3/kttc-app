import { Injectable, signal } from '@angular/core';
import { ChatService, ChatMessage } from './chat';

@Injectable({ providedIn: 'root' })
export class CopilotWidgetService {
  readonly open = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  readonly draft = signal('');
  readonly sending = signal(false);
  readonly error = signal<string | null>(null);

  private historyLoaded = false;

  constructor(private chatService: ChatService) {}

  toggle(): void {
    this.open.update(v => !v);
    if (this.open() && !this.historyLoaded) {
      this.loadHistory();
    }
  }

  private loadHistory(): void {
    this.historyLoaded = true;
    this.chatService.getHistory().subscribe({
      next: (messages) => this.messages.set(messages.slice(-4)),
      error: (err) => console.error('Failed to load chat history', err),
    });
  }

  newChat(): void {
    this.messages.set([]);
    this.draft.set('');
    this.error.set(null);
    this.sending.set(false);
  }

  ask(): void {
    const message = this.draft().trim();
    if (!message || this.sending()) return;

    this.sending.set(true);
    this.error.set(null);

    const optimisticUserMsg: ChatMessage = {
      id: -Date.now(),
      trainer_id: null,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };
    this.messages.update(msgs => [...msgs, optimisticUserMsg].slice(-4));
    this.draft.set('');

    this.chatService.sendMessage({ message }).subscribe({
      next: (reply) => {
        this.messages.update(msgs => [...msgs, reply].slice(-4));
        this.sending.set(false);
      },
      error: (err) => {
        console.error('Copilot request failed', err);
        this.error.set('Copilot is unavailable right now — try again shortly.');
        this.sending.set(false);
      },
    });
  }
}