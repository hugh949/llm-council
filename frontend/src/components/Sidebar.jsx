import { useState, useEffect } from 'react';
import { api } from '../api';
import './Sidebar.css';

export default function Sidebar({
  conversations,
  currentConversationId,
  currentConversation, // Pass current conversation from App
  onSelectConversation,
  onSelectStep,
  onNewConversation,
  onDeleteConversation,
}) {
  const [conversationDetails, setConversationDetails] = useState({});
  const [loadingConversations, setLoadingConversations] = useState(new Set());

  // Update conversation details when currentConversation changes
  useEffect(() => {
    if (currentConversation && currentConversation.id) {
      setConversationDetails(prev => ({
        ...prev,
        [currentConversation.id]: currentConversation
      }));
    }
  }, [currentConversation]);

  // Load conversation details when selected
  useEffect(() => {
    if (currentConversationId && !conversationDetails[currentConversationId] && !currentConversation) {
      loadConversationDetails(currentConversationId);
    }
  }, [currentConversationId]);

  const loadConversationDetails = async (convId) => {
    if (loadingConversations.has(convId)) return;
    
    setLoadingConversations(prev => new Set(prev).add(convId));
    try {
      const details = await api.getConversation(convId);
      setConversationDetails(prev => ({
        ...prev,
        [convId]: details
      }));
    } catch (error) {
      console.error('Failed to load conversation details:', error);
    } finally {
      setLoadingConversations(prev => {
        const newSet = new Set(prev);
        newSet.delete(convId);
        return newSet;
      });
    }
  };

  const getDetails = (convId) => conversationDetails[convId];
  const isLoading = (convId) => loadingConversations.has(convId);

  const handleStepClick = (convId, step, e) => {
    e.stopPropagation();
    if (onSelectStep) {
      onSelectStep(convId, step);
    }
  };

  const handleDeleteClick = (convId, e) => {
    e.stopPropagation();
    const conv = conversations.find(c => c.id === convId);
    const convTitle = conv?.title || 'this conversation';
    
    if (window.confirm(`Are you sure you want to delete "${convTitle}"? This action cannot be undone.`)) {
      if (onDeleteConversation) {
        onDeleteConversation(convId);
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <img src="/xavorlogo.jpeg" alt="Xavor" className="xavor-logo" />
        </div>
        <h1 className="app-title">LLM Council</h1>
        <button className="new-conversation-btn" onClick={onNewConversation}>
          + New Conversation
        </button>
      </div>

      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">No conversations yet</div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv.id === currentConversationId;
            // Use currentConversation if available and selected, otherwise use cached details
            const details = isSelected && currentConversation ? currentConversation : getDetails(conv.id);
            const loading = isLoading(conv.id);
            
            // Load details if selected but not loaded and not currentConversation
            if (isSelected && !details && !loading && !currentConversation) {
              loadConversationDetails(conv.id);
            }

            const promptEng = details?.prompt_engineering || {};
            const contextEng = details?.context_engineering || {};
            const councilDelib = details?.council_deliberation || {};

            const hasStep1 = !!promptEng.finalized_prompt;
            const hasStep2 = !!contextEng.finalized_context;
            // Step 3 is complete if there are messages with stage3 result
            const hasStep3 = councilDelib.messages && councilDelib.messages.length > 0 && 
                             councilDelib.messages.some(msg => msg.role === 'assistant' && msg.stage3);

            return (
              <div
                key={conv.id}
                className={`conversation-item ${isSelected ? 'active' : ''}`}
              >
                <div 
                  className="conversation-header"
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <div className="conversation-title-row">
                    <div className="conversation-title">
                      {conv.title || 'New Conversation'}
                    </div>
                    <button
                      className="delete-conversation-btn"
                      onClick={(e) => handleDeleteClick(conv.id, e)}
                      title="Delete conversation"
                    >
                      ×
                    </button>
                  </div>
                  <div className="conversation-meta">
                    {conv.message_count} messages
                  </div>
                </div>

                {isSelected && (
                  <div className="conversation-steps">
                    {loading ? (
                      <div className="steps-loading">Loading steps...</div>
                    ) : (
                      <>
                        {/* Step 1 */}
                        <div 
                          className={`step-item ${hasStep1 ? 'completed' : 'incomplete'}`}
                          onClick={(e) => hasStep1 && handleStepClick(conv.id, 'step1', e)}
                        >
                          <div className="step-indicator">
                            <span className="step-number">1</span>
                            {hasStep1 && <span className="step-check">✓</span>}
                          </div>
                          <div className="step-info">
                            <div className="step-name">Step 1: Prompt Engineering</div>
                            {hasStep1 && (
                              <div className="step-preview">
                                {hasStep3
                                  ? 'Click to refine or start new round'
                                  : `${promptEng.finalized_prompt.substring(0, 60)}...`}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div 
                          className={`step-item ${hasStep2 ? 'completed' : 'incomplete'}`}
                          onClick={(e) => hasStep2 && handleStepClick(conv.id, 'step2', e)}
                        >
                          <div className="step-indicator">
                            <span className="step-number">2</span>
                            {hasStep2 && <span className="step-check">✓</span>}
                          </div>
                          <div className="step-info">
                            <div className="step-name">Step 2: Context Engineering</div>
                            {hasStep2 && (
                              <div className="step-preview">
                                {[
                                  contextEng.documents?.length > 0 && `${contextEng.documents.length} doc${contextEng.documents.length !== 1 ? 's' : ''}`,
                                  contextEng.files?.length > 0 && `${contextEng.files.length} file${contextEng.files.length !== 1 ? 's' : ''}`,
                                  contextEng.links?.length > 0 && `${contextEng.links.length} link${contextEng.links.length !== 1 ? 's' : ''}`
                                ].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div 
                          className={`step-item ${hasStep3 ? 'completed' : 'incomplete'}`}
                          onClick={(e) => hasStep3 && handleStepClick(conv.id, 'step3', e)}
                        >
                          <div className="step-indicator">
                            <span className="step-number">3</span>
                            {hasStep3 && <span className="step-check">✓</span>}
                          </div>
                          <div className="step-info">
                            <div className="step-name">Step 3: Council Deliberation</div>
                            {hasStep3 && (
                              <div className="step-preview">
                                {councilDelib.messages.length} message{councilDelib.messages.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
