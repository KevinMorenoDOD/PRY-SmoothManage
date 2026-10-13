interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

const strengthLabels = ['', 'Very weak', 'Weak', 'Good', 'Strong'];
const strengthColors = ['', '#d65c52', '#b9871f', '#2a8f89', '#2a8f89'];

export function PasswordStrengthMeter({ password, className = '' }: PasswordStrengthMeterProps) {
  const calculateStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^\w\s]/.test(pwd) || pwd.length >= 14) score++;
    return Math.min(score, 4);
  };

  const strength = calculateStrength(password);
  const showMeter = password.length > 0;

  if (!showMeter) {
    return null;
  }

  return (
    <div className={`meter ${className}`} role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4} aria-label="Password strength">
      {[1, 2, 3, 4].map((level) => (
        <i
          key={level}
          className={`strength-bar ${level <= strength ? `filled-${level}` : ''}`}
          style={{
            backgroundColor: level <= strength ? strengthColors[level] : 'var(--sf2)',
            transition: 'background 0.2s',
          }}
        />
      ))}
      <small className="strength-label" style={{ color: strengthColors[strength] }}>
        {strengthLabels[strength]}
      </small>
    </div>
  );
}