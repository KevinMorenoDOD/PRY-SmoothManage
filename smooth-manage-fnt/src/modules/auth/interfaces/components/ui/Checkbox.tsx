import { useId } from 'react';

interface CheckboxProps {
  id?: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Checkbox({ id: providedId, label, checked, onChange, error, disabled = false, required = false }: CheckboxProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const hasError = Boolean(error);

  return (
    <div className="ck">
      <label htmlFor={id} className="checkbox-label">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          required={required}
          className="checkbox-input"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
        />
        <i className="checkbox-custom" aria-hidden="true" />
        <span className="checkbox-text">{label}</span>
      </label>
      {error && (
        <small id={errorId} className="err" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}