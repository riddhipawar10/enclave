import { useState } from "react";
import ErrorMessage from "../common/ErrorMessage";
import "./RoleForm.css";

/**
 * RoleForm
 *
 * Reusable form for creating/editing a role. Matches
 * CreateRoleRequest / UpdateRoleRequest exactly: { name, description }.
 * Field limits match roles table: name VARCHAR(50), description VARCHAR(255).
 */
function RoleForm({ initialData, onSubmit, submitLabel = "Save" }) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Role name is required.";
    } else if (name.trim().length > 50) {
      newErrors.name = "Name must be 50 characters or fewer.";
    }

    if (description.trim().length > 255) {
      newErrors.description = "Description must be 255 characters or fewer.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const formData = { name: name.trim(), description: description.trim() };

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="role-form" onSubmit={handleSubmit} noValidate>
      <div className="role-form-group">
        <label htmlFor="role-name">Role Name</label>
        <input
          id="role-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. PROJECT_LEAD"
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
        />
        <ErrorMessage message={errors.name} />
      </div>

      <div className="role-form-group">
        <label htmlFor="role-description">Description</label>
        <textarea
          id="role-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description of this role"
          rows={4}
          disabled={isSubmitting}
          aria-invalid={!!errors.description}
        />
        <ErrorMessage message={errors.description} />
      </div>

      <button type="submit" className="role-form-submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default RoleForm;