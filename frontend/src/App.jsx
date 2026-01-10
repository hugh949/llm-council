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
      console.log('Loading conversation:', id);
      const conv = await api.getConversation(id);
      console.log('Loaded conversation:', conv?.id, 'Prompt finalized:', !!conv?.prompt_engineering?.finalized_prompt);
      
      // Only update state if we got valid conversation data
      // This prevents blank screens from invalid data
      if (conv && conv.id) {
        // Preserve existing conversation if reload fails to prevent blank screen
        const previousConv = currentConversation;
        try {
          setCurrentConversation(conv);
          console.log('Conversation state updated successfully');
          return conv;
        } catch (setError) {
          console.error('Error updating conversation state:', setError);
          // If state update fails, keep previous conversation to prevent blank screen
          if (previousConv) {
            console.log('Keeping previous conversation state to prevent blank screen');
            setCurrentConversation(previousConv);
          }
          return previousConv || conv;
        }
      } else {
        console.error('Invalid conversation data received:', conv);
        // Keep existing conversation if we have one to prevent blank screen
        if (currentConversation && currentConversation.id === id) {
          console.log('Invalid data but keeping existing conversation to prevent blank screen');
          return currentConversation;
        }
        throw new Error('Invalid conversation data received from server');
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      // Don't clear current conversation on error - keep existing state to prevent blank screen
      // Only show error if we don't have a current conversation
      if (!currentConversation) {
        alert(`Error: ${error.message || 'Failed to load conversation. Please try again.'}`);
      } else {
        console.log('Error loading conversation, but keeping existing state to prevent blank screen');
      }
      return currentConversation || null;
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

  // Sync currentStep with conversation state when conversation changes
  // BUT: Respect stepLocked flag to prevent overriding explicit step sets
  useEffect(() => {
    // If step is explicitly locked (e.g., during transition), don't auto-sync
    if (stepLocked) {
      console.log('🔒 Step is locked - skipping auto-sync');
      return;
    }

    if (!currentConversation) {
      setCurrentStep(prev => {
        if (prev !== null && !stepLocked) {
          return null;
        }
        return prev;
      });
      return;
    }

    const promptEng = currentConversation.prompt_engineering || {};
    const contextEng = currentConversation.context_engineering || {};
    const councilDelib = currentConversation.council_deliberation || {};

    const promptFinalized = !!promptEng.finalized_prompt;
    const contextFinalized = !!contextEng.finalized_context;
    const councilMessages = Array.isArray(councilDelib.messages) ? councilDelib.messages : [];
    
    let calculatedStep;
    if (!promptFinalized) {
      calculatedStep = 'prompt_engineering';
    } else if (!contextFinalized) {
      calculatedStep = 'context_engineering';
    } else if (contextFinalized && councilMessages.length === 0) {
      calculatedStep = 'review';
    } else {
      calculatedStep = 'council_deliberation';
    }

    // Only update if different and not locked
    setCurrentStep(prevStep => {
      if (stepLocked) {
        console.log('🔒 Step locked - keeping current step:', prevStep);
        return prevStep;
      }
      if (prevStep !== calculatedStep) {
        console.log('🔄 Auto-syncing currentStep:', {
          from: prevStep,
          to: calculatedStep,
          conversationId: currentConversation.id,
          promptFinalized,
          contextFinalized,
          stepLocked
        });
        return calculatedStep;
      }
      return prevStep;
    });
  }, [currentConversation, stepLocked]); // Include stepLocked in dependencies

  // Get the current stage - use explicit currentStep state
  const getCurrentStage = () => {
    // If we have an explicit step set, use it (takes precedence)
    if (currentStep) {
      return currentStep;
    }
    
    // Fallback: calculate from conversation
    if (!currentConversation) {
      return 'prompt_engineering';
    }

    const promptEng = currentConversation.prompt_engineering || {};
    const contextEng = currentConversation.context_engineering || {};
    const councilDelib = currentConversation.council_deliberation || {};

    const promptFinalized = !!promptEng.finalized_prompt;
    const contextFinalized = !!contextEng.finalized_context;
    const councilMessages = Array.isArray(councilDelib.messages) ? councilDelib.messages : [];
    
    if (!promptFinalized) {
      return 'prompt_engineering';
    }
    
    if (!contextFinalized) {
      return 'context_engineering';
    }
    
    if (contextFinalized && councilMessages.length === 0) {
      return 'review';
    }
    
    return 'council_deliberation';
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

  const handleProceedToStep2 = async () => {
    if (!currentConversationId) {
      console.error('No conversation ID available');
      return;
    }
    
    setContextLoading(true);
    
    try {
      console.log('Proceeding to Step 2: Context Engineering...');
      console.log('Current conversation before proceeding:', {
        id: currentConversation?.id,
        promptFinalized: !!currentConversation?.prompt_engineering?.finalized_prompt,
        contextMessages: currentConversation?.context_engineering?.messages?.length || 0
      });
      
      // Send an initialization message to context engineering
      // This marks context engineering as started and transitions to Step 2
      const welcomeMessage = "Ready to add context and attachments.";
      
      // Use the API directly to avoid double state updates from handleContextEngineeringMessage
      const result = await api.sendContextEngineeringMessage(currentConversationId, welcomeMessage);
      
      console.log('API response received:', {
        hasResult: !!result,
        hasConversation: !!result?.conversation,
        conversationId: result?.conversation?.id,
        contextMessages: result?.conversation?.context_engineering?.messages?.length || 0,
        contextMessagesData: result?.conversation?.context_engineering?.messages
      });
      
      if (result && result.conversation && result.conversation.id) {
        // Update state immediately with API response to ensure transition happens right away
        // The API response should contain the new message in context_engineering
        const apiConv = result.conversation;
        
        console.log('API response conversation structure:', {
          id: apiConv.id,
          hasPromptEng: !!apiConv.prompt_engineering,
          hasContextEng: !!apiConv.context_engineering,
          contextMessages: apiConv.context_engineering?.messages?.length || 0,
          contextMessagesData: apiConv.context_engineering?.messages,
          promptFinalized: !!apiConv.prompt_engineering?.finalized_prompt
        });
        
        // Ensure complete data structure to prevent blank screens
        const updatedConv = {
          ...apiConv,
          prompt_engineering: apiConv.prompt_engineering || currentConversation?.prompt_engineering || { messages: [], finalized_prompt: null },
          context_engineering: {
            ...(apiConv.context_engineering || {}),
            messages: Array.isArray(apiConv.context_engineering?.messages) ? apiConv.context_engineering.messages : [],
            documents: Array.isArray(apiConv.context_engineering?.documents) ? apiConv.context_engineering.documents : [],
            files: Array.isArray(apiConv.context_engineering?.files) ? apiConv.context_engineering.files : [],
            links: Array.isArray(apiConv.context_engineering?.links) ? apiConv.context_engineering.links : [],
            finalized_context: apiConv.context_engineering?.finalized_context || null
          },
          council_deliberation: apiConv.council_deliberation || currentConversation?.council_deliberation || { messages: [] }
        };
        
        console.log('Updating state with conversation:', {
          id: updatedConv.id,
          contextMessages: updatedConv.context_engineering.messages.length,
          promptFinalized: !!updatedConv.prompt_engineering.finalized_prompt,
          contextStarted: updatedConv.context_engineering.messages.length > 0
        });
        
        // Update state immediately - this should trigger re-render and show Step 2
        setCurrentConversation(updatedConv);
        
        // Also reload from server after a short delay to ensure we have the latest state
        // But don't wait for it - let the immediate state update handle the UI transition
        setTimeout(async () => {
          console.log('Reloading conversation to ensure complete state...');
          try {
            await loadConversation(currentConversationId);
          } catch (reloadError) {
            console.error('Error reloading conversation (non-critical):', reloadError);
            // Non-critical - state was already updated from API response
          }
        }, 500);
      } else {
        console.warn('No valid conversation in result, reloading...');
        await loadConversation(currentConversationId);
      }
    } catch (error) {
      console.error('Failed to proceed to Step 2:', error);
      alert(`Error: ${error.message || 'Failed to proceed to Step 2. Please try again.'}`);
      // Reload conversation to ensure state is consistent
      await loadConversation(currentConversationId);
    } finally {
      setContextLoading(false);
    }
  };

  const handleFinalizePrompt = async (finalizedPrompt) => {
    if (!currentConversationId) {
      console.error('No conversation ID available');
      return;
    }
    
    setPromptLoading(true);
    
    try {
      // Finalize the prompt via API
      const result = await api.finalizePrompt(currentConversationId, finalizedPrompt);
      
      // Get the updated conversation from API response
      let updatedConversation = result?.conversation;
      if (!updatedConversation) {
        // Fallback: fetch conversation directly
        updatedConversation = await api.getConversation(currentConversationId);
      }
      
      if (!updatedConversation || !updatedConversation.id) {
        throw new Error('Failed to retrieve conversation after finalization');
      }
      
      // Ensure proper structure exists
      const conversationWithDefaults = {
        ...updatedConversation,
        prompt_engineering: {
          messages: updatedConversation.prompt_engineering?.messages || [],
          finalized_prompt: updatedConversation.prompt_engineering?.finalized_prompt || finalizedPrompt
        },
        context_engineering: {
          messages: updatedConversation.context_engineering?.messages || [],
          documents: updatedConversation.context_engineering?.documents || [],
          files: updatedConversation.context_engineering?.files || [],
          links: updatedConversation.context_engineering?.links || [],
          finalized_context: updatedConversation.context_engineering?.finalized_context || null
        },
        council_deliberation: {
          messages: updatedConversation.council_deliberation?.messages || []
        }
      };
      
      // Verify prompt was finalized
      if (!conversationWithDefaults.prompt_engineering.finalized_prompt) {
        throw new Error('Prompt finalization failed - finalized_prompt is missing');
      }
      
      // Update conversation state - React will re-render and getCurrentStage() will return 'context_engineering'
      setCurrentConversation(conversationWithDefaults);
      setPromptLoading(false);
      
      console.log('Prompt finalized successfully. Conversation state updated. React will re-render.');
      
    } catch (error) {
      console.error('Failed to finalize prompt:', error);
      setPromptLoading(false);
      alert(`Error: ${error.message || 'Failed to finalize prompt. Please try again.'}`);
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

  // Helper function to render ContextEngineering - extracted for reuse
  const renderContextEngineering = () => {
    if (!currentConversationId || !currentConversation) {
      return (
        <div className="empty-state">
          <h2>Loading Context Engineering...</h2>
          <p>Preparing Step 2...</p>
          <button onClick={() => loadConversation(currentConversationId)}>Reload</button>
        </div>
      );
    }

    const promptEng = currentConversation.prompt_engineering || { messages: [], finalized_prompt: null };
    const contextEng = currentConversation.context_engineering || { messages: [], documents: [], files: [], links: [], finalized_context: null };
    
    const safeContextEng = {
      messages: Array.isArray(contextEng.messages) ? contextEng.messages : [],
      documents: Array.isArray(contextEng.documents) ? contextEng.documents : [],
      files: Array.isArray(contextEng.files) ? contextEng.files : [],
      links: Array.isArray(contextEng.links) ? contextEng.links : [],
      finalized_context: contextEng.finalized_context || null
    };
    
    const finalizedPrompt = promptEng.finalized_prompt || null;
    
    return (
      <ContextEngineering
        conversationId={currentConversationId}
        finalizedPrompt={finalizedPrompt}
        messages={safeContextEng.messages}
        documents={safeContextEng.documents}
        files={safeContextEng.files}
        links={safeContextEng.links}
        finalizedContext={safeContextEng.finalized_context}
        onSendMessage={handleContextEngineeringMessage}
        onAddDocument={handleAddDocument}
        onUploadFile={handleUploadFile}
        onAddLink={handleAddLink}
        onPackageContext={handlePackageContext}
        onEditPrompt={handleEditPrompt}
        onReloadConversation={() => loadConversation(currentConversationId)}
        isLoading={contextLoading}
      />
    );
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

      // Ensure all data structures exist with proper defaults
      const promptEng = currentConversation.prompt_engineering || { messages: [], finalized_prompt: null };
      const contextEng = currentConversation.context_engineering || { messages: [], documents: [], files: [], links: [], finalized_context: null };
      const councilDelib = currentConversation.council_deliberation || { messages: [] };

      // Ensure context_engineering structure is always valid (even if empty)
      if (!currentConversation.context_engineering) {
        currentConversation.context_engineering = { messages: [], documents: [], files: [], links: [], finalized_context: null };
      }

      // Simple logic: determine stage based on conversation state
      const stageToRender = getCurrentStage();
      
      console.log('Rendering stage:', stageToRender, {
        promptFinalized: !!promptEng.finalized_prompt,
        contextFinalized: !!contextEng.finalized_context,
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
            onReloadConversation={() => loadConversation(currentConversationId)}
            onProceedToStep2={handleProceedToStep2}
            isLoading={promptLoading}
          />
        );

      case 'context_engineering':
        // Use the helper function for consistent rendering
        return renderContextEngineering();

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
        console.warn('⚠️ Unknown stage:', stageToRender, 'Current conversation:', {
          id: currentConversation?.id,
          promptFinalized: !!promptEng.finalized_prompt,
          contextFinalized: !!contextEng.finalized_context
        });
        
        // DEFENSIVE: If prompt is finalized, always show Step 2
        if (promptEng.finalized_prompt && !contextEng.finalized_context) {
          console.log('🔧 Fallback: Showing context_engineering because prompt is finalized');
          const finalizedPrompt = promptEng.finalized_prompt || null;
          return (
            <ContextEngineering
              conversationId={currentConversationId}
              finalizedPrompt={finalizedPrompt}
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
              onEditPrompt={handleEditPrompt}
              onReloadConversation={() => loadConversation(currentConversationId)}
              isLoading={contextLoading}
            />
          );
        }
        
        return (
          <div className="empty-state">
            <h2>Loading...</h2>
            <p>Preparing the next stage... (Stage: {stageToRender})</p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Conversation ID: {currentConversation?.id}<br/>
              Prompt Finalized: {promptEng.finalized_prompt ? 'Yes' : 'No'}<br/>
              Context Finalized: {contextEng.finalized_context ? 'Yes' : 'No'}
            </p>
            <button onClick={() => loadConversation(currentConversationId)} style={{ marginTop: '12px' }}>
              Reload Conversation
            </button>
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
