import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PromptEngineering from './components/PromptEngineering';
import ContextEngineering from './components/ContextEngineering';
import ReviewStage from './components/ReviewStage';
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
  const [viewingStep, setViewingStep] = useState(null); // 'step1', 'step2', 'step3', or null

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load conversation details when selected
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId);
    }
  }, [currentConversationId]);

  // Debug: Log stage transitions (for troubleshooting) - removed to avoid dependency issues

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
      console.log('Loaded conversation:', conv?.id, 'Prompt finalized:', !!conv?.prompt_engineering?.finalized_prompt);
      setCurrentConversation(conv);
      return conv;
    } catch (error) {
      console.error('Failed to load conversation:', error);
      // Show user-friendly error message
      alert(`Error: ${error.message || 'Failed to load conversation. Please try again.'}`);
      return null;
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await api.createConversation();
      console.log('Created new conversation:', newConv.id);
      
      // Update conversations list
      setConversations([
        { id: newConv.id, created_at: newConv.created_at, message_count: 0 },
        ...conversations,
      ]);
      
      // Set current conversation ID
      setCurrentConversationId(newConv.id);
      setViewingStep(null); // Reset step view for new conversation
      
      // Use the conversation data directly from the create response
      // This avoids a second API call that might fail
      if (newConv) {
        setCurrentConversation(newConv);
      } else {
        // Fallback: try to load if the response didn't include full conversation data
        await loadConversation(newConv.id);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert(`Error: ${error.message || 'Failed to create conversation. Please check your backend connection and try again.'}`);
    }
  };

  const handleSelectConversation = (id) => {
    setCurrentConversationId(id);
    setViewingStep(null); // Reset step view when selecting conversation
  };

  const handleSelectStep = (convId, step) => {
    setCurrentConversationId(convId);
    setViewingStep(step);
    // Load conversation if not already loaded
    if (!currentConversation || currentConversation.id !== convId) {
      loadConversation(convId);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await api.deleteConversation(conversationId);
      
      // Remove from conversations list
      setConversations(conversations.filter(c => c.id !== conversationId));
      
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

  // Determine current stage
  const getCurrentStage = () => {
    if (!currentConversation) {
      return 'prompt_engineering'; // Default to first stage
    }

    const promptEng = currentConversation.prompt_engineering || {};
    const contextEng = currentConversation.context_engineering || {};
    const councilDelib = currentConversation.council_deliberation || {};

    const promptFinalized = promptEng.finalized_prompt;
    const contextFinalized = contextEng.finalized_context;
    const councilMessages = councilDelib.messages || [];

    // Stage determination logic
    if (!promptFinalized) {
      return 'prompt_engineering';
    } else if (!contextFinalized) {
      return 'context_engineering';
    } else if (contextFinalized && councilMessages.length === 0) {
      return 'review';
    } else {
      return 'council_deliberation';
    }
  };

  const currentStage = getCurrentStage();

  // Prompt Engineering handlers
  const handlePromptEngineeringMessage = async (content) => {
    if (!currentConversationId) return;
    setPromptLoading(true);

    try {
      const result = await api.sendPromptEngineeringMessage(currentConversationId, content);
      if (result && result.conversation) {
        setCurrentConversation(result.conversation);
      } else {
        console.error('Unexpected response format:', result);
        // Reload conversation as fallback
        await loadConversation(currentConversationId);
      }
    } catch (error) {
      console.error('Failed to send prompt engineering message:', error);
      alert(`Error: ${error.message || 'Failed to send message. Please check the console for details.'}`);
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
      console.error('No conversation ID available');
      return;
    }
    try {
      console.log('Finalizing prompt...', finalizedPrompt.substring(0, 50));
      const result = await api.finalizePrompt(currentConversationId, finalizedPrompt);
      console.log('Finalize prompt result:', result);
      
      // Update conversation state immediately if we got a response
      if (result && result.conversation) {
        console.log('Updating conversation state from API response');
        console.log('New conversation state:', {
          id: result.conversation.id,
          promptFinalized: !!result.conversation.prompt_engineering?.finalized_prompt,
          contextFinalized: !!result.conversation.context_engineering?.finalized_context
        });
        // Force a state update with a new object reference to ensure React detects the change
        setCurrentConversation({ ...result.conversation });
      } else {
        console.log('No conversation in response, reloading from server');
        // Otherwise reload from server
        await loadConversation(currentConversationId);
      }
    } catch (error) {
      console.error('Failed to finalize prompt:', error);
      alert(`Error: ${error.message || 'Failed to finalize prompt'}`);
    }
  };

  // Context Engineering handlers
  const handleContextEngineeringMessage = async (content) => {
    if (!currentConversationId) return;
    setContextLoading(true);

    try {
      const result = await api.sendContextEngineeringMessage(currentConversationId, content);
      setCurrentConversation(result.conversation);
    } catch (error) {
      console.error('Failed to send context engineering message:', error);
    } finally {
      setContextLoading(false);
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
      // After packaging, we'll automatically show the review stage
    } catch (error) {
      console.error('Failed to package context:', error);
      alert(`Error: ${error.message || 'Failed to package context'}`);
    } finally {
      setContextLoading(false);
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
              if (lastMsg) lastMsg.loading.stage3 = true;
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
              if (lastMsg) lastMsg.loading.stage3 = true;
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
        console.log('No current conversation, showing welcome');
        return (
          <div className="empty-state">
            <h2>Welcome to LLM Council</h2>
            <p>Create a new conversation to get started</p>
          </div>
        );
      }

      const promptEng = currentConversation.prompt_engineering || { messages: [], finalized_prompt: null };
      const contextEng = currentConversation.context_engineering || { messages: [], documents: [], files: [], links: [], finalized_context: null };
      const councilDelib = currentConversation.council_deliberation || { messages: [] };

      // Re-calculate stage based on current conversation state (important for state updates)
      let stageToRender;
      try {
        stageToRender = getCurrentStage() || 'prompt_engineering';
      } catch (error) {
        console.error('Error in getCurrentStage:', error);
        stageToRender = 'prompt_engineering';
      }
      
      console.log('Rendering stage:', stageToRender, {
        promptFinalized: !!promptEng.finalized_prompt,
        contextFinalized: !!contextEng.finalized_context,
        councilMessages: councilDelib.messages?.length || 0,
        conversationId: currentConversation.id
      });

    switch (stageToRender) {
      case 'prompt_engineering':
        return (
          <PromptEngineering
            conversationId={currentConversationId}
            messages={promptEng.messages || []}
            finalizedPrompt={promptEng.finalized_prompt}
            onSendMessage={handlePromptEngineeringMessage}
            onSuggestFinal={handleSuggestFinalPrompt}
            onFinalizePrompt={handleFinalizePrompt}
            isLoading={promptLoading}
          />
        );

      case 'context_engineering':
        return (
          <ContextEngineering
            conversationId={currentConversationId}
            messages={contextEng.messages || []}
            documents={contextEng.documents || []}
            files={contextEng.files || []}
            links={contextEng.links || []}
            finalizedContext={contextEng.finalized_context}
            onSendMessage={handleContextEngineeringMessage}
            onAddDocument={handleAddDocument}
            onUploadFile={handleUploadFile}
            onAddLink={handleAddLink}
            onPackageContext={handlePackageContext}
            isLoading={contextLoading}
          />
        );

      case 'review':
        // Ensure we have the required data
        if (!promptEng.finalized_prompt || !contextEng.finalized_context) {
          return (
            <div className="empty-state">
              <h2>Loading Review...</h2>
              <p>Preparing the review stage...</p>
            </div>
          );
        }
        return (
          <ReviewStage
            finalizedPrompt={promptEng.finalized_prompt}
            documents={contextEng.documents || []}
            files={contextEng.files || []}
            links={contextEng.links || []}
            packagedContext={contextEng.finalized_context}
            onEditPrompt={handleEditPrompt}
            onEditContext={handleEditContext}
            onProceedToCouncil={handleStartCouncilDeliberation}
            isProceeding={isLoading}
          />
        );

      case 'council_deliberation':
        // Convert council_deliberation format to format expected by ChatInterface
        const formattedConversation = {
          ...currentConversation,
          messages: councilDelib.messages || [],
        };

        // Show start button if no messages yet
        if (councilDelib.messages.length === 0) {
          return (
            <div className="empty-state" style={{ padding: '40px' }}>
              <h2>Step 3: Council Deliberation</h2>
              <p>Ready to start the council deliberation with your finalized prompt and context.</p>
              <button
                onClick={handleStartCouncilDeliberation}
                disabled={isLoading}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? 'Starting...' : 'Start Council Deliberation'}
              </button>
            </div>
          );
        }

        return (
          <ChatInterface
            conversation={formattedConversation}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        );

      default:
        // Fallback for any unexpected stage value
        console.warn('Unknown stage:', stageToRender, 'Current conversation:', currentConversation);
        // Try to determine what stage we should be in
        if (promptEng.finalized_prompt && !contextEng.finalized_context) {
          // Should be in context_engineering
          return (
            <ContextEngineering
              conversationId={currentConversationId}
              messages={contextEng.messages || []}
              documents={contextEng.documents || []}
              files={contextEng.files || []}
              links={contextEng.links || []}
              finalizedContext={contextEng.finalized_context}
              onSendMessage={handleContextEngineeringMessage}
              onAddDocument={handleAddDocument}
              onUploadFile={handleUploadFile}
              onAddLink={handleAddLink}
              onPackageContext={handlePackageContext}
              isLoading={contextLoading}
            />
          );
        }
        return (
          <div className="empty-state">
            <h2>Loading...</h2>
            <p>Preparing the next stage... (Stage: {stageToRender})</p>
            <button onClick={() => loadConversation(currentConversationId)}>Reload Conversation</button>
          </div>
        );
    }
    } catch (error) {
      console.error('Error in renderStage:', error);
      return (
        <div className="empty-state" style={{ color: 'red', padding: '40px' }}>
          <h2>Error Rendering Stage</h2>
          <p>{error.message || 'An error occurred while rendering the stage'}</p>
          <button 
            onClick={() => {
              if (currentConversationId) {
                loadConversation(currentConversationId);
              }
            }}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Conversation
          </button>
        </div>
      );
    }
  };

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        currentConversation={currentConversation}
        onSelectConversation={handleSelectConversation}
        onSelectStep={handleSelectStep}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      <div className="main-content">
        {viewingStep ? (
          <StepView 
            step={viewingStep}
            conversation={currentConversation}
            onBack={() => setViewingStep(null)}
          />
        ) : (
          renderStage()
        )}
      </div>
    </div>
  );
}

export default App;
