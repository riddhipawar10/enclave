import React from "react";
import "./InputField.css";

/**
 * InputField
 *
 * Reusable, accessible form input for authentication forms
 * (Login, Register, Forgot Password, etc).
 *
 * IMPORTANT:
 * - This component holds NO API logic.
 * - This component holds NO authentication logic.
 * - It only renders a labeled input and displays a validation
 *   error message if one is passed in. All logic (validation
 *   rules, submit handling, API calls) belongs to the parent form.
 *
 * Props:
 * - label       (string)   text shown above the input
 * - name        (string)   used for id, htmlFor, and the input's name attribute
 * - type        (string)   "text" | "email" | "password" | etc. (default: "text")
 * - value       (string)   controlled input value
 * - onChange    (function) change handler from parent form
 * - placeholder (string)   optional placeholder text
 * - error       (string)   optional validation error message
 * - required    (bool)     marks field as required
 * - disabled    (bool)     disables the input
 */
function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
}) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="input-field">
      {label && (
        <label htmlFor={inputId} className="input-field__label">
          {label}
          {required && <span className="input-field__required"> *</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input-field__input ${error ? "input-field__input--error" : ""}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
      />

      {error && (
        <p id={errorId} className="input-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default InputField;