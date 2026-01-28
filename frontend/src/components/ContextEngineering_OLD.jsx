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
  onReloadConversation,
  isLoading,
}) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎯 ContextEngineering: COMPONENT RENDERING');
  console.log('   Props received:', {
    conversationId,
    hasFinalizedPrompt: !!finalizedPrompt,
    finalizedPromptLength: finalizedPrompt?.length || 0,
    messagesCount: Array.isArray(messages) ? messages.length : 'NOT_ARRAY',
    documentsCount: Array.isArray(documents) ? documents.length : 'NOT_ARRAY',
    filesCount: Array.isArray(files) ? files.length : 'NOT_ARRAY',
    linksCount: Array.isArray(links) ? links.length : 'NOT_ARRAY',
    hasFinalizedContext: !!finalizedContext,
    isLoading
  });
  console.log('═══════════════════════════════════════════════════════════');
  
  const [input, setInput] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(finalizedPrompt || '');
  const fileInputRef = useRef(null);

  // Sync editedPrompt when finalizedPrompt prop changes
  useEffect(() => {
    console.log('🔄 ContextEngineering useEffect: finalizedPrompt changed:', {
      hasFinalizedPrompt: !!finalizedPrompt,
      finalizedPromptLength: finalizedPrompt?.length || 0,
      editingPrompt
    });
    if (finalizedPrompt && !editingPrompt) {
      setEditedPrompt(finalizedPrompt);
    }
  }, [finalizedPrompt, editingPrompt]);
  
  // Log component mount/unmount
  useEffect(() => {
    console.log('✅ ContextEngineering: Component mounted');
    return () => {
      console.log('🔴 ContextEngineering: Component unmounting');
    };
  }, []);

  const handleSubmit = async () => {
    if (input.trim() && !isLoading) {
      await onSendMessage(input);
      setInput('');
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
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      await onUploadFile(file);
      // Reset file input
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
    try {
      await onPackageContext();
    } catch (error) {
      console.error('Failed to package context:', error);
      alert(`Error packaging context: ${error.message || 'Unknown error'}`);
    }
  };

  // Validate props to prevent rendering errors - must be before using them
  const safeMessages = Array.isArray(messages) ? messages : [];
  const safeDocuments = Array.isArray(documents) ? documents : [];
  const safeFiles = Array.isArray(files) ? files : [];
  const safeLinks = Array.isArray(links) ? links : [];

  const totalAttachments = (safeDocuments.length || 0) + (safeFiles.length || 0) + (safeLinks.length || 0);

  // Helper function to get file icon
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

  // Helper function to get file preview (first few lines of content)
  const getFilePreview = (file) => {
    const content = file?.content || '';
    if (!content) return 'No content preview available';
    const preview = content.substring(0, 150).replace(/\n/g, ' ').trim();
    return preview + (content.length > 150 ? '...' : '');
  };

  const handleSavePrompt = async () => {
    if (editedPrompt.trim() && onEditPrompt) {
      await onEditPrompt(editedPrompt.trim());
      setEditingPrompt(false);
    }
  };

  // Ensure we always have valid props
  if (!conversationId) {
    console.error('ContextEngineering: Missing conversationId prop');
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
          <strong>Upload documents, presentations, and research materials</strong> that will be intelligently analyzed and used to enhance your council's responses. The system will automatically extract relevant information when needed.
        </p>
      </div>

      {/* PRIMARY FEATURE: RAG Document Upload Zone */}
      <div className="rag-upload-hero">
        <div className="upload-hero-header">
          <h2>📁 Upload Documents for Intelligent Analysis</h2>
          <p className="upload-hero-subtitle">
            The council will automatically analyze your documents and retrieve relevant information to provide more informed, context-aware responses.
          </p>
        </div>

        {/* Large Upload Zone */}
        <div 
          className="large-upload-zone"
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
          <div className="upload-zone-content">
            <div className="upload-icon">📤</div>
            <h3>Drop files here or click to upload</h3>
            <p className="upload-zone-hint">Supports multiple file formats</p>
            
            <div className="supported-formats">
              <div className="format-badge">
                <span className="format-icon">📊</span>
                <span className="format-name">PowerPoint</span>
                <span className="format-ext">.ppt, .pptx</span>
              </div>
              <div className="format-badge">
                <span className="format-icon">📝</span>
                <span className="format-name">Word</span>
                <span className="format-ext">.doc, .docx</span>
              </div>
              <div className="format-badge">
                <span className="format-icon">📄</span>
                <span className="format-name">PDF</span>
                <span className="format-ext">.pdf</span>
              </div>
              <div className="format-badge">
                <span className="format-icon">📈</span>
                <span className="format-name">Excel</span>
                <span className="format-ext">.xls, .xlsx</span>
              </div>
              <div className="format-badge">
                <span className="format-icon">📃</span>
                <span className="format-name">Text</span>
                <span className="format-ext">.txt, .md</span>
              </div>
            </div>

            {uploadingFile && (
              <div className="upload-progress">
                <div className="spinner"></div>
                <span>Uploading and processing...</span>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv"
          />
        </div>

        {/* Additional Options */}
        <div className="additional-attachment-options">
          <button
            type="button"
            className="option-button link-button"
            onClick={() => setShowLinkForm(!showLinkForm)}
          >
            <span className="option-icon">🔗</span>
            <span>Add Web Link</span>
          </button>
          <button
            type="button"
            className="option-button document-button"
            onClick={() => setShowDocumentForm(!showDocumentForm)}
          >
            <span className="option-icon">✍️</span>
            <span>Paste Text Document</span>
          </button>
        </div>

        {/* Link Form */}
        {showLinkForm && (
          <form className="inline-form link-form" onSubmit={handleAddLink}>
            <input
              type="url"
              className="inline-input"
              placeholder="https://example.com/article"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
              autoFocus
            />
            <button type="submit" className="inline-submit">Add</button>
            <button type="button" className="inline-cancel" onClick={() => setShowLinkForm(false)}>Cancel</button>
          </form>
        )}

        {/* Document Form */}
        {showDocumentForm && (
          <form className="inline-form document-form-inline" onSubmit={handleAddDocument}>
            <input
              type="text"
              className="inline-input"
              placeholder="Document name..."
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              required
            />
            <textarea
              className="inline-textarea"
              placeholder="Paste your text content here..."
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              rows={6}
              required
            />
            <div className="inline-actions">
              <button type="submit" className="inline-submit">Add Document</button>
              <button type="button" className="inline-cancel" onClick={() => setShowDocumentForm(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Show Attached Files */}
      {totalAttachments > 0 && (
        <div className="attachments-summary">
          <h3>📎 Attached Documents ({totalAttachments})</h3>
          <p className="attachments-summary-hint">These documents will be analyzed and used to enhance council responses</p>
        <div className="section-header-with-icon">
          <h3>✍️ Additional Context (Optional)</h3>
          <span className="section-badge">Direct Text - Not RAG</span>
        </div>
        <p className="context-hint">
          Add clarifications, constraints, background information, or guidelines that will be <strong>directly combined</strong> with your prompt above.
        </p>
        <p className="context-hint-secondary">
          💡 <em>This is for text context you want included verbatim, not for documents that need intelligent retrieval.</em>
        </p>
        
        {/* Expandable context text area */}
        <div className="context-text-input-wrapper">
          <textarea
            className="context-text-input"
            placeholder="Example: Focus on technical accuracy, consider budget constraints, assume audience is beginner level, prioritize practical solutions over theoretical ones..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
          />
          {input.trim() && (
            <div className="context-input-actions">
              <button
                type="button"
                className="add-context-button"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : '+ Add This Context'}
              </button>
              <button
                type="button"
                className="clear-context-button"
                onClick={() => setInput('')}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Show added context messages */}
        {safeMessages.length > 0 && (
          <div className="added-context-preview">
            <h4>📌 Context Added:</h4>
            <div className="context-messages-list">
              {safeMessages.map((msg, index) => {
                if (!msg || !msg.content) return null;
                return (
                  <div key={index} className="context-message-item">
                    <div className="context-message-label">
                      {msg.role === 'user' ? 'Your Context' : 'AI Response'}
                    </div>
                    <div className="context-message-text">
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="section-separator">
        <div className="separator-line"></div>
        <span className="separator-text">OR</span>
        <div className="separator-line"></div>
      </div>

      {/* RAG Attachments Section - For Documents That Will Be Chunked */}
      <div className="attachments-section">
        <div className="section-header-with-icon">
          <h3>📎 RAG Attachments (Optional)</h3>
          <span className="section-badge rag-badge">Intelligent Retrieval</span>
        </div>
        <p className="attachments-hint">
          Upload documents, add links, or paste large text that will be <strong>automatically chunked and indexed</strong>. Only the most relevant parts will be retrieved during deliberation.
        </p>
        <div className="rag-benefit-box">
          <strong>✨ Why use RAG?</strong> Perfect for large documents, research papers, or reference materials. The system will intelligently find and include only the relevant sections based on your prompt.
        </div>
        <div className="attachments-header">
          <h3>Attachments ({totalAttachments})</h3>
          <div className="attachment-buttons">
            <button
              type="button"
              className="upload-file-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
            >
              {uploadingFile ? 'Uploading...' : '📎 Upload File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv"
            />
            <button
              type="button"
              className="add-link-button"
              onClick={() => setShowLinkForm(!showLinkForm)}
            >
              🔗 Add Link
            </button>
            <button
              type="button"
              className="add-document-button"
              onClick={() => setShowDocumentForm(!showDocumentForm)}
            >
              {showDocumentForm ? 'Cancel' : '+ Add Text Document'}
            </button>
          </div>
        </div>

        {/* Link Form */}
        {showLinkForm && (
          <form className="link-form" onSubmit={handleAddLink}>
            <input
              type="url"
              className="link-url-input"
              placeholder="https://example.com/article"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
            />
            <button type="submit" className="submit-link-button">
              Add Link
            </button>
          </form>
        )}

        {/* Document Form */}
        {showDocumentForm && (
          <form className="document-form" onSubmit={handleAddDocument}>
            <input
              type="text"
              className="document-name-input"
              placeholder="Document name..."
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              required
            />
            <textarea
              className="document-content-input"
              placeholder="Document content..."
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              rows={8}
              required
            />
            <button type="submit" className="submit-document-button">
              Add Document
            </button>
          </form>
        )}

        {/* Files List */}
        {safeFiles && safeFiles.length > 0 && (
          <div className="files-list">
            <h4>Uploaded Files ({safeFiles.length})</h4>
            <div className="files-grid">
              {safeFiles.map((file, index) => {
                if (!file) return null;
                const fileName = file?.name || file?.get?.('name') || 'Untitled';
                const fileType = file?.type || file?.get?.('type') || 'unknown';
                const preview = getFilePreview(file);
                return (
                  <div key={index} className="file-item with-preview">
                    <div className="file-icon-large">{getFileIcon(file)}</div>
                    <div className="file-info">
                      <div className="file-name">{fileName}</div>
                      <div className="file-type-badge">{fileType.toUpperCase()}</div>
                      {file?.page_count && <div className="file-meta">📑 {file.page_count} pages</div>}
                      {file?.slide_count && <div className="file-meta">🎞️ {file.slide_count} slides</div>}
                      {file?.content && (
                        <div className="file-preview-text" title={preview}>
                          {preview}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Links List */}
        {safeLinks && safeLinks.length > 0 && (
          <div className="links-list">
            <h4>External Links ({safeLinks.length})</h4>
            <ul>
              {safeLinks.map((link, index) => {
                if (!link) return null;
                const linkUrl = link?.original_url || link?.name || link?.get?.('original_url') || link?.get?.('name') || '#';
                const linkText = link?.original_url || link?.name || link?.get?.('original_url') || link?.get?.('name') || 'Link';
                return (
                  <li key={index}>
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {linkText}
                    </a>
                    {link?.error && <span className="error-badge">Error</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Documents List */}
        {safeDocuments && safeDocuments.length > 0 && (
          <div className="documents-list">
            <h4>Text Documents ({safeDocuments.length})</h4>
            <div className="documents-grid">
              {safeDocuments.map((doc, index) => {
                if (!doc) return null;
                const docName = doc?.name || doc?.get?.('name') || 'Untitled';
                const docContent = doc?.content || doc?.get?.('content') || '';
                const preview = docContent.substring(0, 200);
                return (
                  <div key={index} className="document-item with-preview">
                    <div className="document-icon">📄</div>
                    <div className="document-content-wrapper">
                      <div className="document-name">{docName}</div>
                      <div className="document-preview">
                        {preview}
                        {docContent.length > 200 && '...'}
                      </div>
                      <div className="document-meta">
                        {docContent.length} characters • Ready for RAG
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>


      {finalizedContext && (
        <>
          <div className="finalized-section">
            <h3>✓ Step 2 Complete: Context Packaged</h3>
            <div className="step-completion-info">
              <p className="info-text">
                Excellent! Your context is ready{safeMessages.length > 0 && ' with direct context text'}{totalAttachments > 0 && safeMessages.length > 0 && ' and '}{totalAttachments > 0 && <strong>{totalAttachments} RAG attachment{totalAttachments !== 1 ? 's' : ''}</strong>}.
                {totalAttachments > 0 && ' The RAG system will intelligently retrieve relevant chunks when needed.'}
              </p>
            </div>
          </div>
          <div className="step-transition-bar sticky-bottom">
            <div className="transition-content">
              <div className="transition-text">
                <strong>✓ Context packaged!</strong>
                <p>Review your prompt and context, then proceed to council deliberation in Step 3.</p>
              </div>
              <button
                className="proceed-button large"
                onClick={async () => {
                  // The state update should have already happened when context was packaged
                  // Just reload conversation to ensure we have the latest state
                  // This stays in the same window - no page reload
                  if (onReloadConversation) {
                    await onReloadConversation();
                  }
                  // Scroll to top smoothly
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
              >
                → Continue to Review & Step 3
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Always visible package button bar - shown when context is not yet finalized */}
      {!finalizedContext && (
        <div className="package-context-bar sticky-bottom">
          <div className="package-bar-content">
            <div className="package-bar-text">
              <strong>Ready to proceed?</strong>
              <p>
                {safeMessages.length > 0 && totalAttachments > 0 
                  ? `You have context text and ${totalAttachments} RAG attachment${totalAttachments !== 1 ? 's' : ''}. `
                  : safeMessages.length > 0
                  ? 'You have added context text. '
                  : totalAttachments > 0 
                  ? `You have ${totalAttachments} RAG attachment${totalAttachments !== 1 ? 's' : ''}. `
                  : 'You can add context text and/or RAG attachments, or '}
                Package to finalize and continue to Review & Step 3.
              </p>
            </div>
            <button
              className="package-button large"
              onClick={handlePackageContext}
              disabled={isLoading}
            >
              {isLoading ? 'Packaging...' : '→ Package & Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
