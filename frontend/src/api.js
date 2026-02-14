/**
 * API client for the LLM Council backend.
 */

// Use environment variable for production, or default to same origin (when served from backend)
// In production (served from same backend), API_BASE will be empty string (same origin)
// In development, use localhost
const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8001' : '');

export const api = {
  /**
   * List all conversations.
   */
  async listConversations() {
    const response = await fetch(`${API_BASE}/api/conversations`);
    if (!response.ok) {
      throw new Error('Failed to list conversations');
    }
    return response.json();
  },

  /**
   * Create a new conversation.
   */
  async createConversation() {
    try {
      const url = `${API_BASE}/api/conversations`;
      console.log('Creating conversation at:', url);
      console.log('API_BASE is:', API_BASE);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create conversation error:', response.status, errorText);
        throw new Error(`Failed to create conversation: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Conversation created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('Create conversation exception:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Cannot connect to backend at ${API_BASE}. Please check that the backend is running and VITE_API_BASE_URL is set correctly.`);
      }
      throw error;
    }
  },

  /**
   * Delete a conversation.
   */
  async deleteConversation(conversationId) {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
    return response.json();
  },

  /**
   * Get a specific conversation.
   */
  async getConversation(conversationId) {
    try {
      const response = await fetch(
        `${API_BASE}/api/conversations/${conversationId}`
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get conversation error:', response.status, errorText);
        throw new Error(`Failed to get conversation: ${response.status} ${errorText}`);
      }
      return response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Cannot connect to backend. Please check that the backend is running at ${API_BASE}`);
      }
      throw error;
    }
  },

  /**
   * Send a message in a conversation.
   */
  async sendMessage(conversationId, content) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    return response.json();
  },

  /**
   * Send a message and receive streaming updates.
   * @param {string} conversationId - The conversation ID
   * @param {string} content - The message content
   * @param {function} onEvent - Callback function for each event: (eventType, data) => void
   * @returns {Promise<void>}
   */
  async sendMessageStream(conversationId, content, onEvent) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/message/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const event = JSON.parse(data);
            onEvent(event.type, event);
          } catch (e) {
            console.error('Failed to parse SSE event:', e);
          }
        }
      }
    }
  },

  // ========== PROMPT ENGINEERING ENDPOINTS ==========

  async sendPromptEngineeringMessage(conversationId, content) {
    try {
      const response = await fetch(
        `${API_BASE}/api/conversations/${conversationId}/prompt-engineering/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Prompt engineering error:', response.status, errorText);
        let errorMessage = 'Failed to send prompt engineering message';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }
      
      return response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Cannot connect to backend. Please check that the backend is running at ${API_BASE}`);
      }
      throw error;
    }
  },

  async suggestFinalPrompt(conversationId) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/prompt-engineering/suggest-final`,
      {
        method: 'POST',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to suggest final prompt');
    }
    return response.json();
  },

  async finalizePrompt(conversationId, finalizedPrompt) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/prompt-engineering/finalize`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ finalized_prompt: finalizedPrompt }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to finalize prompt');
    }
    return response.json();
  },

  async getPromptRefinementOpening(conversationId, priorSynthesis = '') {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/prompt-engineering/refinement-opening`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prior_synthesis: priorSynthesis }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to get refinement opening');
    }
    return response.json();
  },

  // ========== CONTEXT ENGINEERING ENDPOINTS ==========

  async sendContextEngineeringMessage(conversationId, content) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/context-engineering/message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to send context engineering message');
    }
    return response.json();
  },

  async addDocument(conversationId, name, content) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/context-engineering/document`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, content }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to add document');
    }
    return response.json();
  },

  async uploadFile(conversationId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/context-engineering/file`,
      {
        method: 'POST',
        body: formData,
      }
    );
    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    return response.json();
  },

  async addLink(conversationId, url) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/context-engineering/link`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to add link');
    }
    return response.json();
  },

  async getContextRefinementOpening(conversationId, priorContextSummary = '') {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/context-engineering/refinement-opening`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prior_context_summary: priorContextSummary }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to get context refinement opening');
    }
    return response.json();
  },

  async packageContext(conversationId) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/context-engineering/package`,
      {
        method: 'POST',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to package context');
    }
    return response.json();
  },

  async finalizeContext(conversationId, finalizedContext) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/context-engineering/finalize`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ finalized_context: finalizedContext }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to finalize context');
    }
    return response.json();
  },

  // ========== COUNCIL DELIBERATION ENDPOINTS ==========

  async startCouncilDeliberation(conversationId) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/council-deliberation/message`,
      {
        method: 'POST',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to start council deliberation');
    }
    return response.json();
  },

  async startCouncilDeliberationStream(conversationId, onEvent) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/council-deliberation/message/stream`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to start council deliberation');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const event = JSON.parse(data);
            onEvent(event.type, event);
          } catch (e) {
            console.error('Failed to parse SSE event:', e);
          }
        }
      }
    }
  },
};
