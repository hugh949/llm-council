import './ProgressIndicator.css';

export default function ProgressIndicator({ currentStep, step1Complete, step2Complete, step3Complete }) {
  const getStepStatus = (step) => {
    if (step === 1) return step1Complete ? 'completed' : currentStep === 1 ? 'active' : 'pending';
    if (step === 2) return step2Complete ? 'completed' : currentStep === 2 ? 'active' : 'pending';
    if (step === 3) return step3Complete ? 'completed' : currentStep === 3 ? 'active' : 'pending';
    return 'pending';
  };

  const StepCircle = ({ step, status, label }) => (
    <div className={`progress-step ${status}`}>
      <div className="step-circle">
        {status === 'completed' ? (
          <span className="step-checkmark">✓</span>
        ) : (
          <span className="step-number">{step}</span>
        )}
      </div>
      <div className="step-label">{label}</div>
    </div>
  );

  return (
    <div className="progress-indicator">
      <StepCircle step={1} status={getStepStatus(1)} label="Prompt Engineering" />
      <div className={`progress-line ${getStepStatus(2) !== 'pending' || getStepStatus(1) === 'completed' ? 'active' : ''}`} />
      <StepCircle step={2} status={getStepStatus(2)} label="Context Engineering" />
      <div className={`progress-line ${getStepStatus(3) !== 'pending' || getStepStatus(2) === 'completed' ? 'active' : ''}`} />
      <StepCircle step={3} status={getStepStatus(3)} label="Council Deliberation" />
    </div>
  );
}
