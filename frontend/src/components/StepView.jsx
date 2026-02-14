import ReactMarkdown from 'react-markdown';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import './StepView.css';
import './ChatInterface.css'; // Import ChatInterface styles for consistent council UI

export default function StepView({ step, conversation, onBack, onStartRefinement }) {
  if (!conversation) {
    return (
      <div className="step-view">
        <div className="empty-state">No conversation selected</div>
      </div>
    );
  }

  const promptEng = conversation.prompt_engineering || {};
  const contextEng = conversation.context_engineering || {};
  const councilDelib = conversation.council_deliberation || {};

  const renderStepContent = () => {
    switch (step) {
      case 'step1':
        if (!promptEng.finalized_prompt) {
          return (
            <div className="step-empty">
              <p>Step 1 has not been completed yet.</p>
              <p className="hint">Start by describing what you want to achieve.</p>
            </div>
          );
        }
        return (
          <div className="step-content-full">
            <div className="step-header-full">
              <span className="step-badge">Step 1</span>
              <h2>Prompt Engineering</h2>
            </div>
            <div className="content-section">
              <h3>Finalized Prompt</h3>
              <div className="content-body">
                <ReactMarkdown>{promptEng.finalized_prompt}</ReactMarkdown>
              </div>
            </div>
            {promptEng.messages && promptEng.messages.length > 0 && (
              <div className="content-section">
                <h3>Conversation History</h3>
                <div className="messages-list">
                  {promptEng.messages.map((msg, idx) => (
                    <div key={idx} className={`message-item ${msg.role}`}>
                      <div className="message-role">{msg.role === 'user' ? 'You' : 'Assistant'}</div>
                      <div className="message-text">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'step2':
        if (!contextEng.finalized_context) {
          return (
            <div className="step-empty">
              <p>Step 2 has not been completed yet.</p>
              <p className="hint">Add documents, files, or links to build context.</p>
            </div>
          );
        }
        return (
          <div className="step-content-full">
            <div className="step-header-full">
              <span className="step-badge">Step 2</span>
              <h2>Context Engineering</h2>
            </div>
            
            {/* Summary */}
            <div className="content-section">
              <h3>Context Summary</h3>
              <div className="summary-grid">
                {contextEng.documents?.length > 0 && (
                  <div className="summary-card">
                    <div className="summary-icon">📄</div>
                    <div className="summary-count">{contextEng.documents.length}</div>
                    <div className="summary-label">Text Document{contextEng.documents.length !== 1 ? 's' : ''}</div>
                  </div>
                )}
                {contextEng.files?.length > 0 && (
                  <div className="summary-card">
                    <div className="summary-icon">📎</div>
                    <div className="summary-count">{contextEng.files.length}</div>
                    <div className="summary-label">File{contextEng.files.length !== 1 ? 's' : ''}</div>
                  </div>
                )}
                {contextEng.links?.length > 0 && (
                  <div className="summary-card">
                    <div className="summary-icon">🔗</div>
                    <div className="summary-count">{contextEng.links.length}</div>
                    <div className="summary-label">Link{contextEng.links.length !== 1 ? 's' : ''}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents List */}
            {contextEng.documents && contextEng.documents.length > 0 && (
              <div className="content-section">
                <h3>Text Documents</h3>
                {contextEng.documents.map((doc, idx) => (
                  <div key={idx} className="document-card">
                    <div className="document-name">{doc.name || 'Untitled'}</div>
                    <div className="document-content">
                      <ReactMarkdown>{doc.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Files List */}
            {contextEng.files && contextEng.files.length > 0 && (
              <div className="content-section">
                <h3>Uploaded Files</h3>
                {contextEng.files.map((file, idx) => (
                  <div key={idx} className="file-card">
                    <div className="file-header">
                      <span className="file-name">{file.name || 'Untitled'}</span>
                      <span className="file-type">{file.type || 'unknown'}</span>
                    </div>
                    {file.content && (
                      <div className="file-content">
                        <ReactMarkdown>{file.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Links List */}
            {contextEng.links && contextEng.links.length > 0 && (
              <div className="content-section">
                <h3>External Links</h3>
                {contextEng.links.map((link, idx) => (
                  <div key={idx} className="link-card">
                    <a href={link.original_url || link.name} target="_blank" rel="noopener noreferrer" className="link-url">
                      {link.original_url || link.name}
                    </a>
                    {link.content && (
                      <div className="link-content">
                        <ReactMarkdown>{link.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Manually Typed Context - Highest Priority */}
            {contextEng.messages && contextEng.messages.filter(msg => msg.role === 'user').length > 0 && (
              <div className="content-section priority-section">
                <h3>📝 Manually Provided Context (Priority: High)</h3>
                <p className="section-note">This context was manually typed during the conversation and will be prioritized in Step 3.</p>
                <div className="messages-list">
                  {contextEng.messages
                    .filter(msg => msg.role === 'user')
                    .map((msg, idx) => (
                      <div key={idx} className="message-item user priority-message">
                        <div className="message-role">You</div>
                        <div className="message-text">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Packaged Context */}
            {contextEng.finalized_context && (
              <div className="content-section">
                <h3>📦 Packaged Context (Ready for Step 3)</h3>
                <p className="section-note">This is the complete context that will be sent to the Council Deliberation, ordered by priority.</p>
                <div className="content-body packaged-context">
                  <ReactMarkdown>{contextEng.finalized_context}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Assistant Messages (for reference) */}
            {contextEng.messages && contextEng.messages.filter(msg => msg.role === 'assistant').length > 0 && (
              <div className="content-section">
                <h3>💬 Assistant Responses</h3>
                <div className="messages-list">
                  {contextEng.messages
                    .filter(msg => msg.role === 'assistant')
                    .map((msg, idx) => (
                      <div key={idx} className="message-item assistant">
                        <div className="message-role">Context Assistant</div>
                        <div className="message-text">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'step3':
        if (!councilDelib.messages || councilDelib.messages.length === 0) {
          return (
            <div className="step-empty">
              <p>Step 3 has not been completed yet.</p>
              <p className="hint">Start the council deliberation to see results.</p>
            </div>
          );
        }
        
        // Format conversation for ChatInterface component (same structure)
        const formattedConversation = {
          ...conversation,
          messages: councilDelib.messages || []
        };
        
        const hasStage3Results = councilDelib.messages.some((msg) => msg.role === 'assistant' && msg.stage3);
        
        return (
          <div className="step-view-council">
            <div className="step-header-full">
              <span className="step-badge">Step 3</span>
              <h2>Council Deliberation</h2>
              {hasStage3Results && onStartRefinement && (
                <button
                  type="button"
                  className="refine-button"
                  onClick={() => {
                    onStartRefinement();
                    onBack();
                  }}
                >
                  Refine prompt & context
                </button>
              )}
            </div>
            <div className="council-messages-container">
              {formattedConversation.messages.map((msg, index) => {
                // Skip user messages in Step 3 view - they contain the full context
                // which is already shown in Step 2, so we don't need to repeat it
                if (msg.role === 'user') {
                  return null;
                } else if (msg.role === 'assistant') {
                  return (
                    <div key={index} className="message-group">
                      <div className="assistant-message">
                        <div className="message-label">LLM Council</div>

                        {/* Stage 1 */}
                        {msg.stage1 && <Stage1 responses={msg.stage1} />}

                        {/* Stage 2 */}
                        {msg.stage2 && (
                          <Stage2
                            rankings={msg.stage2}
                            labelToModel={msg.metadata?.label_to_model}
                            aggregateRankings={msg.metadata?.aggregate_rankings}
                          />
                        )}

                        {/* Stage 3 */}
                        {msg.stage3 && (
                          <Stage3 
                            finalResponse={
                              typeof msg.stage3 === 'object' && msg.stage3 !== null && 'model' in msg.stage3
                                ? msg.stage3
                                : { model: 'unknown', response: String(msg.stage3 || 'No response') }
                            } 
                          />
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        );

      default:
        return <div className="step-empty">Invalid step</div>;
    }
  };

  return (
    <div className="step-view">
      <div className="step-view-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Conversation
        </button>
      </div>
      <div className="step-view-content">
        {renderStepContent()}
      </div>
    </div>
  );
}

