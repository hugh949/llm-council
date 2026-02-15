import ReactMarkdown from 'react-markdown';
import './Stage3.css';

export default function Stage3({ finalResponse }) {
  if (!finalResponse) {
    return null;
  }

  const isError = finalResponse.model === 'error' || 
                  (finalResponse.response && finalResponse.response.startsWith('Error:'));
  
  const modelName = finalResponse.model === 'error' 
    ? 'Error' 
    : (finalResponse.model.split('/')[1] || finalResponse.model);

  return (
    <div className={`stage stage3 ${isError ? 'stage3-error' : ''}`}>
      <h3 className="stage-title">
        {isError ? '⚠️ Synthesis Error' : 'Final Council Answer'}
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
          <ReactMarkdown>{finalResponse.response}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
