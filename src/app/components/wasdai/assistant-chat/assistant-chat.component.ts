import { Component, signal, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { AssistantService } from '../../../services/api/ai/assistant.service';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: string[];
  timestamp: Date;
}

@Component({
  selector: 'app-assistant-chat',
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './assistant-chat.component.html',
  styleUrl: './assistant-chat.component.css',
})
export class AssistantChatComponent implements OnChanges {
  @ViewChild('promptInput') promptInput!: ElementRef<HTMLTextAreaElement>;

  @Input() chatId: string | null = null;
  @Input() initialMessages: Message[] = [];

  messages = signal<Message[]>([]);
  isLoading = signal(false);
  isDisabled = signal(true);

  constructor(private assistantService: AssistantService) {
    this.initializeMockMessages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chatId']) {
      // Enable/disable based on chatId
      this.isDisabled.set(!this.chatId);
    }
    if (changes['initialMessages']) {
      // Load messages from parent when chat is selected
      this.messages.set(this.initialMessages || []);
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

    // Clear input
    if (this.promptInput) {
      this.promptInput.nativeElement.value = '';
    }

    this.isLoading.set(true);
    this.assistantService.chat(this.chatId, trimmedPrompt).subscribe({
      next: (response: unknown) => {
        const assistantMessage: Message = {
          id: this.generateMessageId(),
          role: 'assistant',
          content: this.extractAssistantContent(response),
          attachments: this.extractAttachments(response),
          timestamp: new Date(),
        };

        this.messages.set([...this.messages(), assistantMessage]);
      },
      error: () => {
        const errorMessage: Message = {
          id: this.generateMessageId(),
          role: 'assistant',
          content:
            'I could not process your request right now. Please try again in a few moments.',
          timestamp: new Date(),
        };

        this.messages.set([...this.messages(), errorMessage]);
      },
      complete: () => {
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
  }

  /**
   * Handle file upload for attachments (mock method)
   */
  onFileUpload(files: FileList): void {
    // Mock implementation - to be replaced with real file upload
    console.log('Files selected:', files);
  }
}
