import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getSprint,
  updateSprint,
} from "../../services/sprintService";

import "./EditSprint.css";

function EditSprint() {
  const {
    organizationId,
    projectId,
    sprintId,
  } = useParams();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    status: "PLANNED",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSprint = async () => {
      try {
        setError("");
        setIsLoading(true);

        const sprint = await getSprint(
          organizationId,
          projectId,
          sprintId
        );

        setFormData({
          name: sprint.name || "",
          goal: sprint.goal || "",
          startDate: sprint.startDate || "",
          endDate: sprint.endDate || "",
          status: sprint.status || "PLANNED",
        });
      } catch (err) {
        console.error("Failed to load sprint:", err);

        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error;

        setError(
          backendMessage ||
            "Failed to load sprint."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSprint();
  }, [
    organizationId,
    projectId,
    sprintId,
  ]);

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
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    if (!formData.status) {
      setError("Sprint status is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      await updateSprint(
        organizationId,
        projectId,
        sprintId,
        {
          name: formData.name.trim(),
          goal: formData.goal.trim(),
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
        }
      );

      navigate("/sprints");
    } catch (err) {
      console.error("Failed to update sprint:", err);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      setError(
        backendMessage ||
          "Failed to update sprint. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-sprint-page">
        <p>Loading sprint...</p>
      </div>
    );
  }

  return (
    <div className="edit-sprint-page">
      <div className="edit-sprint-header">
        <button
          type="button"
          className="edit-sprint-back-button"
          onClick={() => navigate("/sprints")}
        >
          &larr; Back to Sprints
        </button>

        <h1>Edit Sprint</h1>

        <p>
          Update the sprint details, dates, or status.
        </p>
      </div>

      <form
        className="edit-sprint-form"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="edit-sprint-error">
            {error}
          </div>
        )}

        <div className="edit-sprint-field">
          <label htmlFor="name">
            Sprint Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            maxLength={150}
            disabled={isSubmitting}
          />
        </div>

        <div className="edit-sprint-field">
          <label htmlFor="goal">
            Sprint Goal
          </label>

          <textarea
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            maxLength={500}
            rows={5}
            disabled={isSubmitting}
          />
        </div>

        <div className="edit-sprint-date-grid">
          <div className="edit-sprint-field">
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

          <div className="edit-sprint-field">
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

        <div className="edit-sprint-field">
          <label htmlFor="status">
            Status
          </label>

          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="PLANNED">
              Planned
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>

        <div className="edit-sprint-actions">
          <button
            type="button"
            className="edit-sprint-cancel-button"
            onClick={() => navigate("/sprints")}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="edit-sprint-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditSprint;