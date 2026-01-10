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
  const [currentStep, setCurrentStep] = useState(null); // Explicitly track current step: 'prompt_engineering', 'context_engineering', 'review', 'council_deliberation'

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

  // Debug: Log whenever conversation state changes to track transitions
  useEffect(() => {
    if (currentConversation) {
      const promptFinalized = !!currentConversation.prompt_engineering?.finalized_prompt;
      const contextFinalized = !!currentConversation.context_engineering?.finalized_context;
      
      console.log('🔄 Conversation state changed (useEffect triggered):', {
        id: currentConversation.id,
        promptFinalized,
        contextFinalized,
        hasContextEng: !!currentConversation.context_engineering,
        expectedStage: promptFinalized && !contextFinalized ? 'context_engineering (Step 2)' : 
                       promptFinalized && contextFinalized ? 'review or council_deliberation' : 
                       'prompt_engineering (Step 1)'
      });
    }
  }, [currentConversation]);

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
  // IMPORTANT: Only depend on currentConversation to avoid infinite loops
  useEffect(() => {
    if (!currentConversation) {
      if (currentStep !== null) {
        setCurrentStep(null);
      }
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

    // Only update if different to avoid unnecessary re-renders
    // Use a ref check to compare without causing dependency issues
    setCurrentStep(prevStep => {
      if (prevStep !== calculatedStep) {
        console.log('🔄 Auto-syncing currentStep:', {
          from: prevStep,
          to: calculatedStep,
          conversationId: currentConversation.id,
          promptFinalized,
          contextFinalized
        });
        return calculatedStep;
      }
      return prevStep;
    });
  }, [currentConversation]); // Only depend on currentConversation - use functional update to avoid currentStep dependency

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
      console.log('📝 Finalizing prompt...', finalizedPrompt.substring(0, 50));
      
      // Step 1: Finalize the prompt via API - this returns { conversation: {...} }
      const result = await api.finalizePrompt(currentConversationId, finalizedPrompt);
      console.log('✅ Finalize prompt API response received:', {
        hasResult: !!result,
        hasConversation: !!result?.conversation,
        conversationId: result?.conversation?.id,
        promptFinalized: !!result?.conversation?.prompt_engineering?.finalized_prompt
      });
      
      // The API returns { conversation: {...} } - use it directly
      // DO NOT call loadConversation here as it updates state, which would conflict
      let apiConversation = result?.conversation;
      
      // Fallback: If API response doesn't have conversation, fetch it directly (without updating state)
      if (!apiConversation || !apiConversation.id) {
        console.warn('⚠️ API response missing conversation, fetching directly (no state update)...');
        // Use api.getConversation directly - it doesn't update state, just returns data
        const directFetch = await api.getConversation(currentConversationId);
        
        if (!directFetch || !directFetch.id) {
          console.error('❌ Failed to get conversation after finalization');
          throw new Error('Failed to finalize prompt - could not retrieve conversation');
        }
        apiConversation = directFetch;
      }
      
      // Step 2: Ensure complete, valid conversation structure
      // This is CRITICAL - we need to guarantee the structure exists
      const finalConversation = {
        id: apiConversation.id,
        created_at: apiConversation.created_at || new Date().toISOString(),
        title: apiConversation.title || 'New Conversation',
        prompt_engineering: {
          messages: Array.isArray(apiConversation.prompt_engineering?.messages) 
            ? apiConversation.prompt_engineering.messages 
            : [],
          finalized_prompt: apiConversation.prompt_engineering?.finalized_prompt || finalizedPrompt
        },
        context_engineering: {
          messages: Array.isArray(apiConversation.context_engineering?.messages) 
            ? apiConversation.context_engineering.messages 
            : [],
          documents: Array.isArray(apiConversation.context_engineering?.documents) 
            ? apiConversation.context_engineering.documents 
            : [],
          files: Array.isArray(apiConversation.context_engineering?.files) 
            ? apiConversation.context_engineering.files 
            : [],
          links: Array.isArray(apiConversation.context_engineering?.links) 
            ? apiConversation.context_engineering.links 
            : [],
          finalized_context: apiConversation.context_engineering?.finalized_context || null
        },
        council_deliberation: {
          messages: Array.isArray(apiConversation.council_deliberation?.messages) 
            ? apiConversation.council_deliberation.messages 
            : []
        }
      };
      
      // Step 3: Verify the prompt is finalized
      const isPromptFinalized = !!finalConversation.prompt_engineering.finalized_prompt;
      
      console.log('🔍 Verification before state update:', {
        conversationId: finalConversation.id,
        promptFinalized: isPromptFinalized,
        finalizedPromptLength: finalConversation.prompt_engineering.finalized_prompt?.length || 0,
        hasContextEng: !!finalConversation.context_engineering,
        contextEngStructure: {
          messages: finalConversation.context_engineering.messages.length,
          documents: finalConversation.context_engineering.documents.length,
          files: finalConversation.context_engineering.files.length,
          links: finalConversation.context_engineering.links.length
        }
      });
      
      if (!isPromptFinalized) {
        console.error('❌ ERROR: Prompt finalization failed - finalized_prompt is missing!');
        alert('Error: Prompt finalization failed. The prompt was not saved properly.');
        return;
      }
      
      // Step 4: Update state with the finalized conversation
      // CRITICAL: Create completely new object references for all nested objects
      // This ensures React's Object.is() comparison detects the change
      const newConversationObject = {
        id: String(finalConversation.id), // Ensure string type
        created_at: finalConversation.created_at || new Date().toISOString(),
        title: String(finalConversation.title || 'New Conversation'),
        prompt_engineering: {
          messages: Array.isArray(finalConversation.prompt_engineering.messages) 
            ? [...finalConversation.prompt_engineering.messages] 
            : [],
          finalized_prompt: String(finalConversation.prompt_engineering.finalized_prompt || '')
        },
          context_engineering: {
          messages: Array.isArray(finalConversation.context_engineering.messages) 
            ? [...finalConversation.context_engineering.messages] 
            : [],
          documents: Array.isArray(finalConversation.context_engineering.documents) 
            ? [...finalConversation.context_engineering.documents] 
            : [],
          files: Array.isArray(finalConversation.context_engineering.files) 
            ? [...finalConversation.context_engineering.files] 
            : [],
          links: Array.isArray(finalConversation.context_engineering.links) 
            ? [...finalConversation.context_engineering.links] 
            : [],
          finalized_context: finalConversation.context_engineering.finalized_context || null
        },
        council_deliberation: {
          messages: Array.isArray(finalConversation.council_deliberation.messages) 
            ? [...finalConversation.council_deliberation.messages] 
            : []
        }
      };
      
      // Verify before state update
      const verifyFinalized = !!newConversationObject.prompt_engineering.finalized_prompt;
      console.log('🔄 Preparing state update:', {
        conversationId: newConversationObject.id,
        promptFinalized: verifyFinalized,
        finalizedPromptLength: newConversationObject.prompt_engineering.finalized_prompt.length,
        hasContextEng: !!newConversationObject.context_engineering,
        allStructuresValid: true
      });
      
      if (!verifyFinalized) {
        throw new Error('Prompt finalization verification failed - finalized_prompt is empty');
      }
      
      // CRITICAL: Update conversation state FIRST, then set step
      // This ensures useEffect sees the finalized prompt and won't override our explicit step
      console.log('🔄 Updating conversation state first...');
      setCurrentConversation(newConversationObject);
      
      // THEN explicitly set step - this will trigger immediate re-render with Step 2
      // The useEffect will see conversation is updated and won't override since calculated step matches
      console.log('🎯 EXPLICITLY setting currentStep to "context_engineering"');
      setCurrentStep('context_engineering');
      
      // Clear loading state
      setPromptLoading(false);
      
      console.log('✅ Transition initiated!');
      console.log('✅ Conversation state updated with finalized prompt');
      console.log('✅ currentStep explicitly set to "context_engineering"');
      console.log('✅ React will re-render NOW - Step 2 (ContextEngineering) should appear!');
      
    } catch (error) {
      console.error('❌ Failed to finalize prompt:', error);
      setPromptLoading(false);
      alert(`Error: ${error.message || 'Failed to finalize prompt. Please try again.'}`);
      // Don't throw - let user try again
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

      // Ensure all data structures exist with proper defaults
      const promptEng = currentConversation.prompt_engineering || { messages: [], finalized_prompt: null };
      const contextEng = currentConversation.context_engineering || { messages: [], documents: [], files: [], links: [], finalized_context: null };
      const councilDelib = currentConversation.council_deliberation || { messages: [] };

      // Ensure context_engineering structure is always valid (even if empty)
      if (!currentConversation.context_engineering) {
        // If context_engineering doesn't exist yet, ensure it's initialized as empty object
        currentConversation.context_engineering = { messages: [], documents: [], files: [], links: [], finalized_context: null };
      }

      // Re-calculate stage based on current conversation state (important for state updates)
      let stageToRender;
      try {
        stageToRender = getCurrentStage() || 'prompt_engineering';
      } catch (error) {
        console.error('Error in getCurrentStage:', error);
        // Fallback: determine stage directly based on conversation state
        if (promptEng.finalized_prompt && !contextEng.finalized_context) {
          stageToRender = 'context_engineering';
        } else if (!promptEng.finalized_prompt) {
        stageToRender = 'prompt_engineering';
        } else {
          stageToRender = 'prompt_engineering'; // Safe default
        }
      }
      
      // DEFENSIVE CHECK: If prompt is finalized but we're still showing prompt_engineering,
      // force switch to context_engineering (this should never happen, but just in case)
      if (stageToRender === 'prompt_engineering' && promptEng.finalized_prompt && !contextEng.finalized_context) {
        console.warn('⚠️ WARNING: Prompt is finalized but stage is still prompt_engineering. Forcing switch to context_engineering.');
        stageToRender = 'context_engineering';
      }
      
      console.log('Rendering stage:', stageToRender, {
        promptFinalized: !!promptEng.finalized_prompt,
        contextFinalized: !!contextEng.finalized_context,
        contextEngExists: !!currentConversation.context_engineering,
        contextMessages: Array.isArray(contextEng.messages) ? contextEng.messages.length : 0,
        councilMessages: councilDelib.messages?.length || 0,
        conversationId: currentConversation.id,
        stageDeterminedBy: 'getCurrentStage()'
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
        // Ensure all props are valid before rendering
        if (!currentConversationId || !currentConversation) {
          console.error('Invalid conversation state for context_engineering stage:', {
            hasConversationId: !!currentConversationId,
            hasConversation: !!currentConversation,
            conversationId: currentConversationId
          });
          return (
            <div className="empty-state">
              <h2>Loading Context Engineering...</h2>
              <p>Preparing Step 2...</p>
              <button onClick={() => loadConversation(currentConversationId)}>Reload</button>
            </div>
          );
        }
        
        // Validate context engineering data structure and ensure it exists
        const safeContextEng = {
          messages: Array.isArray(contextEng.messages) ? contextEng.messages : [],
          documents: Array.isArray(contextEng.documents) ? contextEng.documents : [],
          files: Array.isArray(contextEng.files) ? contextEng.files : [],
          links: Array.isArray(contextEng.links) ? contextEng.links : [],
          finalized_context: contextEng.finalized_context || null
        };
        
        console.log('Rendering ContextEngineering with props:', {
          conversationId: currentConversationId,
          messagesCount: safeContextEng.messages.length,
          documentsCount: safeContextEng.documents.length,
          filesCount: safeContextEng.files.length,
          linksCount: safeContextEng.links.length,
          finalizedContext: !!safeContextEng.finalized_context,
          isLoading: contextLoading,
          hasConversation: !!currentConversation,
          conversationIdMatch: currentConversation?.id === currentConversationId
        });
        
        // If we're loading, show a loading state instead of blank screen
        if (contextLoading && safeContextEng.messages.length === 0) {
          return (
            <div className="empty-state" style={{ padding: '40px' }}>
              <h2>Loading Step 2: Context Engineering...</h2>
              <p>Initializing context engineering...</p>
              <div className="spinner" style={{ margin: '20px auto', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #4a90e2', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          );
        }
        
        try {
          // Get finalized prompt from Step 1 to display in Step 2
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
        } catch (renderError) {
          console.error('Error rendering ContextEngineering component:', renderError);
          console.error('Render error stack:', renderError.stack);
          return (
            <div className="empty-state" style={{ color: 'red', padding: '40px' }}>
              <h2>Error Loading Step 2</h2>
              <p>{renderError.message || 'An error occurred while loading Context Engineering'}</p>
              <pre style={{ fontSize: '12px', marginTop: '10px', textAlign: 'left' }}>{renderError.stack}</pre>
              <button onClick={() => loadConversation(currentConversationId)} style={{ marginTop: '20px', padding: '10px 20px' }}>Reload Conversation</button>
            </div>
          );
        }

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
