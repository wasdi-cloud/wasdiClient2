import { Component, signal, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

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

  constructor() {
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
    if (!prompt.trim()) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: this.generateMessageId(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    const currentMessages = this.messages();
    this.messages.set([...currentMessages, userMessage]);

    // Clear input
    if (this.promptInput) {
      this.promptInput.nativeElement.value = '';
    }

    // Simulate AI response after a delay
    this.isLoading.set(true);
    setTimeout(() => {
      this.simulateAIResponse(prompt);
      this.isLoading.set(false);
    }, 1000);
  }

  /**
   * Simulate an AI response (mock method to be replaced with real API call)
   * @param userPrompt - The original user prompt
   */
  private simulateAIResponse(userPrompt: string): void {
    const mockResponses: { [key: string]: string } = {
      default:
        '# Response to your query\n\nI\'m processing your request about your WASDI workspace. This is a mock response that will be replaced with real AI assistance once the API is implemented.\n\n**Key points:**\n- Point 1\n- Point 2\n- Point 3\n\n```python\n# Example code\nprint("This is a code block")\n```',
      analysis: `## Analysis Results\n\nBased on your EO data, here are the insights:\n\n### Metrics\n- Coverage: 95%\n- Quality: High\n- Bands: 12\n\nLet me know if you need more details!`,
      help: `## How can I help?\n\nI can assist you with:\n1. Analyzing your EO data\n2. Processing satellite imagery\n3. Answering WASDI platform questions\n4. Generating reports\n\nWhat would you like to explore?`,
    };

    const responseKey = userPrompt.toLowerCase().includes('analyz')
      ? 'analysis'
      : userPrompt.toLowerCase().includes('help')
        ? 'help'
        : 'default';

    const assistantMessage: Message = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: mockResponses[responseKey],
      attachments: [], // Add sample image URLs if needed
      timestamp: new Date(),
    };

    const currentMessages = this.messages();
    this.messages.set([...currentMessages, assistantMessage]);
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
