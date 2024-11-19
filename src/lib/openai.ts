import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Store the thread ID in localStorage to maintain conversation context
const getThreadId = () => localStorage.getItem('openai_thread_id');
const setThreadId = (threadId: string) => localStorage.setItem('openai_thread_id', threadId);

// Assistant ID should be stored in environment variables
const ASSISTANT_ID = import.meta.env.VITE_OPENAI_ASSISTANT_ID;

export const openaiApi = {
  async createThread() {
    try {
      const thread = await openai.beta.threads.create();
      setThreadId(thread.id);
      return thread;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw new Error('Failed to create conversation thread');
    }
  },

  async getOrCreateThread() {
    const existingThreadId = getThreadId();
    if (existingThreadId) {
      try {
        const thread = await openai.beta.threads.retrieve(existingThreadId);
        return thread;
      } catch (error) {
        console.warn('Thread not found, creating new one');
      }
    }
    return this.createThread();
  },

  async sendMessage(content: string) {
    try {
      const thread = await this.getOrCreateThread();

      // Add the user's message to the thread
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content,
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: ASSISTANT_ID,
      });

      // Poll for the completion
      let response;
      while (true) {
        const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        
        if (runStatus.status === 'completed') {
          // Get the assistant's response
          const messages = await openai.beta.threads.messages.list(thread.id);
          response = messages.data[0].content[0];
          break;
        } else if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
          throw new Error('Assistant response failed');
        }

        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return response.text?.value || 'I apologize, but I cannot provide a response at the moment.';
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw new Error('Failed to get AI response');
    }
  },

  async clearThread() {
    localStorage.removeItem('openai_thread_id');
  }
};