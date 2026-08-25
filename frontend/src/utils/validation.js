// src/utils/validation.js
//
// Client-side validation only — this exists to give the user fast,
// friendly feedback before a request is even sent. It is NOT a
// security boundary and does not replace backend validation. The
// Spring Boot backend (via Jakarta Bean Validation on RegisterRequest/
// LoginRequest) is still the final authority on what's actually
// accepted — always keep handling the backend's own error responses
// too, even if a form passes every check here.

// ---- Individual field validators ----
// Each returns a string error message, or null when the value is valid.

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return "Email is required";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) {
    return "Enter a valid email address";
  }

  return null;
}

export function validatePassword(password, { minLength = 8 } = {}) {
  if (!password) {
    return "Password is required";
  }

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }

  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return "Please confirm your password";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
}

export function validateName(name, fieldLabel = "Name") {
  if (!name || !name.trim()) {
    return `${fieldLabel} is required`;
  }

  if (name.trim().length < 2) {
    return `${fieldLabel} must be at least 2 characters`;
  }

  return null;
}

// ---- Form-level validators ----
// Each takes the form's raw values and returns an errors object.
// A field is only present in the returned object if it actually has
// an error — check with `Object.keys(errors).length === 0` to see if
// the whole form is valid.

/**
 * Validates a registration form.
 * @param {{ firstName: string, lastName: string, email: string, password: string, confirmPassword: string }} values
 * @returns {Object} errors keyed by field name
 */
export function validateRegisterForm(values) {
  const errors = {};

  const firstNameError = validateName(values.firstName, "First name");
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = validateName(values.lastName, "Last name");
  if (lastNameError) errors.lastName = lastNameError;

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(values.password, values.confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return errors;
}

/**
 * Validates a login form.
 * @param {{ email: string, password: string }} values
 * @returns {Object} errors keyed by field name
 */
export function validateLoginForm(values) {
  const errors = {};

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  // Login only needs to confirm a password was entered — length rules
  // apply to choosing a new password at registration, not to checking
  // an existing one against the backend.
  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
}

/**
 * Small helper so components can write:
 *   if (isFormValid(errors)) { ... }
 * instead of repeating Object.keys(errors).length === 0 everywhere.
 */
export function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}