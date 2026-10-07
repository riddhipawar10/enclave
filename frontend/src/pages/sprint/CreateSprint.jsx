import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { createSprint } from "../../services/sprintService";

import "./CreateSprint.css";

function CreateSprint() {
  const { organizationId, projectId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Sprint name is required.");
      return;
    }

    if (!formData.startDate) {
      setError("Start date is required.");
      return;
    }

    if (!formData.endDate) {
      setError("End date is required.");
      return;
    }

    if (formData.endDate < formData.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createSprint(
        organizationId,
        projectId,
        {
          name: formData.name.trim(),
          goal: formData.goal.trim(),
          startDate: formData.startDate,
          endDate: formData.endDate,
        }
      );

      navigate("/sprints");
    } catch (err) {
      console.error("Failed to create sprint:", err);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      setError(
        backendMessage ||
          "Failed to create sprint. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-sprint-page">
      <div className="create-sprint-header">
        <button
          type="button"
          className="create-sprint-back-button"
          onClick={() => navigate("/sprints")}
        >
          &larr; Back to Sprints
        </button>

        <h1>Create Sprint</h1>

        <p>
          Create a new sprint and define the work period and
          goal for your team.
        </p>
      </div>

      <form
        className="create-sprint-form"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="create-sprint-error">
            {error}
          </div>
        )}

        <div className="create-sprint-field">
          <label htmlFor="name">
            Sprint Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Sprint 2"
            maxLength={150}
            disabled={isSubmitting}
          />
        </div>

        <div className="create-sprint-field">
          <label htmlFor="goal">
            Sprint Goal
          </label>

          <textarea
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            placeholder="What should the team accomplish during this sprint?"
            maxLength={500}
            rows={5}
            disabled={isSubmitting}
          />
        </div>

        <div className="create-sprint-date-grid">
          <div className="create-sprint-field">
            <label htmlFor="startDate">
              Start Date
            </label>

            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="create-sprint-field">
            <label htmlFor="endDate">
              End Date
            </label>

            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="create-sprint-actions">
          <button
            type="button"
            className="create-sprint-cancel-button"
            onClick={() => navigate("/sprints")}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="create-sprint-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating..."
              : "Create Sprint"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSprint;