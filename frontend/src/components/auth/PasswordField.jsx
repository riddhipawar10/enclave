import { useState } from "react";
import "./PasswordField.css";

/**
 * PasswordField
 *
 * Reusable password input with a show/hide toggle.
 * Built specifically for password fields, since InputField's
 * plain "password" type doesn't support a visibility toggle.
 *
 * IMPORTANT:
 * - This component holds NO API logic.
 * - This component holds NO authentication logic.
 * - It never logs or stores the password value anywhere —
 *   it only forwards value/onChange to the parent form.
 *
 * Props:
 * - label       (string)   text shown above the input (default: "Password")
 * - name        (string)   used for id, htmlFor, and the input's name attribute
 * - value       (string)   controlled input value
 * - onChange    (function) change handler from parent form
 * - placeholder (string)   optional placeholder text
 * - error       (string)   optional validation error message
 * - required    (bool)     marks field as required
 * - disabled    (bool)     disables the input
 */
function PasswordField({
  label = "Password",
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
}) {
  // Local UI state only — controls whether the password is
  // shown as plain text or masked. This never touches the
  // actual password value itself.
  const [showPassword, setShowPassword] = useState(false);

  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="password-field">
      {label && (
        <label htmlFor={inputId} className="password-field__label">
          {label}
          {required && <span className="password-field__required"> *</span>}
        </label>
      )}

      <div className="password-field__wrapper">
        <input
          id={inputId}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="current-password"
          className={`password-field__input ${
            error ? "password-field__input--error" : ""
          }`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
        />

        <button
          type="button"
          onClick={toggleShowPassword}
          disabled={disabled}
          className="password-field__toggle"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {error && (
        <p id={errorId} className="password-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default PasswordField;