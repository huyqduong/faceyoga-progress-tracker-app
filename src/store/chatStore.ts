import { create } from 'zustand';
import { openaiApi } from '../lib/openai';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  addMessage: (text: string, sender: 'user' | 'ai') => void;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,

  addMessage: (text: string, sender: 'user' | 'ai') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  sendMessage: async (text: string) => {
    const { addMessage } = get();
    set({ loading: true, error: null });

    try {
      // Add user message
      addMessage(text, 'user');

      // Get AI response using the assistant
      const response = await openaiApi.sendMessage(text);
      
      // Add AI response
      addMessage(response, 'ai');
    } catch (error) {
      set({ error: 'Failed to get AI response. Please try again.' });
      console.error('AI Assistant Error:', error);
    } finally {
      set({ loading: false });
    }
  },

  clearMessages: async () => {
    await openaiApi.clearThread();
    set({ messages: [], error: null });
  },
}));