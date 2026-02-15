import './ProgressIndicator.css';

export default function ProgressIndicator({ prepared, deliberated }) {
  const step1Status = prepared ? 'completed' : 'active';
  const step2Status = deliberated ? 'completed' : (prepared ? 'active' : 'pending');

  const StepCircle = ({ status, label }) => (
    <div className={`progress-step ${status}`}>
      <div className="step-circle">
        {status === 'completed' ? (
          <span className="step-checkmark">✓</span>
        ) : (
          <span className="step-dot" aria-hidden="true">•</span>
        )}
      </div>
      <div className="step-label">{label}</div>
    </div>
  );

  return (
    <div className="progress-indicator">
      <StepCircle status={step1Status} label="Prepare for Council" />
      <div className={`progress-line ${step2Status !== 'pending' || step1Status === 'completed' ? 'active' : ''}`} />
      <StepCircle status={step2Status} label="Council Deliberation" />
    </div>
  );
}
