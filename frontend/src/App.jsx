import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PromptEngineering from './components/PromptEngineering';
import ContextEngineering from './components/ContextEngineering';
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
  const [viewingStep, setViewingStep] = useState(null); // 'step1', 'step2', 'step3', or null

  // Define functions FIRST before useEffects that use them
  const loadConversations = async () => {
    try {
      console.log('🔄 loadConversations: Loading conversations list...');
      const convs = await api.listConversations();
      console.log('✅ loadConversations: Loaded', convs.length, 'conversations');
      setConversations(convs);
    } catch (error) {
      console.error('❌ loadConversations: Failed to load conversations:', error);
    }
  };

  const loadConversation = async (id) => {
    try {
      console.log('🔄 loadConversation: Loading conversation:', id);
      const conv = await api.getConversation(id);
      console.log('✅ loadConversation: Loaded conversation:', {
        id: conv?.id,
        promptFinalized: !!conv?.prompt_engineering?.finalized_prompt
      });
      
      // Only update state if we got valid conversation data
      if (conv && conv.id) {
        const previousConv = currentConversation;
        try {
          setCurrentConversation(conv);
          console.log('✅ loadConversation: State updated successfully');
          return conv;
        } catch (setError) {
          console.error('❌ loadConversation: Error updating state:', setError);
          if (previousConv) {
            console.log('⚠️ loadConversation: Keeping previous conversation state');
            setCurrentConversation(previousConv);
          }
          return previousConv || conv;
        }
      } else {
        console.error('❌ loadConversation: Invalid conversation data received:', conv);
        if (currentConversation && currentConversation.id === id) {
          console.log('⚠️ loadConversation: Keeping existing conversation');
          return currentConversation;
        }
        throw new Error('Invalid conversation data received from server');
      }
    } catch (error) {
      console.error('❌ loadConversation: Failed:', error);
      if (!currentConversation) {
        alert(`Error: ${error.message || 'Failed to load conversation. Please try again.'}`);
      }
      return currentConversation || null;
    }
  };

  // Load conversations on mount
  useEffect(() => {
    console.log('🔄 useEffect: Component mounted, loading conversations...');
    loadConversations();
  }, []);

  // Load conversation details when selected
  useEffect(() => {
    if (currentConversationId) {
      console.log('🔄 useEffect: currentConversationId changed, loading conversation:', currentConversationId);
      loadConversation(currentConversationId);
    }
  }, [currentConversationId]);

  // CRITICAL: Log whenever currentConversation state changes
  useEffect(() => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔄 useEffect: currentConversation state changed');
    if (currentConversation) {
      const promptEng = currentConversation.prompt_engineering || {};
      const contextEng = currentConversation.context_engineering || {};
      const promptFinalized = !!promptEng.finalized_prompt;
      const contextFinalized = !!contextEng.finalized_context;
      
      console.log('   Conversation ID:', currentConversation.id);
      console.log('   Prompt finalized:', promptFinalized);
      console.log('   Finalized prompt length:', promptEng.finalized_prompt?.length || 0);
      console.log('   Finalized prompt preview:', promptEng.finalized_prompt?.substring(0, 100) || 'NONE');
      console.log('   Context finalized:', contextFinalized);
      console.log('   Context finalized value:', contextEng.finalized_context);
      
      // Calculate what stage should be shown
      let expectedStage;
      if (!promptFinalized) {
        expectedStage = 'prompt_engineering';
      } else if (!contextFinalized) {
        expectedStage = 'context_engineering';
      } else {
        expectedStage = 'review or council_deliberation';
      }
      console.log('   Expected stage:', expectedStage);
      console.log('   React will now re-render and call renderStage()');
    } else {
      console.log('   No conversation (null)');
    }
    console.log('═══════════════════════════════════════════════════════════');
  }, [currentConversation]);

  const handleNewConversation = async () => {
    try {
      const newConv = await api.createConversation();
      console.log('Created new conversation:', newConv.id);
      
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
    setViewingStep(null);
  };

  const handleSelectStep = (convId, step) => {
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
    if (!currentConversation) {
      return 'prompt_engineering';
    }

    console.log('🔍 getCurrentStage: Conversation exists:', {
      id: currentConversation.id,
      hasPromptEng: !!currentConversation.prompt_engineering,
      hasContextEng: !!currentConversation.context_engineering,
      hasCouncilDelib: !!currentConversation.council_deliberation
    });

    const promptEng = currentConversation.prompt_engineering || {};
    const contextEng = currentConversation.context_engineering || {};
    const councilDelib = currentConversation.council_deliberation || {};

    const promptFinalized = !!promptEng.finalized_prompt;
    const contextFinalized = !!contextEng.finalized_context;
    const councilMessages = Array.isArray(councilDelib.messages) ? councilDelib.messages : [];
    
    console.log('🔍 getCurrentStage: Stage determination:', {
      promptFinalized,
      finalizedPromptExists: !!promptEng.finalized_prompt,
      finalizedPromptLength: promptEng.finalized_prompt?.length || 0,
      contextFinalized,
      contextFinalizedValue: contextEng.finalized_context,
      councilMessagesCount: councilMessages.length
    });
    
    // Preparation until council has run; no separate review stage
    if (councilMessages.length > 0) {
      console.log('🔍 getCurrentStage: Returning council_deliberation');
      return 'council_deliberation';
    }
    console.log('🔍 getCurrentStage: Returning preparation');
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
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔵 handleFinalizePrompt: START');
    console.log('   conversationId:', currentConversationId);
    console.log('   finalizedPrompt length:', finalizedPrompt?.length || 0);
    console.log('   finalizedPrompt preview:', finalizedPrompt?.substring(0, 100));
    
    if (!currentConversationId) {
      console.error('❌ handleFinalizePrompt: No conversation ID available');
      alert('Error: No conversation ID. Please create a new conversation.');
      return;
    }
    
    setPromptLoading(true);
    console.log('🔵 handleFinalizePrompt: Set loading state to true');
    
    try {
      console.log('🔵 handleFinalizePrompt: Calling API finalizePrompt...');
      const result = await api.finalizePrompt(currentConversationId, finalizedPrompt);
      console.log('🔵 handleFinalizePrompt: API response received:', {
        hasResult: !!result,
        hasConversation: !!result?.conversation,
        conversationId: result?.conversation?.id,
        hasFinalizedPrompt: !!result?.conversation?.prompt_engineering?.finalized_prompt
      });
      
      // Get the updated conversation from API response
      let updatedConversation = result?.conversation;
      if (!updatedConversation) {
        console.warn('⚠️ handleFinalizePrompt: API response missing conversation, fetching directly...');
        updatedConversation = await api.getConversation(currentConversationId);
        console.log('🔵 handleFinalizePrompt: Fetched conversation directly:', {
          hasConversation: !!updatedConversation,
          conversationId: updatedConversation?.id
        });
      }
      
      if (!updatedConversation || !updatedConversation.id) {
        console.error('❌ handleFinalizePrompt: Failed to retrieve conversation after finalization');
        throw new Error('Failed to retrieve conversation after finalization');
      }
      
      console.log('🔵 handleFinalizePrompt: Building conversation with defaults...');
      console.log('   Raw conversation structure:', {
        id: updatedConversation.id,
        hasPromptEng: !!updatedConversation.prompt_engineering,
        hasContextEng: !!updatedConversation.context_engineering,
        promptEngKeys: updatedConversation.prompt_engineering ? Object.keys(updatedConversation.prompt_engineering) : [],
        contextEngKeys: updatedConversation.context_engineering ? Object.keys(updatedConversation.context_engineering) : []
      });
      
      // Ensure proper structure exists
      const conversationWithDefaults = {
        ...updatedConversation,
        prompt_engineering: {
          messages: Array.isArray(updatedConversation.prompt_engineering?.messages) 
            ? updatedConversation.prompt_engineering.messages 
            : [],
          finalized_prompt: updatedConversation.prompt_engineering?.finalized_prompt || finalizedPrompt
        },
        context_engineering: {
          messages: Array.isArray(updatedConversation.context_engineering?.messages) 
            ? updatedConversation.context_engineering.messages 
            : [],
          documents: Array.isArray(updatedConversation.context_engineering?.documents) 
            ? updatedConversation.context_engineering.documents 
            : [],
          files: Array.isArray(updatedConversation.context_engineering?.files) 
            ? updatedConversation.context_engineering.files 
            : [],
          links: Array.isArray(updatedConversation.context_engineering?.links) 
            ? updatedConversation.context_engineering.links 
            : [],
          finalized_context: updatedConversation.context_engineering?.finalized_context || null
        },
        council_deliberation: {
          messages: Array.isArray(updatedConversation.council_deliberation?.messages) 
            ? updatedConversation.council_deliberation.messages 
            : []
        }
      };
      
      console.log('🔵 handleFinalizePrompt: Conversation structure prepared:', {
        id: conversationWithDefaults.id,
        finalizedPromptExists: !!conversationWithDefaults.prompt_engineering.finalized_prompt,
        finalizedPromptLength: conversationWithDefaults.prompt_engineering.finalized_prompt?.length || 0,
        contextEngExists: !!conversationWithDefaults.context_engineering,
        contextEngMessages: conversationWithDefaults.context_engineering.messages.length,
        contextEngDocuments: conversationWithDefaults.context_engineering.documents.length
      });
      
      // Verify prompt was finalized
      if (!conversationWithDefaults.prompt_engineering.finalized_prompt) {
        console.error('❌ handleFinalizePrompt: Prompt finalization verification failed - finalized_prompt is missing');
        throw new Error('Prompt finalization failed - finalized_prompt is missing');
      }
      
      console.log('🔵 handleFinalizePrompt: Calling setCurrentConversation...');
      console.log('   BEFORE update - current conversation:', {
        id: currentConversation?.id,
        hasFinalizedPrompt: !!currentConversation?.prompt_engineering?.finalized_prompt
      });
      
      // Update conversation state - React will re-render and getCurrentStage() will return 'context_engineering'
      setCurrentConversation(conversationWithDefaults);
      setPromptLoading(false);
      
      console.log('✅ handleFinalizePrompt: State update completed');
      console.log('   React should now re-render');
      console.log('   Expected: getCurrentStage() should return "context_engineering"');
      console.log('   New conversation state:', {
        id: conversationWithDefaults.id,
        finalizedPrompt: !!conversationWithDefaults.prompt_engineering.finalized_prompt,
        contextFinalized: !!conversationWithDefaults.context_engineering.finalized_context
      });
      console.log('═══════════════════════════════════════════════════════════');
      
    } catch (error) {
      console.error('═══════════════════════════════════════════════════════════');
      console.error('❌ handleFinalizePrompt: ERROR CAUGHT');
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      console.error('   Error object:', error);
      console.error('═══════════════════════════════════════════════════════════');
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
      console.error('Submit to Council failed:', error);
      setPromptLoading(false);
      alert(`Error: ${error.message || 'Failed to submit to council.'}`);
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

  // Helper function to render ContextEngineering - extracted for reuse
  const renderContextEngineering = () => {
    console.log('🎨 renderContextEngineering: START');
    console.log('   conversationId:', currentConversationId);
    console.log('   currentConversation exists:', !!currentConversation);
    
    if (!currentConversationId || !currentConversation) {
      console.warn('⚠️ renderContextEngineering: Missing conversationId or currentConversation');
      return (
        <div className="empty-state">
          <h2>Loading Context Engineering...</h2>
          <p>Preparing Step 2...</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Conversation ID: {currentConversationId || 'MISSING'}<br/>
            Conversation exists: {currentConversation ? 'Yes' : 'No'}
          </p>
          <button onClick={() => {
            console.log('🔄 Reloading conversation from renderContextEngineering...');
            loadConversation(currentConversationId);
          }}>Reload</button>
        </div>
      );
    }

    const promptEng = currentConversation.prompt_engineering || { messages: [], finalized_prompt: null };
    const contextEng = currentConversation.context_engineering || { messages: [], documents: [], files: [], links: [], finalized_context: null };
    
    console.log('🎨 renderContextEngineering: Extracted data:', {
      finalizedPromptExists: !!promptEng.finalized_prompt,
      finalizedPromptLength: promptEng.finalized_prompt?.length || 0,
      contextEngMessages: Array.isArray(contextEng.messages) ? contextEng.messages.length : 'NOT_ARRAY',
      contextEngDocuments: Array.isArray(contextEng.documents) ? contextEng.documents.length : 'NOT_ARRAY',
      contextEngFiles: Array.isArray(contextEng.files) ? contextEng.files.length : 'NOT_ARRAY',
      contextEngLinks: Array.isArray(contextEng.links) ? contextEng.links.length : 'NOT_ARRAY'
    });
    
    const safeContextEng = {
      messages: Array.isArray(contextEng.messages) ? contextEng.messages : [],
      documents: Array.isArray(contextEng.documents) ? contextEng.documents : [],
      files: Array.isArray(contextEng.files) ? contextEng.files : [],
      links: Array.isArray(contextEng.links) ? contextEng.links : [],
      finalized_context: contextEng.finalized_context || null
    };
    
    const finalizedPrompt = promptEng.finalized_prompt || null;
    
    console.log('🎨 renderContextEngineering: Preparing props:', {
      finalizedContextExists: !!safeContextEng.finalized_context,
      finalizedContextLength: safeContextEng.finalized_context?.length || 0,
      messagesCount: safeContextEng.messages.length,
      documentsCount: safeContextEng.documents.length
    });
    
    console.log('🎨 renderContextEngineering: Rendering ContextEngineering component...');
    
    try {
      const component = (
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
          onEditContext={handleEditContext}
          onReloadConversation={() => loadConversation(currentConversationId)}
          isLoading={contextLoading}
        />
      );
      console.log('✅ renderContextEngineering: Component created successfully');
      return component;
    } catch (componentError) {
      console.error('❌ renderContextEngineering: Error creating component:', componentError);
      throw componentError;
    }
  };

  // Render appropriate stage component
  const renderStage = () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎨 renderStage: START');
    
    try {
      if (!currentConversation) {
        console.log('🎨 renderStage: No conversation, showing welcome');
        return (
          <div className="empty-state">
            <h2>Welcome to LLM Council</h2>
            <p>Create a new conversation to get started</p>
          </div>
        );
      }

      console.log('🎨 renderStage: Conversation exists:', {
        id: currentConversation.id,
        conversationKeys: Object.keys(currentConversation)
      });

      // Ensure all data structures exist with proper defaults
      const promptEng = currentConversation.prompt_engineering || { messages: [], finalized_prompt: null };
      const contextEng = currentConversation.context_engineering || { messages: [], documents: [], files: [], links: [], finalized_context: null };
      const councilDelib = currentConversation.council_deliberation || { messages: [] };

      console.log('🎨 renderStage: Extracted structures:', {
        promptEngType: typeof promptEng,
        promptEngKeys: Object.keys(promptEng),
        finalizedPromptExists: !!promptEng.finalized_prompt,
        finalizedPromptLength: promptEng.finalized_prompt?.length || 0,
        contextEngType: typeof contextEng,
        contextEngKeys: Object.keys(contextEng),
        contextFinalized: contextEng.finalized_context,
        councilDelibType: typeof councilDelib,
        councilDelibKeys: Object.keys(councilDelib)
      });

      // Ensure context_engineering structure is always valid (even if empty)
      if (!currentConversation.context_engineering) {
        console.warn('⚠️ renderStage: context_engineering missing, initializing...');
        currentConversation.context_engineering = { messages: [], documents: [], files: [], links: [], finalized_context: null };
      }

      // Simple logic: determine stage based on conversation state
      console.log('🎨 renderStage: Calling getCurrentStage()...');
      const stageToRender = getCurrentStage();
      
      console.log('🎨 renderStage: Stage determined:', stageToRender);
      console.log('🎨 renderStage: Conversation state summary:', {
        conversationId: currentConversation.id,
        stageToRender,
        promptFinalized: !!promptEng.finalized_prompt,
        finalizedPromptPreview: promptEng.finalized_prompt?.substring(0, 50) || 'NONE',
        contextFinalized: !!contextEng.finalized_context,
        contextEngStructureValid: !!contextEng
      });

    switch (stageToRender) {
      case 'preparation': {
        // Use prior_synthesis from linked round, else extract from council messages
        let priorDeliberationSummary = currentConversation.prior_synthesis || null;
        if (!priorDeliberationSummary) {
          const councilMsgs = councilDelib.messages || [];
          for (let i = councilMsgs.length - 1; i >= 0; i--) {
            const msg = councilMsgs[i];
            if (msg?.role === 'assistant' && msg?.stage3) {
              const response = typeof msg.stage3 === 'object' ? msg.stage3.response : String(msg.stage3 || '');
              if (response) {
                priorDeliberationSummary = response.length > 3000 ? response.substring(0, 3000) + '...' : response;
                break;
              }
            }
          }
        }
        return (
          <PreparationStep
            conversationId={currentConversationId}
            messages={promptEng.messages || []}
            documents={contextEng.documents || []}
            files={contextEng.files || []}
            links={contextEng.links || []}
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

      case 'prompt_engineering': {
        console.log('🎨 renderStage: Rendering PromptEngineering', { finalizedPromptExists: !!promptEng.finalized_prompt });
        // Extract prior deliberation summary (last council synthesis)
        let priorDeliberationSummary = null;
        const councilMsgs = councilDelib.messages || [];
        for (let i = councilMsgs.length - 1; i >= 0; i--) {
          const msg = councilMsgs[i];
          if (msg?.role === 'assistant' && msg?.stage3) {
            const response = typeof msg.stage3 === 'object' ? msg.stage3.response : String(msg.stage3 || '');
            if (response) {
              priorDeliberationSummary = response.length > 500 ? response.substring(0, 500) + '...' : response;
              break;
            }
          }
        }
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
            priorDeliberationSummary={priorDeliberationSummary}
          />
        );
      }

      case 'context_engineering':
        console.log('🎨 renderStage: Rendering context_engineering stage');
        console.log('   conversationId:', currentConversationId);
        console.log('   currentConversation exists:', !!currentConversation);
        console.log('   finalizedPrompt exists:', !!promptEng.finalized_prompt);
        console.log('   Calling renderContextEngineering()...');
        
        try {
          const rendered = renderContextEngineering();
          console.log('✅ renderStage: renderContextEngineering() returned successfully');
          console.log('   Returned component type:', rendered?.type?.name || 'Unknown');
          return rendered;
        } catch (renderError) {
          console.error('❌ renderStage: Error in renderContextEngineering():', renderError);
          console.error('   Error message:', renderError.message);
          console.error('   Error stack:', renderError.stack);
          return (
            <div className="empty-state" style={{ color: 'red', padding: '40px' }}>
              <h2>Error Rendering Step 2</h2>
              <p>An error occurred while rendering the Context Engineering screen.</p>
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
                <pre style={{ fontSize: '12px', marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  {renderError.message}
                  {'\n\n'}
                  {renderError.stack}
                </pre>
              </details>
              <button 
                onClick={() => {
                  console.log('🔄 Reloading conversation after render error...');
                  loadConversation(currentConversationId);
                }} 
                style={{ marginTop: '20px', padding: '10px 20px' }}
              >
                Reload Conversation
              </button>
            </div>
          );
        }

      case 'council_deliberation':
        // Convert council_deliberation format to format expected by ChatInterface
        const formattedConversation = {
          ...currentConversation,
          messages: councilDelib.messages || [],
        };

        return (
          <ChatInterface
            conversation={formattedConversation}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStartNewRound={handleStartNewRound}
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
      console.error('═══════════════════════════════════════════════════════════');
      console.error('❌ renderStage: FATAL ERROR CAUGHT');
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      console.error('   Error name:', error.name);
      console.error('   Current conversation:', {
        id: currentConversation?.id,
        exists: !!currentConversation
      });
      console.error('═══════════════════════════════════════════════════════════');
      
      return (
        <div className="empty-state" style={{ color: 'red', padding: '40px', textAlign: 'left' }}>
          <h2>⚠️ Fatal Error Rendering Stage</h2>
          <p><strong>Error:</strong> {error.message || 'An unknown error occurred'}</p>
          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>Full Error Details</summary>
            <pre style={{ 
              fontSize: '11px', 
              padding: '15px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              <strong>Error Name:</strong> {error.name}
              {'\n\n'}
              <strong>Error Message:</strong> {error.message}
              {'\n\n'}
              <strong>Stack Trace:</strong>
              {'\n'}
              {error.stack}
            </pre>
          </details>
          <div style={{ marginTop: '20px' }}>
            <p><strong>Diagnostic Info:</strong></p>
            <ul style={{ fontSize: '12px', marginTop: '10px' }}>
              <li>Conversation ID: {currentConversationId || 'NONE'}</li>
              <li>Conversation exists: {currentConversation ? 'Yes' : 'No'}</li>
              <li>Current conversation ID: {currentConversation?.id || 'NONE'}</li>
            </ul>
          </div>
          <button 
            onClick={() => {
              console.log('🔄 Reloading conversation after fatal error...');
              if (currentConversationId) {
                loadConversation(currentConversationId);
              } else {
                window.location.reload();
              }
            }}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reload Conversation
          </button>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              marginLeft: '10px',
              padding: '12px 24px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    } finally {
      console.log('🎨 renderStage: END');
      console.log('═══════════════════════════════════════════════════════════');
    }
  };

  // Wrap renderStage in try-catch to prevent app from crashing
  let stageContent;
  try {
    console.log('🎨 App render: Calling renderStage()...');
    stageContent = renderStage();
    console.log('✅ App render: renderStage() completed successfully');
  } catch (renderError) {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ FATAL ERROR in App render - renderStage() threw error');
    console.error('   Error:', renderError);
    console.error('   Error message:', renderError.message);
    console.error('   Error stack:', renderError.stack);
    console.error('═══════════════════════════════════════════════════════════');
    
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

  console.log('🎨 App render: Rendering main app structure');

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
            onStartNewRound={handleStartNewRound}
          />
        ) : (
          stageContent
        )}
      </div>
    </div>
  );
}

export default App;
