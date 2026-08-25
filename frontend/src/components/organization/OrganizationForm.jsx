import  { useState } from "react";
import ErrorMessage from "../common/ErrorMessage";
import "./OrganizationForm.css";

function OrganizationForm({ initialData, onSubmit, submitLabel = "Save", isEditMode = false }) {
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isActive, setIsActive] = useState(
    initialData?.isActive !== undefined ? initialData.isActive : true
  );

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    if (!isEditMode) {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generatedSlug);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Organization name is required.";
    } else if (name.trim().length > 150) {
      newErrors.name = "Name must be 150 characters or fewer.";
    }

    if (!slug.trim()) {
      newErrors.slug = "Slug is required.";
    } else if (slug.trim().length > 150) {
      newErrors.slug = "Slug must be 150 characters or fewer.";
    } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.trim())) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens.";
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

    const formData = { name: name.trim(), slug: slug.trim(), isActive };

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="organization-form" onSubmit={handleSubmit} noValidate>
      <div className="organization-form-group">
        <label htmlFor="org-name">Organization Name</label>
        <input
          id="org-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="e.g. Acme Corporation"
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
        />
        <ErrorMessage message={errors.name} />
      </div>

      <div className="organization-form-group">
        <label htmlFor="org-slug">Slug</label>
        <input
          id="org-slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. acme-corporation"
          disabled={isSubmitting}
          aria-invalid={!!errors.slug}
        />
        <small>Used in URLs. Must be unique, lowercase, hyphen-separated.</small>
        <ErrorMessage message={errors.slug} />
      </div>

      {isEditMode && (
        <div className="organization-form-group organization-form-checkbox">
          <label htmlFor="org-active">
            <input
              id="org-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isSubmitting}
            />
            Active
          </label>
        </div>
      )}

      <button type="submit" className="organization-form-submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default OrganizationForm;