import { Component, signal, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { AssistantService } from '../../../services/api/ai/assistant.service';
import { InvaderComponent } from '../../../../assets/invader/invader.component';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: string[];
  timestamp: Date;
}

@Component({
  selector: 'app-assistant-chat',
  imports: [CommonModule, FormsModule, MarkdownModule, InvaderComponent],
  templateUrl: './assistant-chat.component.html',
  styleUrl: './assistant-chat.component.css',
})
export class AssistantChatComponent implements OnChanges, AfterViewInit {
  @ViewChild('promptInput') promptInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  @Input() chatId: string | null = null;
  @Input() initialMessages: Message[] = [];

  messages = signal<Message[]>([]);
  isLoading = signal(false);
  isDisabled = signal(true);
  // Streaming buffers and timers for client-side throttling
  private streamingBuffers: Record<string, string> = {};
  private streamingTimers: Record<string, number> = {};
  private streamingFinished: Record<string, boolean> = {};

  constructor(private assistantService: AssistantService) {
    this.initializeMockMessages();
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chatId']) {
      // Enable/disable based on chatId
      this.isDisabled.set(!this.chatId);
    }
    if (changes['initialMessages']) {
      // Load messages from parent when chat is selected
      this.messages.set(this.initialMessages || []);
      this.scrollToBottom();
    }
  }

  /**
   * Initialize with a welcome message
   */
  private initializeMockMessages(): void {
    // Mock initial welcome state - can be empty or with a greeting
  }

  /**
   * Submit the user's prompt
   * @param prompt - The user's input text
   */
  submit(prompt: string): void {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || !this.chatId) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: this.generateMessageId(),
      role: 'user',
      content: trimmedPrompt,
      timestamp: new Date(),
    };

    const currentMessages = this.messages();
    this.messages.set([...currentMessages, userMessage]);
    this.scrollToBottom();

    // Clear input
    if (this.promptInput) {
      this.promptInput.nativeElement.value = '';
    }

    // Create empty assistant message that will be updated with streaming content
    const assistantMessageId = this.generateMessageId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    this.messages.set([...this.messages(), assistantMessage]);
    this.scrollToBottom();

    this.isLoading.set(true);
    this.assistantService.chat(this.chatId, trimmedPrompt).subscribe({
        next: (sChunk: string) => {
        try { console.debug('[AssistantChat] received chunk', { len: sChunk.length, preview: sChunk.slice(0,100) }); } catch(e) {}
        // Buffer the incoming chunk and reveal it gradually for typing effect
        this.handleStreamChunk(assistantMessageId, sChunk);
      },
      error: (err) => {
        const errorMessage: Message = {
          id: this.generateMessageId(),
          role: 'assistant',
          content:
            'I could not process your request right now. Please try again in a few moments.',
          timestamp: new Date(),
        };
        try { console.error('[AssistantChat] stream error', err); } catch(e) {}
        this.messages.set([...this.messages(), errorMessage]);
        this.scrollToBottom();
        this.isLoading.set(false);
      },
      complete: () => {
        try { console.debug('[AssistantChat] stream complete for', assistantMessageId); } catch(e) {}
        this.finishStream(assistantMessageId);
        this.isLoading.set(false);
      },
    });
  }

  private extractAssistantContent(response: unknown): string {
    if (typeof response === 'string') {
      return response;
    }

    if (response && typeof response === 'object') {
      const payload = response as Record<string, unknown>;
      const candidates = [
        payload['content'],
        payload['response'],
        payload['message'],
        payload['text'],
      ];

      for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate;
        }
      }

      const data = payload['data'];
      if (data && typeof data === 'object') {
        const dataPayload = data as Record<string, unknown>;
        const nestedCandidates = [
          dataPayload['content'],
          dataPayload['response'],
          dataPayload['message'],
          dataPayload['text'],
        ];

        for (const candidate of nestedCandidates) {
          if (typeof candidate === 'string' && candidate.trim()) {
            return candidate;
          }
        }
      }
    }

    return 'No response content received from the assistant API.';
  }

  /**
   * Buffer incoming stream chunks and reveal them gradually.
   */
private handleStreamChunk(messageId: string, chunk: string) {
  this.messages.update(msgs => {
    // create a brand NEW array reference so Angular detects the change
    const newMsgs = [...msgs]; 
    
    // find and update the specific message
    const idx = newMsgs.findIndex(m => m.id === messageId);
    if (idx >= 0) {
      newMsgs[idx] = { 
        ...newMsgs[idx], 
        content: newMsgs[idx].content + chunk 
      };
    }
    
    // return the new array to trigger the UI render immediately
    return newMsgs;
  });

  this.scrollToBottom();
}

  /**
   * Mark stream finished; flush remaining buffer and stop timer.
   */
  private finishStream(messageId: string) {
    this.streamingFinished[messageId] = true;
    const remaining = this.streamingBuffers[messageId] || '';
    if (remaining) {
      this.messages.update(msgs => {
        const idx = msgs.findIndex(m => m.id === messageId);
        if (idx >= 0) {
          msgs[idx] = { ...msgs[idx], content: msgs[idx].content + remaining };
        }
        return msgs;
      });
      this.scrollToBottom();
      delete this.streamingBuffers[messageId];
    }

    if (this.streamingTimers[messageId]) {
      clearInterval(this.streamingTimers[messageId]);
      delete this.streamingTimers[messageId];
    }
    delete this.streamingFinished[messageId];
  }
  
  private extractAttachments(response: unknown): string[] {
    if (!response || typeof response !== 'object') {
      return [];
    }

    const payload = response as Record<string, unknown>;
    const direct = payload['attachments'];
    if (Array.isArray(direct)) {
      return direct.filter((value): value is string => typeof value === 'string');
    }

    const data = payload['data'];
    if (data && typeof data === 'object') {
      const nested = (data as Record<string, unknown>)['attachments'];
      if (Array.isArray(nested)) {
        return nested.filter((value): value is string => typeof value === 'string');
      }
    }

    return [];
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      if (!this.messagesContainer) {
        return;
      }

      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    });
  }

  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear conversation history (mock method)
   */
  clearHistory(): void {
    this.messages.set([]);
    this.scrollToBottom();
  }

  /**
   * Handle file upload for attachments (mock method)
   */
  onFileUpload(files: FileList): void {
    // Mock implementation - to be replaced with real file upload
    console.log('Files selected:', files);
  }
}
