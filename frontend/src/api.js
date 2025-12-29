/**
 * API client for the LLM Council backend.
 */

// Use environment variable for production, fallback to localhost for development
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

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
    const response = await fetch(`${API_BASE}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }
    return response.json();
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
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}`
    );
    if (!response.ok) {
      throw new Error('Failed to get conversation');
    }
    return response.json();
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
      throw new Error('Failed to send prompt engineering message');
    }
    return response.json();
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
