import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import ProgressIndicator from './ProgressIndicator';
import './PreparationStep.css';

export default function PreparationStep({
  conversationId,
  messages,
  documents = [],
  files = [],
  links = [],
  finalizedPrompt,
  finalizedContext,
  priorDeliberationSummary,
  onSendMessage,
  onSuggestFinal,
  onFinalizePrompt,
  onAddDocument,
  onUploadFile,
  onAddLink,
  onPackageContext,
  onSubmitToCouncil,
  onReloadConversation,
  isLoading,
}) {
  const [input, setInput] = useState('');
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false); // Default collapsed for max chat space
  const [priorDeliberationExpanded, setPriorDeliberationExpanded] = useState(false); // Collapsed to reduce scroll
  const [refinementPanelExpanded, setRefinementPanelExpanded] = useState(false); // Collapsed by default
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [suggestedPromptText, setSuggestedPromptText] = useState(null); // When set, shows editable "Suggested Final Prompt" panel
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const hasPreFilledRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const isContinuation = !!priorDeliberationSummary;

  useEffect(() => {
    if (isContinuation && finalizedPrompt && !hasPreFilledRef.current) {
      setInput(finalizedPrompt);
      hasPreFilledRef.current = true;
    }
    if (!isContinuation) hasPreFilledRef.current = false;
  }, [isContinuation, finalizedPrompt]);

  const safeDocuments = Array.isArray(documents) ? documents : [];
  const safeFiles = Array.isArray(files) ? files : [];
  const safeLinks = Array.isArray(links) ? links : [];
  const totalAttachments = safeDocuments.length + safeFiles.length + safeLinks.length;

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
      const suggested = result.suggested_prompt || '';
      setSuggestedPromptText(suggested);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to suggest final prompt:', error);
    }
  };

  const handleDismissSuggestedPrompt = () => {
    setSuggestedPromptText(null);
  };

  const promptForSubmit =
    suggestedPromptText !== null
      ? suggestedPromptText.trim()
      : finalizedPrompt && !isEditingPrompt
        ? finalizedPrompt
        : (input.trim() || lastUserMessage);

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (documentName.trim() && documentContent.trim()) {
      await onAddDocument(documentName.trim(), documentContent.trim());
      setDocumentName('');
      setDocumentContent('');
      setShowDocumentForm(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      await onUploadFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert(`Error: ${error.message || 'Unknown'}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      try {
        await onAddLink(linkUrl.trim());
        setLinkUrl('');
        setShowLinkForm(false);
      } catch (error) {
        console.error('Failed to add link:', error);
        alert(`Error: ${error.message || 'Unknown'}`);
      }
    }
  };

  const handleEditPrompt = () => {
    setInput(finalizedPrompt || '');
    setIsEditingPrompt(true);
    setTimeout(() => {
      const el = document.querySelector('.message-input');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const lastUserMessage = messages.filter((m) => m.role === 'user').pop()?.content || '';
  const canSubmit = !!promptForSubmit.trim() && !isLoading && onSubmitToCouncil;

  return (
    <div className="preparation-step">
      <ProgressIndicator
        prepared={!!finalizedPrompt && !!finalizedContext}
        deliberated={false}
      />
      <div className="stage-header">
        <h2>Prepare for Council</h2>
        <p className="stage-description">
          Refine your prompt and add context in one place. Chat with the assistant—it will ask questions, help sharpen your thinking, and suggest when to attach documents for better results.
        </p>
      </div>

      {/* Refinement: Prior council synthesis + prior prompt - collapsible */}
      {isContinuation && (priorDeliberationSummary || finalizedPrompt) && (
        <div className="refinement-context-panel">
          <button
            type="button"
            className="refinement-panel-toggle"
            onClick={() => setRefinementPanelExpanded(!refinementPanelExpanded)}
          >
            <span>{refinementPanelExpanded ? '▼' : '▶'} Previous round context</span>
            <span className="refinement-panel-hint">{refinementPanelExpanded ? 'Collapse' : 'Click to edit prior prompt'}</span>
          </button>
          {refinementPanelExpanded && (
            <div className="refinement-panel-content">
              {priorDeliberationSummary && (
                <div className="refinement-prior-section">
                  <button
                    type="button"
                    className="refinement-toggle"
                    onClick={() => setPriorDeliberationExpanded(!priorDeliberationExpanded)}
                  >
                    {priorDeliberationExpanded ? '▼' : '▶'} Previous council synthesis
                  </button>
                  {priorDeliberationExpanded && (
                    <div className="refinement-prior-content markdown-content">
                      <ReactMarkdown>{typeof priorDeliberationSummary === 'string' ? priorDeliberationSummary : ''}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
              {finalizedPrompt && (
                <div className="refinement-prior-prompt">
                  <span className="refinement-label">Your previous prompt (editable below):</span>
                  <div className="refinement-prompt-preview markdown-content">
                    <ReactMarkdown>{typeof finalizedPrompt === 'string' ? finalizedPrompt : ''}</ReactMarkdown>
                  </div>
                  <button type="button" className="edit-prompt-btn" onClick={handleEditPrompt}>
                    ✏️ Edit this prompt
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="preparation-layout">
        {/* Main: Chat + Input */}
        <div className="preparation-main">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="message assistant opening-message">
                <div className="message-label">Assistant</div>
                <div className="message-content markdown-content">
                  <p><strong>How can I help with your Council Preparation?</strong></p>
                  <p>I'm an expert critical thinking prompt engineer. Describe what you're trying to achieve, and I'll ask the right questions to sharpen your prompt. You can also attach documents—I'll use them to tailor my guidance. When you're ready, click "Suggest Final Prompt" to get a draft you can review and edit before submitting for deliberation.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <div className="message-label">{msg.role === 'user' ? 'You' : 'Assistant'}</div>
                  <div className="message-content markdown-content">
                    <ReactMarkdown>{msg.content ?? ''}</ReactMarkdown>
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
            <div ref={messagesEndRef} />
          </div>

          <div className="input-section">
              {finalizedPrompt && !isEditingPrompt && (
                <div className="finalized-prompt-bar">
                  <span className="finalized-label">✓ Prompt finalized</span>
                  <button type="button" className="edit-prompt-btn" onClick={handleEditPrompt} disabled={isLoading}>
                    ✏️ Edit prompt
                  </button>
                </div>
              )}
              {suggestedPromptText !== null && (
                <div className="suggested-prompt-panel">
                  <div className="suggested-prompt-header">
                    <strong>Suggested Final Prompt</strong>
                    <span className="suggested-prompt-hint">Review and edit below, then submit for deliberation</span>
                    <button type="button" className="dismiss-suggested-btn" onClick={handleDismissSuggestedPrompt} aria-label="Dismiss">×</button>
                  </div>
                  <textarea
                    className="suggested-prompt-textarea"
                    value={suggestedPromptText}
                    onChange={(e) => setSuggestedPromptText(e.target.value)}
                    placeholder="Edit the suggested prompt..."
                    rows={6}
                  />
                  <div className="suggested-prompt-actions">
                    <button type="button" className="edit-prompt-btn" onClick={handleDismissSuggestedPrompt}>
                      Dismiss
                    </button>
                    <button
                      type="button"
                      className="proceed-button large"
                      onClick={() => {
                        if (promptForSubmit.trim()) onSubmitToCouncil(promptForSubmit.trim());
                        setSuggestedPromptText(null);
                      }}
                      disabled={!promptForSubmit.trim() || isLoading}
                    >
                      Submit for Deliberation
                    </button>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="input-form">
                <textarea
                  className="message-input"
                  placeholder={finalizedPrompt && isEditingPrompt ? "Edit your prompt and send to continue the conversation..." : "Type your message... (Shift+Enter for new line, Enter to send)"}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); if (finalizedPrompt) setIsEditingPrompt(true); }}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  rows={4}
                />
                <div className="input-actions">
                  <button type="submit" className="send-button" disabled={!input.trim() || isLoading}>
                    Send
                  </button>
                  {canSubmit && suggestedPromptText === null && (
                    <button
                      type="button"
                      className="proceed-button large"
                      onClick={() => onSubmitToCouncil(promptForSubmit.trim())}
                      disabled={!canSubmit}
                    >
                      Submit for Deliberation
                    </button>
                  )}
                  {(messages.length > 0 || (isContinuation && input.trim()) || input.trim()) && (
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
            </div>
        </div>

        {/* Sidebar: Attachments */}
        <div className="preparation-sidebar">
          <div className="sidebar-card">
            <button
              type="button"
              className="sidebar-header"
              onClick={() => setShowAttachments(!showAttachments)}
            >
              <span>📎 Attachments ({totalAttachments})</span>
              <span className="sidebar-toggle">{showAttachments ? '−' : '+'}</span>
            </button>
            {showAttachments && (
              <div className="sidebar-content">
                <div
                  className="compact-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleFileUpload({ target: { files: [f] } });
                  }}
                >
                  <div className="upload-zone-icon">📤</div>
                  <span>{uploadingFile ? 'Processing...' : 'Drop files or click'}</span>
                </div>
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv" />

                <div className="quick-actions">
                  <button type="button" className={`quick-action-btn ${showLinkForm ? 'active' : ''}`} onClick={() => { setShowLinkForm(!showLinkForm); setShowDocumentForm(false); }}>
                    🔗 Link
                  </button>
                  <button type="button" className={`quick-action-btn ${showDocumentForm ? 'active' : ''}`} onClick={() => { setShowDocumentForm(!showDocumentForm); setShowLinkForm(false); }}>
                    📄 Paste
                  </button>
                </div>

                {showLinkForm && (
                  <form className="quick-form" onSubmit={handleAddLink}>
                    <input type="url" className="quick-input" placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} required autoFocus />
                    <div className="quick-actions">
                      <button type="submit" className="quick-action-btn primary">Add</button>
                      <button type="button" className="quick-action-btn" onClick={() => setShowLinkForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}

                {showDocumentForm && (
                  <form className="quick-form" onSubmit={handleAddDocument}>
                    <input type="text" className="quick-input" placeholder="Document name" value={documentName} onChange={(e) => setDocumentName(e.target.value)} required />
                    <textarea className="quick-textarea" placeholder="Paste content..." value={documentContent} onChange={(e) => setDocumentContent(e.target.value)} rows={3} required />
                    <div className="quick-actions">
                      <button type="submit" className="quick-action-btn primary">Add</button>
                      <button type="button" className="quick-action-btn" onClick={() => setShowDocumentForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}

                {totalAttachments > 0 && (
                  <div className="attachments-list">
                    {safeFiles.map((f, i) => (
                      <div key={`f-${i}`} className="attachment-item">📄 {f?.name || 'File'}</div>
                    ))}
                    {safeLinks.map((l, i) => (
                      <div key={`l-${i}`} className="attachment-item">🔗 {l?.original_url || l?.name || 'Link'}</div>
                    ))}
                    {safeDocuments.map((d, i) => (
                      <div key={`d-${i}`} className="attachment-item">📃 {d?.name || 'Doc'}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
