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
  onProceedToCouncil,
  onReloadConversation,
  isLoading,
  refinementMode = false,
}) {
  const [input, setInput] = useState('');
  const [showFinalizeForm, setShowFinalizeForm] = useState(false);
  const [finalizeInput, setFinalizeInput] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAttachments, setShowAttachments] = useState(true);
  const [priorDeliberationExpanded, setPriorDeliberationExpanded] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const fileInputRef = useRef(null);
  const hasPreFilledRef = useRef(false);

  useEffect(() => {
    if (refinementMode && finalizedPrompt && !hasPreFilledRef.current) {
      setInput(finalizedPrompt);
      hasPreFilledRef.current = true;
    }
    if (!refinementMode) hasPreFilledRef.current = false;
  }, [refinementMode, finalizedPrompt]);

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
      setFinalizeInput(result.suggested_prompt || '');
      setShowFinalizeForm(true);
      setTimeout(() => {
        document.querySelector('.finalize-form')?.scrollIntoView({ behavior: 'smooth' });
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Failed to suggest final prompt:', error);
    }
  };

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

  const handleConfirmFinalize = async () => {
    if (!finalizeInput.trim()) return;
    if (isFinalizing || isLoading) return;
    setIsFinalizing(true);
    try {
      await onFinalizePrompt(finalizeInput.trim());
      setShowFinalizeForm(false);
      setFinalizeInput('');
      setShowReviewModal(true);
    } catch (error) {
      console.error('Error finalizing:', error);
      alert(`Failed: ${error.message || 'Unknown'}`);
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleConfirmPackageAndCouncil = async () => {
    setShowReviewModal(false);
    try {
      await onPackageContext();
      if (onProceedToCouncil) await onProceedToCouncil();
      if (onReloadConversation) await onReloadConversation();
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 300);
    } catch (error) {
      console.error('Error packaging:', error);
      alert(`Failed: ${error.message || 'Unknown'}`);
    }
  };

  const isComplete = !!finalizedPrompt && !!finalizedContext;

  return (
    <div className="preparation-step">
      <ProgressIndicator
        currentStep={1}
        step1Complete={isComplete}
        step2Complete={false}
        step3Complete={false}
      />
      <div className="stage-header">
        <h2>Step 1: Prepare for Council</h2>
        <p className="stage-description">
          Refine your prompt and add context in one place. Chat with the assistant—it will ask questions, help sharpen your thinking, and suggest when to attach documents for better results.
        </p>
      </div>

      {refinementMode && priorDeliberationSummary && (
        <div className="prior-deliberation-section">
          <button
            type="button"
            className="prior-deliberation-toggle"
            onClick={() => setPriorDeliberationExpanded(!priorDeliberationExpanded)}
          >
            {priorDeliberationExpanded ? '▼' : '▶'} Previous council synthesis (for reference)
          </button>
          {priorDeliberationExpanded && (
            <div className="prior-deliberation-content">
              <ReactMarkdown>{priorDeliberationSummary}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      <div className="preparation-layout">
        {/* Main: Chat + Input */}
        <div className="preparation-main">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p>Describe what you want to achieve. The assistant will ask questions and suggest when to add documents.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <div className="message-label">{msg.role === 'user' ? 'You' : 'Assistant'}</div>
                  <div className="message-content markdown-content">
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

          {!showFinalizeForm && !isComplete && (
            <div className="input-section">
              <form onSubmit={handleSubmit} className="input-form">
                <textarea
                  className="message-input"
                  placeholder="Type your message... (Shift+Enter for new line, Enter to send)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  rows={3}
                />
                <div className="input-actions">
                  <button type="submit" className="send-button" disabled={!input.trim() || isLoading}>
                    Send
                  </button>
                  {(messages.length > 0 || (refinementMode && input.trim())) && (
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
          )}

          {showFinalizeForm && (
            <div className="finalize-section">
              <div className="finalize-form">
                <h4>Review and Finalize Prompt</h4>
                <p className="finalize-hint">Edit if needed, then click Finalize. You can add or change attachments in the panel before running the council.</p>
                <textarea
                  className="finalize-input"
                  value={finalizeInput}
                  onChange={(e) => setFinalizeInput(e.target.value)}
                  rows={8}
                  placeholder="Your finalized prompt..."
                />
              </div>
              <div className="finalize-actions-inline">
                <button type="button" className="cancel-button" onClick={() => { setShowFinalizeForm(false); setFinalizeInput(''); }}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="finalize-button large"
                  onClick={handleConfirmFinalize}
                  disabled={!finalizeInput.trim() || isLoading || isFinalizing}
                >
                  {isFinalizing || isLoading ? 'Finalizing...' : '✓ Finalize & Continue'}
                </button>
              </div>
            </div>
          )}
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

      {/* Review modal before council */}
      {showReviewModal && finalizedPrompt && (
        <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h3>Ready to Run Council</h3>
              <p>Review and confirm. The council will deliberate using your prompt and attachments.</p>
            </div>
            <div className="review-modal-content">
              <div className="review-step-section">
                <h4>Your Prompt</h4>
                <div className="review-box markdown-content">
                  <ReactMarkdown>{finalizedPrompt}</ReactMarkdown>
                </div>
              </div>
              {totalAttachments > 0 && (
                <div className="review-step-section">
                  <h4>Attachments ({totalAttachments})</h4>
                  <div className="review-attachments-list">
                    {safeFiles.map((f, i) => <div key={`f-${i}`}>📄 {f?.name}</div>)}
                    {safeLinks.map((l, i) => <div key={`l-${i}`}>🔗 {l?.original_url || l?.name}</div>)}
                    {safeDocuments.map((d, i) => <div key={`d-${i}`}>📃 {d?.name}</div>)}
                  </div>
                </div>
              )}
            </div>
            <div className="review-modal-actions">
              <button type="button" className="review-modal-btn cancel" onClick={() => setShowReviewModal(false)}>← Back</button>
              <button type="button" className="review-modal-btn confirm" onClick={handleConfirmPackageAndCouncil} disabled={isLoading}>
                {isLoading ? 'Packaging...' : '✓ Run Council'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky: Finalize & Run Council when prompt finalized but context not yet packaged */}
      {finalizedPrompt && !finalizedContext && !showFinalizeForm && (
        <div className="step-transition-bar sticky-bottom">
          <div className="transition-content">
            <div className="transition-text">
              <strong>Prompt finalized</strong>
              <p>Click below to package context and run the council.</p>
            </div>
            <button
              type="button"
              className="proceed-button large"
              onClick={() => setShowReviewModal(true)}
              disabled={isLoading}
            >
              → Finalize & Run Council
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
