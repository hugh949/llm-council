import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ProgressIndicator from './ProgressIndicator';
import './ReviewStage.css';

export default function ReviewStage({
  finalizedPrompt,
  documents,
  files,
  links,
  packagedContext,
  onEditPrompt,
  onEditContext,
  onProceedToCouncil,
  isProceeding,
}) {
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(finalizedPrompt);
  const [editingContext, setEditingContext] = useState(false);
  const [editedContext, setEditedContext] = useState(packagedContext);

  const handleSavePrompt = () => {
    onEditPrompt(editedPrompt);
    setEditingPrompt(false);
  };

  const handleSaveContext = () => {
    onEditContext(editedContext);
    setEditingContext(false);
  };

  return (
    <div className="review-stage">
      <ProgressIndicator 
        currentStep={2}
        step1Complete={true}
        step2Complete={false}
      />
      <div className="review-header">
        <h2>Final Review — What Will Be Sent to the Council</h2>
        <p className="review-description">
          Review exactly what will be sent for council deliberation. Edit the prompt or packaged context if needed, then proceed when ready.
        </p>
        <div className="review-info-banner">
          <strong>This is what the council will receive:</strong> Your prompt, manually provided context, and relevant excerpts from your attachments (via RAG). Verify everything looks correct before proceeding.
        </div>
      </div>

      <div className="review-content">
        {/* Prompt Section */}
        <div className="review-section">
          <div className="section-header">
            <h3>Finalized Prompt</h3>
            {!editingPrompt && (
              <button
                className="edit-button"
                onClick={() => setEditingPrompt(true)}
              >
                Edit
              </button>
            )}
          </div>
          {editingPrompt ? (
            <div className="edit-section">
              <textarea
                className="edit-textarea"
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                rows={8}
              />
              <div className="edit-actions">
                <button className="save-button" onClick={handleSavePrompt}>
                  Save
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setEditedPrompt(finalizedPrompt);
                    setEditingPrompt(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="section-content">
              <ReactMarkdown>{finalizedPrompt}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Context Summary */}
        <div className="review-section">
          <div className="section-header">
            <h3>Context Summary</h3>
          </div>
          <div className="section-content">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Text Documents:</span>
                <span className="stat-value">{documents.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Uploaded Files:</span>
                <span className="stat-value">{files.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">External Links:</span>
                <span className="stat-value">{links.length}</span>
              </div>
            </div>

            {documents.length > 0 && (
              <div className="items-list">
                <h4>Text Documents:</h4>
                <ul>
                  {documents.map((doc, index) => (
                    <li key={index}>{doc.name || doc.get?.('name') || 'Untitled'}</li>
                  ))}
                </ul>
              </div>
            )}

            {files.length > 0 && (
              <div className="items-list">
                <h4>Uploaded Files:</h4>
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>
                      {file.name || file.get?.('name') || 'Untitled'} ({file.type || file.get?.('type') || 'unknown'})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {links.length > 0 && (
              <div className="items-list">
                <h4>External Links:</h4>
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
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Packaged Context Preview */}
        <div className="review-section">
          <div className="section-header">
            <h3>Packaged Context Preview</h3>
            {!editingContext && (
              <button
                className="edit-button"
                onClick={() => setEditingContext(true)}
              >
                Edit
              </button>
            )}
          </div>
          {editingContext ? (
            <div className="edit-section">
              <textarea
                className="edit-textarea"
                value={editedContext}
                onChange={(e) => setEditedContext(e.target.value)}
                rows={15}
              />
              <div className="edit-actions">
                <button className="save-button" onClick={handleSaveContext}>
                  Save
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setEditedContext(packagedContext);
                    setEditingContext(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="section-content packaged-context-preview">
              <ReactMarkdown>{packagedContext}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* Proceed Button */}
      <div className="review-actions">
        <button
          className="proceed-button"
          onClick={onProceedToCouncil}
          disabled={isProceeding}
        >
          {isProceeding ? 'Starting Council Deliberation...' : 'Proceed to Council Deliberation'}
        </button>
      </div>
    </div>
  );
}

