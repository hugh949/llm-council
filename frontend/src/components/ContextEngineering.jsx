import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import ProgressIndicator from './ProgressIndicator';
import './ContextEngineering.css';

export default function ContextEngineering({
  conversationId,
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
  onReloadConversation,
  isLoading,
}) {
  const [input, setInput] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

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

  const totalAttachments = (documents?.length || 0) + (files?.length || 0) + (links?.length || 0);

  // Helper function to get file icon
  const getFileIcon = (file) => {
    const type = (file.type || '').toLowerCase();
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
    const content = file.content || '';
    if (!content) return 'No content preview available';
    const preview = content.substring(0, 150).replace(/\n/g, ' ').trim();
    return preview + (content.length > 150 ? '...' : '');
  };

  return (
    <div className="context-engineering">
      <ProgressIndicator 
        currentStep={2}
        step1Complete={true}
        step2Complete={!!finalizedContext}
        step3Complete={false}
      />
      <div className="stage-header">
        <h2>Step 2: Context Engineering</h2>
        <p className="stage-description">
          Add relevant context, documents, and background information. The system uses RAG (Retrieval-Augmented Generation) to intelligently retrieve and use the most relevant parts of your attachments when answering your prompt.
        </p>
        <div className="rag-info-banner">
          <strong>💡 How RAG Works:</strong> Your documents are automatically chunked and indexed. When the council deliberates, only the most relevant chunks are retrieved and included in the context, making responses more focused and accurate.
        </div>
      </div>

      {/* Attachments Section */}
      <div className="attachments-section">
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
        {files && files.length > 0 && (
          <div className="files-list">
            <h4>Uploaded Files ({files.length})</h4>
            <div className="files-grid">
              {files.map((file, index) => {
                const fileName = file.name || file.get?.('name') || 'Untitled';
                const fileType = file.type || file.get?.('type') || 'unknown';
                const preview = getFilePreview(file);
                return (
                  <div key={index} className="file-item with-preview">
                    <div className="file-icon-large">{getFileIcon(file)}</div>
                    <div className="file-info">
                      <div className="file-name">{fileName}</div>
                      <div className="file-type-badge">{fileType.toUpperCase()}</div>
                      {file.page_count && <div className="file-meta">📑 {file.page_count} pages</div>}
                      {file.slide_count && <div className="file-meta">🎞️ {file.slide_count} slides</div>}
                      {file.content && (
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
        {links && links.length > 0 && (
          <div className="links-list">
            <h4>External Links ({links.length})</h4>
            <ul>
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.original_url || link.name || link.get?.('original_url') || link.get?.('name')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.original_url || link.name || link.get?.('original_url') || link.get?.('name')}
                  </a>
                  {link.error && <span className="error-badge">Error</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Documents List */}
        {documents && documents.length > 0 && (
          <div className="documents-list">
            <h4>Text Documents ({documents.length})</h4>
            <div className="documents-grid">
              {documents.map((doc, index) => {
                const docName = doc.name || doc.get?.('name') || 'Untitled';
                const docContent = doc.content || doc.get?.('content') || '';
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

      {/* Messages Section */}
      <div className="messages-container">
        {messages.length === 0 && totalAttachments === 0 ? (
          <div className="empty-state">
            <p>Add files, documents, links, or describe what context would be helpful...</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-label">
                {msg.role === 'user' ? 'You' : 'Context Assistant'}
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

      {finalizedContext ? (
        <>
          <div className="finalized-section">
            <h3>✓ Step 2 Complete: Context Packaged</h3>
            <div className="step-completion-info">
              <p className="info-text">
                Excellent! Your context is ready with <strong>{totalAttachments} attachment{totalAttachments !== 1 ? 's' : ''}</strong>.
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
      ) : (
        <div className="input-section">
          <form onSubmit={handleSubmit} className="input-form">
            <textarea
              className="message-input"
              placeholder="Describe context, guidelines, constraints, or background information... (Shift+Enter for new line, Enter to send)"
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
            </div>
          </form>
        </div>
      )}
      
      {/* Always visible package button bar - shown when context is not yet finalized */}
      {!finalizedContext && (
        <div className="package-context-bar sticky-bottom">
          <div className="package-bar-content">
            <div className="package-bar-text">
              <strong>Ready to proceed?</strong>
              <p>
                {totalAttachments > 0 
                  ? `You have ${totalAttachments} attachment${totalAttachments !== 1 ? 's' : ''} ready. `
                  : 'You can add attachments or '}
                Package your context to continue to the Review stage and then Step 3.
              </p>
            </div>
            <button
              className="package-button large"
              onClick={handlePackageContext}
              disabled={isLoading || contextLoading}
            >
              {contextLoading ? 'Packaging...' : '→ Package Context & Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
