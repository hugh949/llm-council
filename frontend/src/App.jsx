import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import PreparationStep from './components/PreparationStep';
import ChatInterface from './components/ChatInterface';
import StepView from './components/StepView';
import { api } from './api';
import './App.css';

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [viewingStep, setViewingStep] = useState(null); // 'step1', 'step2', 'step3', or null

  // Define functions FIRST before useEffects that use them
  const extractPriorDeliberationSummary = (conv) => {
    try {
      if (!conv) return null;
      const prior = conv.prior_synthesis;
      if (typeof prior === 'string') return prior;
      const councilMsgs = Array.isArray(conv.council_deliberation?.messages) ? conv.council_deliberation.messages : [];
      for (let i = councilMsgs.length - 1; i >= 0; i--) {
        const msg = councilMsgs[i];
        if (msg?.role === 'assistant' && msg?.stage3 != null) {
          const response = typeof msg.stage3 === 'object' && msg.stage3 !== null ? (msg.stage3.response ?? '') : String(msg.stage3 ?? '');
          if (response) return response.length > 3000 ? response.substring(0, 3000) + '...' : response;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const loadConversations = async () => {
    try {
      const convs = await api.listConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversation = async (id) => {
    try {
      const conv = await api.getConversation(id);
      if (conv && conv.id) {
        const previousConv = currentConversation;
        try {
          setCurrentConversation(conv);
          return conv;
        } catch (setError) {
          console.error('Error updating conversation state:', setError);
          if (previousConv) setCurrentConversation(previousConv);
          return previousConv || conv;
        }
      }
      if (currentConversation && currentConversation.id === id) return currentConversation;
      throw new Error('Invalid conversation data received from server');
    } catch (error) {
      console.error('Failed to load conversation:', error);
      if (!currentConversation) alert(`Error: ${error.message || 'Failed to load conversation. Please try again.'}`);
      return currentConversation || null;
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleNewConversation = async () => {
    if (isCreatingConversation) return;
    setIsCreatingConversation(true);
    console.log('[handleNewConversation] starting create...');
    try {
      const newConv = await api.createConversation();
      console.log('[handleNewConversation] create ok, id=', newConv?.id);
      setConversations((prev) => [
        {
          id: newConv.id,
          created_at: newConv.created_at,
          title: newConv.title,
          message_count: 0,
          chain_id: newConv.chain_id || newConv.id,
          parent_id: newConv.parent_id ?? null,
          round_number: newConv.round_number ?? 1,
        },
        ...prev.filter((c) => c.id !== newConv.id),
      ]);
      
      // Set current conversation ID
      setCurrentConversationId(newConv.id);
      setViewingStep(null); // Reset step view for new conversation
      
      // Use the conversation data directly from the create response
      // This avoids a second API call that might fail
      if (newConv) {
        setCurrentConversation(newConv);
        console.log('[handleNewConversation] setCurrentConversation done');
      } else {
        // Fallback: try to load if the response didn't include full conversation data
        await loadConversation(newConv.id);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert(`Error: ${error.message || 'Failed to create conversation. Please check your backend connection and try again.'}`);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSelectConversation = (id) => {
    if (currentConversation?.id !== id) {
      setCurrentConversation(null); // Clear stale content so we show loading, not previous conversation
    }
    setCurrentConversationId(id);
    setViewingStep(null);
    if (currentConversation?.id !== id) {
      loadConversation(id);
    }
  };

  const handleSelectStep = (convId, step) => {
    if (currentConversation?.id !== convId) {
      setCurrentConversation(null); // Clear stale content when switching conversations
    }
    setCurrentConversationId(convId);
    setViewingStep(step);
    if (!currentConversation || currentConversation.id !== convId) {
      loadConversation(convId);
    }
  };

  const handleStartNewRound = async () => {
    if (!currentConversationId) return;
    try {
      const newConv = await api.createConversation({ parent_id: currentConversationId });
      setConversations((prev) => [
        {
          id: newConv.id,
          created_at: newConv.created_at,
          title: newConv.title,
          message_count: 0,
          chain_id: newConv.chain_id || newConv.id,
          parent_id: newConv.parent_id ?? null,
          round_number: newConv.round_number ?? 1,
        },
        ...prev.filter((c) => c.id !== newConv.id),
      ]);
      setCurrentConversationId(newConv.id);
      setCurrentConversation(newConv);
      setViewingStep(null);
    } catch (error) {
      console.error('Failed to start new round:', error);
      alert(`Error: ${error.message || 'Failed to start new round.'}`);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await api.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      
      // If the deleted conversation was the current one, clear it
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setCurrentConversation(null);
        setViewingStep(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert(`Error: ${error.message || 'Failed to delete conversation. Please try again.'}`);
    }
  };

  // Simple function to determine current stage based on conversation state
  const getCurrentStage = () => {
    if (!currentConversation) return 'preparation';
    const councilDelib = currentConversation.council_deliberation || {};
    const councilMessages = Array.isArray(councilDelib.messages) ? councilDelib.messages : [];
    if (councilMessages.length > 0) return 'council_deliberation';
    return 'preparation';
  };

  const handlePreparationMessage = async (content) => {
    if (!currentConversationId) return;
    setPromptLoading(true);
    try {
      const result = await api.sendPreparationMessage(currentConversationId, content);
      if (result?.conversation) setCurrentConversation(result.conversation);
      else await loadConversation(currentConversationId);
    } catch (error) {
      console.error('Failed to send preparation message:', error);
      alert(`Error: ${error.message || 'Failed to send message.'}`);
    } finally {
      setPromptLoading(false);
    }
  };

  const handleSuggestFinalPrompt = async () => {
    if (!currentConversationId) return null;
    return await api.suggestFinalPrompt(currentConversationId);
  };

  const handleFinalizePrompt = async (finalizedPrompt) => {
    if (!currentConversationId) {
      alert('Error: No conversation ID. Please create a new conversation.');
      return;
    }
    setPromptLoading(true);
    try {
      const result = await api.finalizePrompt(currentConversationId, finalizedPrompt);
      let updatedConversation = result?.conversation;
      if (!updatedConversation) updatedConversation = await api.getConversation(currentConversationId);
      if (!updatedConversation || !updatedConversation.id) {
        throw new Error('Failed to retrieve conversation after finalization');
      }
      const conversationWithDefaults = {
        ...updatedConversation,
        prompt_engineering: {
          messages: Array.isArray(updatedConversation.prompt_engineering?.messages) ? updatedConversation.prompt_engineering.messages : [],
          finalized_prompt: updatedConversation.prompt_engineering?.finalized_prompt || finalizedPrompt
        },
        context_engineering: {
          messages: Array.isArray(updatedConversation.context_engineering?.messages) ? updatedConversation.context_engineering.messages : [],
          documents: Array.isArray(updatedConversation.context_engineering?.documents) ? updatedConversation.context_engineering.documents : [],
          files: Array.isArray(updatedConversation.context_engineering?.files) ? updatedConversation.context_engineering.files : [],
          links: Array.isArray(updatedConversation.context_engineering?.links) ? updatedConversation.context_engineering.links : [],
          finalized_context: updatedConversation.context_engineering?.finalized_context || null
        },
        council_deliberation: {
          messages: Array.isArray(updatedConversation.council_deliberation?.messages) ? updatedConversation.council_deliberation.messages : []
        }
      };
      if (!conversationWithDefaults.prompt_engineering.finalized_prompt) {
        throw new Error('Prompt finalization failed - finalized_prompt is missing');
      }
      setCurrentConversation(conversationWithDefaults);
    } catch (error) {
      console.error('Failed to finalize prompt:', error);
      alert(`Error: ${error.message || 'Failed to finalize prompt. Please try again.'}`);
    } finally {
      setPromptLoading(false);
    }
  };

  const handleAddDocument = async (name, content) => {
    if (!currentConversationId) return;
    try {
      const result = await api.addDocument(currentConversationId, name, content);
      setCurrentConversation(result.conversation);
    } catch (error) {
      console.error('Failed to add document:', error);
      alert(`Error: ${error.message || 'Failed to add document'}`);
    }
  };

  const handleUploadFile = async (file) => {
    if (!currentConversationId) return;
    try {
      const result = await api.uploadFile(currentConversationId, file);
      setCurrentConversation(result.conversation);
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error; // Re-throw so component can handle it
    }
  };

  const handleAddLink = async (url) => {
    if (!currentConversationId) return;
    try {
      const result = await api.addLink(currentConversationId, url);
      setCurrentConversation(result.conversation);
    } catch (error) {
      console.error('Failed to add link:', error);
      throw error; // Re-throw so component can handle it
    }
  };

  const handlePackageContext = async () => {
    if (!currentConversationId) return;
    setContextLoading(true);
    try {
      const result = await api.packageContext(currentConversationId);
      setCurrentConversation(result.conversation);
    } catch (error) {
      console.error('Failed to package context:', error);
      alert(`Error: ${error.message || 'Failed to package context'}`);
    } finally {
      setContextLoading(false);
    }
  };

  const handleSubmitToCouncil = async (promptText) => {
    if (!currentConversationId || !promptText?.trim()) return;
    setPromptLoading(true);
    try {
      const promptEng = currentConversation?.prompt_engineering || {};
      if (!promptEng.finalized_prompt || promptEng.finalized_prompt !== promptText.trim()) {
        await api.finalizePrompt(currentConversationId, promptText.trim());
      }
      await handlePackageContext();
      setPromptLoading(false);
      await handleStartCouncilDeliberation();
    } catch (error) {
      console.error('Submit for Deliberation failed:', error);
      setPromptLoading(false);
      alert(`Error: ${error.message || 'Failed to submit for deliberation.'}`);
    }
  };

  const handleEditPrompt = async (editedPrompt) => {
    if (!currentConversationId) return;
    try {
      const result = await api.finalizePrompt(currentConversationId, editedPrompt);
      setCurrentConversation(result.conversation);
    } catch (error) {
      console.error('Failed to update prompt:', error);
      alert(`Error: ${error.message || 'Failed to update prompt'}`);
    }
  };

  const handleEditContext = async (editedContext) => {
    if (!currentConversationId) return;
    try {
      const result = await api.finalizeContext(currentConversationId, editedContext);
      setCurrentConversation(result.conversation);
    } catch (error) {
      console.error('Failed to update context:', error);
      alert(`Error: ${error.message || 'Failed to update context'}`);
    }
  };

  // Council Deliberation handlers (for additional messages after initial deliberation)
  const handleSendMessage = async (content) => {
    if (!currentConversationId) return;

    setIsLoading(true);
    try {
      // Optimistically add user message to UI
      const userMessage = { role: 'user', content };
      setCurrentConversation((prev) => ({
        ...prev,
        council_deliberation: {
          ...prev.council_deliberation,
          messages: [...(prev.council_deliberation?.messages || []), userMessage],
        },
      }));

      // Create a partial assistant message that will be updated progressively
      const assistantMessage = {
        role: 'assistant',
        stage1: null,
        stage2: null,
        stage3: null,
        metadata: null,
        loading: {
          stage1: false,
          stage2: false,
          stage3: false,
        },
      };

      // Add the partial assistant message
      setCurrentConversation((prev) => ({
        ...prev,
        council_deliberation: {
          ...prev.council_deliberation,
          messages: [...(prev.council_deliberation?.messages || []), assistantMessage],
        },
      }));

      // Send message with streaming
      await api.startCouncilDeliberationStream(currentConversationId, (eventType, event) => {
        switch (eventType) {
          case 'stage1_start':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) lastMsg.loading.stage1 = true;
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'stage1_complete':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) {
                lastMsg.stage1 = event.data;
                lastMsg.loading.stage1 = false;
              }
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'stage2_start':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) lastMsg.loading.stage2 = true;
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'stage2_complete':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) {
                lastMsg.stage2 = event.data;
                lastMsg.metadata = event.metadata;
                lastMsg.loading.stage2 = false;
              }
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'stage3_start':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) {
                lastMsg.loading.stage1 = false;
                lastMsg.loading.stage2 = false;
                lastMsg.loading.stage3 = true;
              }
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'stage3_complete':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) {
                lastMsg.stage3 = event.data;
                lastMsg.loading.stage1 = false;
                lastMsg.loading.stage2 = false;
                lastMsg.loading.stage3 = false;
              }
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'title_complete':
            // Reload conversations to get updated title
            loadConversations();
            break;

          case 'complete':
            // Stream complete, reload conversations list
            loadConversations();
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg?.loading) {
                lastMsg.loading.stage1 = false;
                lastMsg.loading.stage2 = false;
                lastMsg.loading.stage3 = false;
              }
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            setIsLoading(false);
            break;

          case 'error':
            console.error('Stream error:', event.message);
            setIsLoading(false);
            break;

          default:
            console.log('Unknown event type:', eventType);
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic messages on error
      setCurrentConversation((prev) => ({
        ...prev,
        council_deliberation: {
          ...prev.council_deliberation,
          messages: (prev.council_deliberation?.messages || []).slice(0, -2),
        },
      }));
      setIsLoading(false);
    }
  };

  const handleStartCouncilDeliberation = async () => {
    if (!currentConversationId) return;
    setIsLoading(true);

    try {
      // Optimistically add assistant message
      const assistantMessage = {
        role: 'assistant',
        stage1: null,
        stage2: null,
        stage3: null,
        metadata: null,
        loading: {
          stage1: false,
          stage2: false,
          stage3: false,
        },
      };

      setCurrentConversation((prev) => ({
        ...prev,
        council_deliberation: {
          ...prev.council_deliberation,
          messages: [assistantMessage],
        },
      }));

      // Start council deliberation with streaming
      await api.startCouncilDeliberationStream(currentConversationId, (eventType, event) => {
        switch (eventType) {
          case 'stage1_start':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) lastMsg.loading.stage1 = true;
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'stage1_complete':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) {
                lastMsg.stage1 = event.data;
                lastMsg.loading.stage1 = false;
              }
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'stage2_start':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) lastMsg.loading.stage2 = true;
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'stage2_complete':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) {
                lastMsg.stage2 = event.data;
                lastMsg.metadata = event.metadata;
                lastMsg.loading.stage2 = false;
              }
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'stage3_start':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) {
                lastMsg.loading.stage1 = false;
                lastMsg.loading.stage2 = false;
                lastMsg.loading.stage3 = true;
              }
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'stage3_complete':
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) {
                lastMsg.stage3 = event.data;
                lastMsg.loading.stage1 = false;
                lastMsg.loading.stage2 = false;
                lastMsg.loading.stage3 = false;
              }
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            break;

          case 'title_complete':
            loadConversations();
            break;

          case 'complete':
            loadConversations();
            setCurrentConversation((prev) => {
              const messages = [...(prev.council_deliberation?.messages || [])];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg?.loading) {
                lastMsg.loading.stage1 = false;
                lastMsg.loading.stage2 = false;
                lastMsg.loading.stage3 = false;
              }
              return {
                ...prev,
                council_deliberation: {
                  ...prev.council_deliberation,
                  messages,
                },
              };
            });
            setIsLoading(false);
            break;

          case 'error':
            console.error('Stream error:', event.message);
            setIsLoading(false);
            break;

          default:
            console.log('Unknown event type:', eventType);
        }
      });
    } catch (error) {
      console.error('Failed to start council deliberation:', error);
      setIsLoading(false);
    }
  };

  // Render appropriate stage component
  const renderStage = () => {
    try {
      if (!currentConversation) {
        if (currentConversationId) {
          console.log('[renderStage] loading (convId set, no data)');
          return (
            <div className="empty-state loading-conversation">
              <h2>Loading conversation…</h2>
              <p>Please wait while we load your conversation.</p>
              <div className="spinner" style={{ marginTop: 16 }} />
            </div>
          );
        }
        console.log('[renderStage] welcome (no conv)');
        return (
          <div className="empty-state">
            <h2>Welcome to LLM Council</h2>
            <p>Create a new conversation to get started</p>
          </div>
        );
      }

      // Ensure all data structures exist with proper defaults
      const promptEng = currentConversation.prompt_engineering || { messages: [], finalized_prompt: null };
      const contextEng = currentConversation.context_engineering || { messages: [], documents: [], files: [], links: [], finalized_context: null };
      const councilDelib = currentConversation.council_deliberation || { messages: [] };

      const stageToRender = getCurrentStage();
      console.log('[renderStage] stage=', stageToRender, 'convId=', currentConversationId);

    switch (stageToRender) {
      case 'preparation': {
        const priorDeliberationSummary = extractPriorDeliberationSummary(currentConversation);
        return (
          <PreparationStep
            key={currentConversationId}
            conversationId={currentConversationId}
            messages={Array.isArray(promptEng.messages) ? promptEng.messages : []}
            documents={Array.isArray(contextEng.documents) ? contextEng.documents : []}
            files={Array.isArray(contextEng.files) ? contextEng.files : []}
            links={Array.isArray(contextEng.links) ? contextEng.links : []}
            finalizedPrompt={promptEng.finalized_prompt}
            finalizedContext={contextEng.finalized_context}
            priorDeliberationSummary={priorDeliberationSummary}
            onSendMessage={handlePreparationMessage}
            onSuggestFinal={handleSuggestFinalPrompt}
            onFinalizePrompt={handleFinalizePrompt}
            onAddDocument={handleAddDocument}
            onUploadFile={handleUploadFile}
            onAddLink={handleAddLink}
            onPackageContext={handlePackageContext}
            onSubmitToCouncil={handleSubmitToCouncil}
            onReloadConversation={() => loadConversation(currentConversationId)}
            isLoading={promptLoading}
          />
        );
      }

      case 'council_deliberation': {
        // Convert council_deliberation format to format expected by ChatInterface
        const formattedConversation = {
          ...currentConversation,
          messages: councilDelib.messages || [],
        };

        return (
          <ChatInterface
            key={currentConversationId}
            conversation={formattedConversation}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStartNewRound={handleStartNewRound}
          />
        );
      }

      default:
        return (
          <div className="empty-state">
            <h2>Loading...</h2>
            <p>Unexpected stage: {stageToRender}</p>
            <button onClick={() => loadConversation(currentConversationId)} className="reload-button">
              Reload Conversation
            </button>
          </div>
        );
    }
    } catch (error) {
      console.error('Error rendering stage:', error);
      return (
        <div className="empty-state error-state">
          <h2>Something went wrong</h2>
          <p>{error.message || 'An unknown error occurred'}</p>
          <button
            onClick={() => {
              if (currentConversationId) loadConversation(currentConversationId);
              else window.location.reload();
            }}
            className="reload-button"
          >
            Reload
          </button>
        </div>
      );
    }
  };

  let stageContent;
  try {
    stageContent = renderStage();
  } catch (renderError) {
    console.error('Error in renderStage:', renderError);
    stageContent = (
      <div className="empty-state" style={{ color: 'red', padding: '40px' }}>
        <h2>⚠️ Critical Error</h2>
        <p>The application encountered a fatal error while rendering.</p>
        <details style={{ marginTop: '20px', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
          <pre style={{ fontSize: '12px', marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5' }}>
            {renderError.message}
            {'\n\n'}
            {renderError.stack}
          </pre>
        </details>
        <button 
          onClick={() => window.location.reload()}
          style={{ marginTop: '20px', padding: '12px 24px', fontSize: '16px' }}
        >
          Reload Application
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="app">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        currentConversation={currentConversation}
        onSelectConversation={handleSelectConversation}
        onSelectStep={handleSelectStep}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isCreatingConversation={isCreatingConversation}
      />
      <div className="main-content">
        <ErrorBoundary>
          {viewingStep ? (
            <StepView 
              step={viewingStep}
              conversation={currentConversation}
              onBack={() => setViewingStep(null)}
              onStartNewRound={handleStartNewRound}
            />
          ) : (
            stageContent
          )}
        </ErrorBoundary>
      </div>
    </div>
    </ErrorBoundary>
  );
}

export default App;
