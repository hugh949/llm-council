import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ProgressIndicator from './ProgressIndicator';
import './PromptEngineering.css';

export default function PromptEngineering({
  conversationId,
  messages,
  finalizedPrompt,
  onSendMessage,
  onSuggestFinal,
  onFinalizePrompt,
  onReloadConversation,
  onProceedToStep2,
  isLoading,
}) {
  const [input, setInput] = useState('');
  const [showFinalizeForm, setShowFinalizeForm] = useState(false);
  const [finalizeInput, setFinalizeInput] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      await onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestFinal = async () => {
    try {
      const result = await onSuggestFinal();
      setFinalizeInput(result.suggested_prompt || '');
      setShowFinalizeForm(true);
      // Scroll to show the finalize form and button
      setTimeout(() => {
        const finalizeForm = document.querySelector('.finalize-form');
        if (finalizeForm) {
          finalizeForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        // Also scroll window to bottom to ensure button is visible
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Failed to suggest final prompt:', error);
    }
  };

  // Removed handleFinalize - now handled directly in button onClick

  return (
    <div className="prompt-engineering">
      <ProgressIndicator 
        currentStep={1}
        step1Complete={!!finalizedPrompt}
        step2Complete={false}
        step3Complete={false}
      />
      <div className="stage-header">
        <h2>Step 1: Prompt Engineering</h2>
        <p className="stage-description">
          Describe what you're trying to achieve. I'll help you refine it into a clear, logical prompt.
        </p>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start by describing what you want to achieve...</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-label">
                {msg.role === 'user' ? 'You' : 'Prompt Assistant'}
              </div>
              <div className="message-content">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {finalizedPrompt ? (
        <>
          <div className="finalized-section">
            <h3>✓ Step 1 Complete: Finalized Prompt</h3>
            <div className="finalized-content">
              <ReactMarkdown>{finalizedPrompt}</ReactMarkdown>
            </div>
          </div>
          <div className="step-transition-bar sticky-bottom">
            <div className="transition-content">
              <div className="transition-text">
                <strong>✓ Prompt finalized!</strong>
                <p>Add context and background information in Step 2 to help the council provide more accurate responses.</p>
              </div>
              <button
                className="proceed-button large"
                onClick={async () => {
                  // Trigger transition to Step 2
                  if (onProceedToStep2) {
                    await onProceedToStep2();
                  } else if (onReloadConversation) {
                    // Fallback: reload conversation and let stage logic handle it
                    await onReloadConversation();
                  }
                  // Scroll to top smoothly
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 200);
                }}
              >
                → Continue to Step 2: Context Engineering
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="input-section">
          <form onSubmit={handleSubmit} className="input-form">
            <textarea
              className="message-input"
              placeholder="Describe what you're trying to achieve... (Shift+Enter for new line, Enter to send)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={3}
            />
            <div className="input-actions">
              <button
                type="submit"
                className="send-button"
                disabled={!input.trim() || isLoading}
              >
                Send
              </button>
              {messages.length > 0 && (
                <button
                  type="button"
                  className="suggest-final-button"
                  onClick={handleSuggestFinal}
                  disabled={isLoading}
                >
                  Suggest Final Prompt
                </button>
              )}
            </div>
          </form>

          {showFinalizeForm && (
            <>
              <div className="finalize-form">
                <h4>Review and Finalize Prompt</h4>
                <p className="finalize-hint">Edit the suggested prompt if needed, then click Finalize below to proceed.</p>
                <textarea
                  className="finalize-input"
                  value={finalizeInput}
                  onChange={(e) => setFinalizeInput(e.target.value)}
                  rows={10}
                  placeholder="Review and edit the suggested prompt..."
                />
              </div>
              <div className="finalize-actions-bar sticky-bottom">
                <div className="finalize-actions-content">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowFinalizeForm(false);
                      setFinalizeInput('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="finalize-button large"
                    onClick={async (e) => {
                      // Prevent any default behavior or navigation
                      e.preventDefault();
                      e.stopPropagation();
                      
                      if (!finalizeInput.trim()) {
                        alert('Please enter a prompt to finalize');
                        return;
                      }
                      
                      if (isFinalizing || isLoading) {
                        return; // Prevent double-clicking
                      }
                      
                      const promptToFinalize = finalizeInput.trim();
                      setIsFinalizing(true);
                      
                      try {
                        console.log('Finalizing prompt...', promptToFinalize.substring(0, 50));
                        
                        // Call the finalize handler - this updates backend and reloads state in App.jsx
                        await onFinalizePrompt(promptToFinalize);
                        
                        console.log('Prompt finalized successfully');
                        
                        // Clear form immediately after successful API call
                        setShowFinalizeForm(false);
                        setFinalizeInput('');
                        setIsFinalizing(false);
                        
                        // The onFinalizePrompt handler in App.jsx will reload the conversation
                        // which will update the state and trigger a re-render
                        // This ensures we have consistent, complete state - prevents blank screen
                        
                        // Small delay to allow state to update, then scroll to top
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 300);
                      } catch (error) {
                        console.error('Error finalizing prompt:', error);
                        setIsFinalizing(false);
                        alert(`Failed to finalize prompt: ${error.message || 'Unknown error'}`);
                        // Don't clear form on error - let user try again
                      }
                    }}
                    disabled={!finalizeInput.trim() || isLoading || isFinalizing}
                  >
                    {isFinalizing || isLoading ? (
                      <>
                        <span className="button-spinner"></span>
                        Finalizing...
                      </>
                    ) : (
                      '✓ Finalize Prompt'
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

