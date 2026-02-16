import ReactMarkdown from 'react-markdown';
import './Stage3.css';

export default function Stage3({ finalResponse }) {
  if (!finalResponse) {
    return null;
  }

  // Normalize format (object with model/response, or string from storage)
  const normalized = typeof finalResponse === 'object' && finalResponse !== null && 'response' in finalResponse
    ? finalResponse
    : { model: 'unknown', response: String(finalResponse || 'No response') };

  const isError = normalized.model === 'error' || 
                  (normalized.response && String(normalized.response).startsWith('Error:'));
  
  const modelName = normalized.model === 'error' 
    ? 'Error' 
    : (normalized.model.split('/')[1] || normalized.model);

  return (
    <div className={`stage stage3 stage3-final-deliberation ${isError ? 'stage3-error' : ''}`}>
      <h3 className="stage-title stage3-main-title">
        {isError ? '⚠️ Synthesis Error' : '🏆 Final Council Deliberation'}
      </h3>
      <div className={`final-response ${isError ? 'error-response' : ''}`}>
        <div className="chairman-label">
          {isError ? 'Error' : `Chairman: ${modelName}`}
        </div>
        <div className="final-text markdown-content">
          {isError && (
            <div className="error-banner">
              <strong>⚠️ Synthesis Failed</strong>
              <p>The chairman model encountered an error. Please see details below and try again.</p>
            </div>
          )}
          <ReactMarkdown>{normalized.response}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
