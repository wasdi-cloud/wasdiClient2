import { Component, OnInit, signal } from '@angular/core';
import {NotificationDisplayService} from "../../services/notification-display.service";
import {TranslateService} from "@ngx-translate/core";
import {AssistantChatComponent} from "./assistant-chat/assistant-chat.component";
import { AssistantService } from "../../services/api/ai/assistant.service";
import { CommonModule } from '@angular/common';

interface ChatListViewModel {
  chatId: string;
  timestamp: number;
  title: string;
  prompts?: string[];
  answers?: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: string[];
  timestamp: Date;
}

@Component({
  selector: 'app-wasdai',
  imports: [AssistantChatComponent, CommonModule],
  templateUrl: './wasdai.component.html',
  styleUrl: './wasdai.component.css',
  host: { 'class': 'flex-fill' },
})

export class WasdaiComponent implements OnInit {
  m_sActiveTab: string | null = null;
  chats = signal<ChatListViewModel[]>([]);
  isLoadingChats = signal(false);
  currentChatId = signal<string | null>(null);
  currentChatMessages = signal<Message[]>([]);
  isLoadingChat = signal(false);

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService,
    private m_oAssistantService: AssistantService) {
  }

  ngOnInit(): void {
    this.loadChats();
  }

  loadChats(): void {
    this.isLoadingChats.set(true);
    this.m_oAssistantService.listChat().subscribe({
      next: (chats: ChatListViewModel[]) => {
        this.chats.set(chats || []);
        this.isLoadingChats.set(false);
      },
      error: (err) => {
        console.error('Error loading chats:', err);
        this.m_oNotificationDisplayService.openSnackBar('Error loading chats');
        let oChat = {
          chatId: 'mock-chat-id',
          timestamp: Date.now(),
          title: 'Mock Chat'
        };
        this.chats.set([oChat]);
        this.isLoadingChats.set(false);
      }
    });
  }

  onNewChat(): void {
    this.m_oAssistantService.newChat().subscribe({
      next: (chatId: string) => {
        this.currentChatId.set(chatId);
        this.currentChatMessages.set([]);
        this.m_sActiveTab = chatId;
        console.log('New chat created with ID:', chatId);
      },
      error: (err) => {
        console.error('Error creating new chat:', err);
        this.m_oNotificationDisplayService.openSnackBar('Error creating new chat');
      }
    });
  }

  onSelectChat(chatId: string): void {
    this.m_sActiveTab = chatId;
    this.isLoadingChat.set(true);
    // Set current chat ID immediately to enable UI
    this.currentChatId.set(chatId);
    
    this.m_oAssistantService.getChat(chatId).subscribe({
      next: (chatData: ChatListViewModel) => {
        // Transform prompts/answers into message pairs
        const aoMessages = this.transformPromptsAnswersToMessages(chatData);
        this.currentChatMessages.set(aoMessages);
        this.isLoadingChat.set(false);
        console.log('Chat loaded:', chatId);
      },
      error: (err) => {
        console.error('Error loading chat:', err);
        this.m_oNotificationDisplayService.openSnackBar('Error loading chat');
        // Load mock chat on error
        const oMockChat = this.getMockChatViewModel();
        const oMockMessages = this.transformPromptsAnswersToMessages(oMockChat);
        this.currentChatMessages.set(oMockMessages);
        this.isLoadingChat.set(false);
      }
    });
  }

  /**
   * Transform prompts and answers arrays into Message objects
   * @param chatData - ChatViewModel with prompts and answers arrays
   * @returns Array of Message objects interleaving user prompts and assistant answers
   */
  private transformPromptsAnswersToMessages(chatData: ChatListViewModel): Message[] {
    const messages: Message[] = [];
    const prompts = chatData.prompts || [];
    const answers = chatData.answers || [];
    const maxPairs = Math.max(prompts.length, answers.length);

    for (let i = 0; i < maxPairs; i++) {
      // Add user message (prompt)
      if (i < prompts.length && prompts[i]) {
        messages.push({
          id: `msg-user-${i}`,
          role: 'user',
          content: prompts[i],
          timestamp: new Date(chatData.timestamp + i * 1000)
        });
      }
      // Add assistant message (answer)
      if (i < answers.length && answers[i]) {
        messages.push({
          id: `msg-assistant-${i}`,
          role: 'assistant',
          content: answers[i],
          timestamp: new Date(chatData.timestamp + (i * 1000) + 500)
        });
      }
    }

    return messages;
  }

  /**
   * Create a mock ChatViewModel for testing/error scenarios
   * @returns Sample ChatViewModel with mock prompts and answers
   */
  private getMockChatViewModel(): ChatListViewModel {
    return {
      chatId: 'mock-chat-' + Date.now(),
      timestamp: Date.now(),
      title: 'Mock Chat Example',
      prompts: [
        'What data sources are available in WASDI?',
        'How do I process Sentinel-2 imagery?',
        'Can you help me create a processing workflow?'
      ],
      answers: [
        `## Available Data Sources in WASDI

WASDI provides access to multiple EO data sources:

- **Sentinel-1**: Synthetic Aperture Radar (SAR) data
- **Sentinel-2**: Multispectral optical imagery
- **Landsat**: 30m resolution multispectral data
- **MODIS**: Global vegetation and climate data

\`\`\`json
{
  "sources": ["Sentinel-1", "Sentinel-2", "Landsat", "MODIS"]
}
\`\`\``,
        `## Processing Sentinel-2 Imagery

Here's a basic workflow:

1. **Search and download** available scenes for your area of interest
2. **Apply radiometric correction** to convert DN to TOA reflectance
3. **Perform atmospheric correction** to get surface reflectance
4. **Calculate indices** like NDVI, NDBI, etc.

\`\`\`python
# Example: Calculate NDVI
ndvi = (nir - red) / (nir + red)
\`\`\``,
        `## Creating a Processing Workflow

You can create custom workflows in WASDI:

1. Define input products
2. Add processing steps (custom algorithms or built-in processors)
3. Specify output products
4. Schedule for automated execution

Would you like help with a specific processing step?`
      ]
    };
  }

  getActiveTab(sEvent: string) {
    this.m_sActiveTab = sEvent;
  }
}
