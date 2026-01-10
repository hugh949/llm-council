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
  isLoading,
}) {
  const [input, setInput] = useState('');
  const [showFinalizeForm, setShowFinalizeForm] = useState(false);
  const [finalizeInput, setFinalizeInput] = useState('');

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
    } catch (error) {
      console.error('Failed to suggest final prompt:', error);
    }
  };

  const handleFinalize = async (e) => {
    e.preventDefault();
    if (finalizeInput.trim()) {
      await onFinalizePrompt(finalizeInput.trim());
      setShowFinalizeForm(false);
      setFinalizeInput('');
    }
  };

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
        <div className="finalized-section">
          <h3>✓ Step 1 Complete: Finalized Prompt</h3>
          <div className="finalized-content">
            <ReactMarkdown>{finalizedPrompt}</ReactMarkdown>
          </div>
          <div className="step-completion-actions">
            <p className="info-text">
              Great! Your prompt is ready. Next, add context and background information in Step 2 to help the council provide more accurate responses.
            </p>
            <div className="next-step-guidance">
              <p className="guidance-text">
                ✓ Your prompt is finalized! The system will automatically take you to Step 2.
                <br />
                <small>If you don't see Step 2, the page will update shortly.</small>
              </p>
            </div>
          </div>
        </div>
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
            <div className="finalize-form">
              <h4>Review and Finalize Prompt</h4>
              <textarea
                className="finalize-input"
                value={finalizeInput}
                onChange={(e) => setFinalizeInput(e.target.value)}
                rows={6}
                placeholder="Review and edit the suggested prompt..."
              />
              <div className="finalize-actions">
                <button
                  type="button"
                  className="finalize-button"
                  onClick={handleFinalize}
                  disabled={!finalizeInput.trim()}
                >
                  Finalize Prompt
                </button>
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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

