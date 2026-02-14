import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import ProgressIndicator from './ProgressIndicator';
import './ContextEngineering.css';

export default function ContextEngineering({
  conversationId,
  finalizedPrompt,
  messages,
  documents,
  files,
  links,
  finalizedContext,
  onSendMessage,
  onAddDocument,
  onUploadFile,
  onAddLink,
  onPackageContext,
  onEditPrompt,
  onEditContext,
  onReloadConversation,
  isLoading,
  refinementMode = false,
}) {
  const [input, setInput] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(finalizedPrompt || '');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [manualContext, setManualContext] = useState('');
  const [savedManualContext, setSavedManualContext] = useState('');
  const [isEditingManualContext, setIsEditingManualContext] = useState(false);
  const [editedContext, setEditedContext] = useState('');
  const [isEditingContext, setIsEditingContext] = useState(false);
  const fileInputRef = useRef(null);

  // Sync editedPrompt when finalizedPrompt prop changes
  useEffect(() => {
    if (finalizedPrompt && !editingPrompt) {
      setEditedPrompt(finalizedPrompt);
    }
  }, [finalizedPrompt, editingPrompt]);

  // Pre-load manual context from prior round's user messages when entering Step 2 in later rounds
  useEffect(() => {
    if (refinementMode && messages && messages.length > 0) {
      const userContents = (messages || [])
        .filter((m) => m?.role === 'user')
        .map((m) => (m?.content || '').trim())
        .filter(Boolean);
      if (userContents.length > 0) {
        const combined = userContents.join('\n\n');
        setSavedManualContext(combined);
      }
    }
  }, [refinementMode, messages]);

  // Sync editedContext when finalizedContext changes (for Refine Context)
  useEffect(() => {
    if (finalizedContext && !isEditingContext) {
      setEditedContext(finalizedContext);
    }
  }, [finalizedContext, isEditingContext]);

  const handleSaveManualContext = () => {
    if (manualContext.trim()) {
      setSavedManualContext(manualContext.trim());
      setIsEditingManualContext(false);
    }
  };

  const handleEditManualContext = () => {
    setManualContext(savedManualContext);
    setIsEditingManualContext(true);
  };

  const handleClearManualContext = () => {
    if (confirm('Clear all manual context? This cannot be undone.')) {
      setManualContext('');
      setSavedManualContext('');
      setIsEditingManualContext(false);
    }
  };

  const handleCancelEditManualContext = () => {
    setManualContext(savedManualContext);
    setIsEditingManualContext(false);
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
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      await onUploadFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert(`Error uploading file: ${error.message || 'Unknown error'}`);
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
        alert(`Error adding link: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handlePackageContext = async () => {
    // Show review modal first
    setShowReviewModal(true);
  };

  const handleConfirmPackage = async () => {
    setShowReviewModal(false);
    try {
      await onPackageContext();
    } catch (error) {
      console.error('Failed to package context:', error);
      alert(`Error packaging context: ${error.message || 'Unknown error'}`);
    }
  };


  const handleSavePrompt = async () => {
    if (editedPrompt.trim() && onEditPrompt) {
      await onEditPrompt(editedPrompt.trim());
      setEditingPrompt(false);
    }
  };

  const handleEditContextForRefinement = () => {
    setEditedContext(finalizedContext || '');
    setIsEditingContext(true);
  };

  const handleSaveContext = async () => {
    if (editedContext.trim() && onEditContext) {
      await onEditContext(editedContext.trim());
      setIsEditingContext(false);
    }
  };

  // Validate props
  const safeDocuments = Array.isArray(documents) ? documents : [];
  const safeFiles = Array.isArray(files) ? files : [];
  const safeLinks = Array.isArray(links) ? links : [];
  const totalAttachments = safeDocuments.length + safeFiles.length + safeLinks.length;
  
  // Check if manual context has been saved
  const hasManualContext = savedManualContext.trim().length > 0;

  // Helper functions
  const getFileIcon = (file) => {
    const type = (file?.type || '').toLowerCase();
    if (type === 'pdf') return '📄';
    if (type === 'docx' || type === 'doc') return '📝';
    if (type === 'xlsx' || type === 'xls') return '📊';
    if (type === 'pptx' || type === 'ppt') return '📽️';
    if (type === 'txt' || type === 'md') return '📃';
    if (type === 'csv') return '📈';
    return '📎';
  };

  const getFilePreview = (file) => {
    const content = file?.content || '';
    if (!content) return 'No content preview available';
    const preview = content.substring(0, 150).replace(/\n/g, ' ').trim();
    return preview + (content.length > 150 ? '...' : '');
  };

  if (!conversationId) {
    return (
      <div className="empty-state" style={{ padding: '40px' }}>
        <h2>Error: Missing Conversation ID</h2>
        <p>Please reload the conversation.</p>
        {onReloadConversation && (
          <button onClick={onReloadConversation} style={{ marginTop: '12px' }}>
            Reload
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="context-engineering">
      <ProgressIndicator 
        currentStep={2}
        step1Complete={true}
        step2Complete={!!finalizedContext}
        step3Complete={false}
      />
      
      <div className="stage-header">
        <h2>Step 2: Context Engineering - Add Intelligence with RAG</h2>
        <p className="stage-description">
          Upload documents, presentations, and research materials that will be intelligently analyzed and used to enhance your council's responses. The system will automatically extract relevant information when needed.
        </p>
      </div>

      {/* View/Edit Packaged Context from previous round - same pattern as View/Edit Prompt, only when we have prior packaged context */}
      {finalizedContext && (
        <details className="collapsible-section" style={{ marginBottom: '20px' }}>
          <summary className="collapsible-header">
            <span className="collapsible-icon">📋</span>
            <span className="collapsible-title">View/Edit Packaged Context</span>
          </summary>
          <div className="collapsible-content">
            {isEditingContext ? (
              <div className="edit-prompt-form">
                <textarea
                  className="prompt-edit-textarea"
                  value={editedContext}
                  onChange={(e) => setEditedContext(e.target.value)}
                  rows={10}
                  placeholder="Edit packaged context..."
                  style={{ width: '100%' }}
                />
                <div className="edit-prompt-actions">
                  <button
                    type="button"
                    className="save-prompt-button"
                    onClick={handleSaveContext}
                    disabled={!editedContext.trim() || isLoading}
                  >
                    Save Context
                  </button>
                  <button
                    type="button"
                    className="cancel-edit-button"
                    onClick={() => {
                      setIsEditingContext(false);
                      setEditedContext(finalizedContext);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="finalized-prompt-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {finalizedContext}
                </div>
                {onEditContext && (
                  <button
                    type="button"
                    className="edit-prompt-button"
                    onClick={handleEditContextForRefinement}
                    style={{ marginTop: '12px' }}
                  >
                    Edit context
                  </button>
                )}
              </div>
            )}
          </div>
        </details>
      )}

      {/* Compact two-column layout */}
      <div className="context-grid">
        
        {/* LEFT COLUMN: Manual Text Input */}
        <div className="manual-context-section">
          <div className="section-card">
            <div className="card-header">
              <h3>✍️ Add Context Manually</h3>
              <p className="card-hint">Type or paste additional context, guidelines, constraints, or background information</p>
            </div>
            {/* Simple single context area */}
            {!hasManualContext || isEditingManualContext ? (
              <>
                <textarea
                  className="manual-context-textarea"
                  placeholder="Add any clarifications, constraints, guidelines, or background information that will help the council provide better responses...&#10;&#10;Examples:&#10;• Focus on technical accuracy over simplicity&#10;• Consider budget constraints under $10,000&#10;• Target audience is intermediate level&#10;• Prioritize practical solutions&#10;• Include real-world examples"
                  value={manualContext}
                  onChange={(e) => setManualContext(e.target.value)}
                  rows={10}
                />
                <div className="context-actions">
                  {manualContext.trim() && (
                    <button
                      type="button"
                      className="context-action-btn save"
                      onClick={handleSaveManualContext}
                    >
                      ✓ Save Context
                    </button>
                  )}
                  {isEditingManualContext && (
                    <button
                      type="button"
                      className="context-action-btn cancel"
                      onClick={handleCancelEditManualContext}
                    >
                      Cancel
                    </button>
                  )}
                  {manualContext.trim() && (
                    <button
                      type="button"
                      className="context-action-btn clear"
                      onClick={() => setManualContext('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Saved context display */}
                <div className="saved-context-display">
                  <div className="saved-context-header">
                    <span className="saved-label">✓ Manual Context Saved</span>
                    <div className="saved-actions">
                      <button
                        type="button"
                        className="saved-btn edit"
                        onClick={handleEditManualContext}
                        title="Edit context"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="saved-btn clear"
                        onClick={handleClearManualContext}
                        title="Clear context"
                      >
                        🗑️ Clear
                      </button>
                    </div>
                  </div>
                  <div className="saved-context-content">
                    {savedManualContext}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: File Upload */}
        <div className="upload-section">
          <div className="section-card">
            <div className="card-header">
              <h3>📎 Upload Documents (RAG)</h3>
              <p className="card-hint">Documents will be intelligently analyzed and retrieved during deliberation</p>
            </div>
            
            {/* Compact Upload Zone */}
            <div 
              className="compact-upload-zone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  handleFileUpload({ target: { files } });
                }
              }}
            >
              <div className="upload-zone-icon">📤</div>
              <div className="upload-zone-text">
                <strong>{uploadingFile ? 'Processing...' : 'Drop files or click to browse'}</strong>
                <span className="upload-formats">
                  PDF • Word • PowerPoint • Excel • Text
                </span>
              </div>
              
              {uploadingFile && (
                <div className="upload-progress-inline">
                  <div className="spinner-small"></div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv"
              />
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <button
                type="button"
                className={`quick-action-btn ${showLinkForm ? 'active' : ''}`}
                onClick={() => {
                  setShowLinkForm(!showLinkForm);
                  setShowDocumentForm(false); // Close the other form
                }}
              >
                🔗 Add Link
              </button>
              <button
                type="button"
                className={`quick-action-btn ${showDocumentForm ? 'active' : ''}`}
                onClick={() => {
                  setShowDocumentForm(!showDocumentForm);
                  setShowLinkForm(false); // Close the other form
                }}
              >
                📄 Paste Text
              </button>
            </div>

            {/* Link Form */}
            {showLinkForm && (
              <form className="quick-form" onSubmit={handleAddLink}>
                <input
                  type="url"
                  className="quick-input"
                  placeholder="https://example.com/article"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  required
                  autoFocus
                />
                <div className="quick-actions">
                  <button type="submit" className="quick-action-btn primary">Add</button>
                  <button type="button" className="quick-action-btn" onClick={() => setShowLinkForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            {/* Document Form */}
            {showDocumentForm && (
              <form className="quick-form" onSubmit={handleAddDocument}>
                <input
                  type="text"
                  className="quick-input"
                  placeholder="Document name..."
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  required
                />
                <textarea
                  className="quick-textarea"
                  placeholder="Paste content..."
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  rows={4}
                  required
                />
                <div className="quick-actions">
                  <button type="submit" className="quick-action-btn primary">Add</button>
                  <button type="button" className="quick-action-btn" onClick={() => setShowDocumentForm(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Attached Documents - Scrollable Area with Thumbnails */}
      {totalAttachments > 0 && (
        <div className="attachments-display">
          <div className="attachments-display-header">
            <h3>📎 Attached Documents ({totalAttachments})</h3>
            <div className="success-badge">✓ Ready for RAG Analysis</div>
          </div>
          
          <div className="attachments-scrollable">
            {/* Files with Thumbnails */}
            {safeFiles.length > 0 && (
              <div className="attachment-category">
                <h4 className="category-title">Uploaded Files ({safeFiles.length})</h4>
                <div className="thumbnails-grid">
                  {safeFiles.map((file, index) => {
                    if (!file) return null;
                    const fileName = file?.name || 'Untitled';
                    const fileType = file?.type || 'unknown';
                    return (
                      <div key={index} className="file-thumbnail">
                        <div className="thumbnail-icon">{getFileIcon(file)}</div>
                        <div className="thumbnail-content">
                          <div className="thumbnail-name" title={fileName}>{fileName}</div>
                          <div className="thumbnail-type">{fileType.toUpperCase()}</div>
                          {file?.page_count && <div className="thumbnail-meta">📄 {file.page_count} pages</div>}
                          {file?.slide_count && <div className="thumbnail-meta">📊 {file.slide_count} slides</div>}
                        </div>
                        <div className="thumbnail-status">✓</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Links */}
            {safeLinks.length > 0 && (
              <div className="attachment-category">
                <h4 className="category-title">Web Links ({safeLinks.length})</h4>
                <div className="thumbnails-grid">
                  {safeLinks.map((link, index) => {
                    if (!link) return null;
                    const linkUrl = link?.original_url || link?.name || '#';
                    const linkText = link?.original_url || link?.name || 'Link';
                    return (
                      <div key={index} className="file-thumbnail">
                        <div className="thumbnail-icon">🔗</div>
                        <div className="thumbnail-content">
                          <a 
                            href={linkUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="thumbnail-name link-name"
                            title={linkText}
                          >
                            {linkText}
                          </a>
                          <div className="thumbnail-type">WEB LINK</div>
                        </div>
                        <div className="thumbnail-status">
                          {link?.error ? '⚠️' : '✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pasted Documents */}
            {safeDocuments.length > 0 && (
              <div className="attachment-category">
                <h4 className="category-title">Text Documents ({safeDocuments.length})</h4>
                <div className="thumbnails-grid">
                  {safeDocuments.map((doc, index) => {
                    if (!doc) return null;
                    const docName = doc?.name || 'Untitled';
                    const docContent = doc?.content || '';
                    const charCount = docContent.length;
                    return (
                      <div key={index} className="file-thumbnail">
                        <div className="thumbnail-icon">📄</div>
                        <div className="thumbnail-content">
                          <div className="thumbnail-name" title={docName}>{docName}</div>
                          <div className="thumbnail-type">TEXT</div>
                          <div className="thumbnail-meta">{charCount} characters</div>
                        </div>
                        <div className="thumbnail-status">✓</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View/Edit Finalized Prompt - Collapsible for reference */}
      {finalizedPrompt && !finalizedContext && (
        <details className="collapsible-section" style={{ marginTop: '20px' }}>
          <summary className="collapsible-header">
            <span className="collapsible-icon">📝</span>
            <span className="collapsible-title">View/Edit Your Finalized Prompt from Step 1</span>
          </summary>
          <div className="collapsible-content">
            {editingPrompt ? (
              <div className="edit-prompt-form">
                <textarea
                  className="prompt-edit-textarea"
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  rows={8}
                  placeholder="Edit your finalized prompt..."
                />
                <div className="edit-prompt-actions">
                  <button
                    type="button"
                    className="save-prompt-button"
                    onClick={handleSavePrompt}
                    disabled={!editedPrompt.trim() || isLoading}
                  >
                    Save Prompt
                  </button>
                  <button
                    type="button"
                    className="cancel-edit-button"
                    onClick={() => {
                      setEditingPrompt(false);
                      setEditedPrompt(finalizedPrompt);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="finalized-prompt-content">
                  <ReactMarkdown>{finalizedPrompt}</ReactMarkdown>
                </div>
                <button
                  type="button"
                  className="edit-prompt-button"
                  onClick={() => {
                    setEditingPrompt(true);
                    setEditedPrompt(finalizedPrompt);
                  }}
                  style={{ marginTop: '12px' }}
                >
                  Edit Prompt
                </button>
              </div>
            )}
          </div>
        </details>
      )}

      {/* Completion State - same for all rounds when context is packaged */}
      {finalizedContext && (
        <>
          <div className="finalized-section">
            <h3>✓ Step 2 Complete: Context Packaged</h3>
            <div className="step-completion-info">
              <p className="info-text">
                Excellent! Your context is ready
                {totalAttachments > 0 && <span> with <strong>{totalAttachments} attachment{totalAttachments !== 1 ? 's' : ''}</strong></span>}
                {hasManualContext && <span> and manual context</span>}.
                {totalAttachments > 0 && ' The RAG system will intelligently retrieve relevant information when needed.'}
              </p>
            </div>
          </div>
          <div className="step-transition-bar sticky-bottom">
            <div className="transition-content">
              <div className="transition-text">
                <strong>✓ Context packaged!</strong>
                <p>Review your prompt and context, then proceed to council deliberation in Step 3.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="edit-prompt-button"
                  onClick={handlePackageContext}
                  disabled={isLoading}
                >
                  Edit & Re-package
                </button>
                <button
                  className="proceed-button large"
                  onClick={async () => {
                    if (onReloadConversation) {
                      await onReloadConversation();
                    }
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  → Continue to Review & Step 3
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h3>📋 Review Everything Before Proceeding to Step 3</h3>
              <p>Review all content from <strong>Step 1</strong> and <strong>Step 2</strong> that will be provided to the council for deliberation</p>
            </div>
            
            <div className="review-modal-content">
              {/* Step 1 Content */}
              <div className="review-step-section">
                <div className="review-step-header">
                  <span className="review-step-badge">Step 1</span>
                  <h3>Your Question/Prompt</h3>
                </div>
                {finalizedPrompt ? (
                  <div className="review-box">
                    <ReactMarkdown>{finalizedPrompt}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="review-box empty-notice">
                    <em>No prompt from Step 1</em>
                  </div>
                )}
              </div>

              {/* Step 2 Content */}
              <div className="review-step-section">
                <div className="review-step-header">
                  <span className="review-step-badge">Step 2</span>
                  <h3>Additional Context & Attachments</h3>
                </div>

                {/* Manual Context */}
                {hasManualContext ? (
                  <div className="review-subsection">
                    <h4>✍️ Manual Context</h4>
                    <div className="review-box">
                      {savedManualContext}
                    </div>
                  </div>
                ) : null}

                {/* Attachments Summary */}
                {totalAttachments > 0 ? (
                  <div className="review-subsection">
                    <h4>📎 RAG Attachments ({totalAttachments})</h4>
                    <div className="review-attachments-list">
                      {safeFiles.map((file, index) => (
                        <div key={`file-${index}`} className="review-attachment-item">
                          {getFileIcon(file)} <strong>{file?.name || 'Untitled'}</strong>
                          {file?.page_count && <span className="attachment-meta"> • {file.page_count} pages</span>}
                          {file?.slide_count && <span className="attachment-meta"> • {file.slide_count} slides</span>}
                        </div>
                      ))}
                      {safeLinks.map((link, index) => (
                        <div key={`link-${index}`} className="review-attachment-item">
                          🔗 <strong>{link?.original_url || link?.name || 'Link'}</strong>
                        </div>
                      ))}
                      {safeDocuments.map((doc, index) => (
                        <div key={`doc-${index}`} className="review-attachment-item">
                          📄 <strong>{doc?.name || 'Untitled'}</strong>
                          {doc?.content && <span className="attachment-meta"> • {doc.content.length} characters</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Empty Step 2 */}
                {!hasManualContext && totalAttachments === 0 && (
                  <div className="review-box empty-notice">
                    <em>No additional context or attachments added in Step 2</em>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="review-summary">
                <strong>Summary:</strong> The council will deliberate using your prompt
                {hasManualContext && ' + manual context'}
                {totalAttachments > 0 && ` + ${totalAttachments} RAG attachment${totalAttachments !== 1 ? 's' : ''}`}.
                {totalAttachments > 0 && ' The RAG system will intelligently retrieve relevant information during deliberation.'}
              </div>
            </div>

            <div className="review-modal-actions">
              <button
                type="button"
                className="review-modal-btn cancel"
                onClick={() => setShowReviewModal(false)}
              >
                ← Go Back & Edit
              </button>
              <button
                type="button"
                className="review-modal-btn confirm"
                onClick={handleConfirmPackage}
                disabled={isLoading}
              >
                {isLoading ? 'Packaging...' : '✓ Confirm & Package'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package bar - same for all rounds when context not yet packaged */}
      {!finalizedContext && (
        <div className="package-context-bar sticky-bottom">
          <div className="package-bar-content">
            <div className="package-bar-text">
              <strong>Ready to proceed?</strong>
              <p>
                {totalAttachments > 0 && hasManualContext
                  ? `You have ${totalAttachments} RAG attachment${totalAttachments !== 1 ? 's' : ''} and manual context. `
                  : totalAttachments > 0
                  ? `You have ${totalAttachments} RAG attachment${totalAttachments !== 1 ? 's' : ''}. `
                  : hasManualContext
                  ? 'You have manual context saved. '
                  : 'You can add attachments or context, or '}Click Package to review and finalize.
              </p>
            </div>
            <button
              className="package-button large"
              onClick={handlePackageContext}
              disabled={isLoading}
            >
              {isLoading ? 'Packaging...' : '→ Review & Package'}
            </button>
          </div>
        </div>
      )}

      {/* When packaged: completion bar with Continue + Edit & Re-package (same for all rounds) */}
      {finalizedContext && (
        <div className="step-transition-bar sticky-bottom">
          <div className="transition-content">
            <div className="transition-text">
              <strong>✓ Context packaged!</strong>
              <p>Review your prompt and context, then proceed to council deliberation in Step 3.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                type="button"
                className="edit-prompt-button"
                onClick={handlePackageContext}
                disabled={isLoading}
                style={{ marginRight: '8px' }}
              >
                Edit & Re-package
              </button>
              <button
                className="proceed-button large"
                onClick={async () => {
                  if (onReloadConversation) {
                    await onReloadConversation();
                  }
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
              >
                → Continue to Review & Step 3
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
