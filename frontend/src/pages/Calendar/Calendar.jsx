import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyOrganizations } from "../../services/organizationService";
import { getProjects } from "../../services/projectService";
import { getTasks } from "../../services/taskService";
import { getSprints } from "../../services/sprintService";

import "./Calendar.css";

const STATUS_NAMES = {
  "ef25e678-91e9-4eb8-b8a1-fce9accd840f": "TODO",
  "cf8e322b-86ed-4597-8d4c-dd17dc917273": "IN PROGRESS",
  "4e33e701-a87f-439b-801c-083c4d36d87c": "REVIEW",
  "ceceaeed-5a8f-494f-9005-8c7330eb4e35": "DONE",
};

const PRIORITY_NAMES = {
  "81f9c1a3-2793-4e4f-8a0c-51f5f79bf45a": "LOW",
  "ff8a5fd3-a10d-4bee-a79e-3f579ce2e76b": "MEDIUM",
  "ccb1a560-2cfe-4b5f-9fe3-d8af19196e55": "HIGH",
  "17153d97-f8bc-4fc6-8b41-abf279b98152": "URGENT",
};

const DONE_STATUS_ID =
  "ceceaeed-5a8f-494f-9005-8c7330eb4e35";

function Calendar() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);

  const [projectId, setProjectId] = useState("");
  const [organizationId, setOrganizationId] =
    useState("");
  const [sprintId, setSprintId] = useState("all");

  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] =
    useState(false);
  const [isLoadingSprints, setIsLoadingSprints] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * Load all projects available to the user.
   */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError("");

        const organizations =
          await getMyOrganizations();

        const allProjects = [];

        for (const organization of organizations) {
          const organizationProjects =
            await getProjects(organization.id);

          organizationProjects.forEach((project) => {
            allProjects.push({
              ...project,
              organizationId: organization.id,
            });
          });
        }

        if (allProjects.length === 0) {
          setProjects([]);
          setError("No projects found.");
          return;
        }

        setProjects(allProjects);

        const firstProject = allProjects[0];

        setProjectId(firstProject.id);
        setOrganizationId(
          firstProject.organizationId
        );
      } catch (err) {
        console.error(
          "Failed to load projects:",
          err
        );

        setError("Failed to load projects.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  /*
   * Load sprints whenever the project changes.
   */
  useEffect(() => {
    const fetchSprints = async () => {
      if (!organizationId || !projectId) {
        setSprints([]);
        setSprintId("all");
        return;
      }

      try {
        setIsLoadingSprints(true);
        setError("");

        const projectSprints = await getSprints(
          organizationId,
          projectId
        );

        setSprints(projectSprints || []);
        setSprintId("all");
      } catch (err) {
        console.error(
          "Failed to load sprints:",
          err
        );

        setSprints([]);
        setSprintId("all");

        setError(
          "Failed to load project sprints."
        );
      } finally {
        setIsLoadingSprints(false);
      }
    };

    fetchSprints();
  }, [organizationId, projectId]);

  /*
   * Load tasks whenever the project changes.
   */
  useEffect(() => {
    const fetchTasks = async () => {
      if (!organizationId || !projectId) {
        setTasks([]);
        return;
      }

      try {
        setIsLoadingTasks(true);
        setError("");

        const projectTasks = await getTasks(
          organizationId,
          projectId
        );

        setTasks(projectTasks || []);
      } catch (err) {
        console.error(
          "Failed to load tasks:",
          err
        );

        setTasks([]);

        setError(
          "Failed to load project tasks."
        );
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [organizationId, projectId]);

  /*
   * Project selector.
   */
  const handleProjectChange = (event) => {
    const selectedProjectId =
      event.target.value;

    const selectedProject = projects.find(
      (project) =>
        project.id === selectedProjectId
    );

    if (!selectedProject) {
      return;
    }

    setProjectId(selectedProject.id);

    setOrganizationId(
      selectedProject.organizationId
    );

    setSprintId("all");
    setError("");
  };

  /*
   * Sprint selector.
   */
  const handleSprintChange = (event) => {
    setSprintId(event.target.value);
    setError("");
  };

  /*
   * Filter tasks by selected sprint.
   *
   * "all" shows every task in the project.
   */
  const visibleTasks = useMemo(() => {
    if (sprintId === "all") {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        task.sprintId === sprintId
    );
  }, [tasks, sprintId]);

  /*
   * Currently selected sprint.
   */
  const selectedSprint = sprints.find(
    (sprint) =>
      sprint.id === sprintId
  );

  /*
   * Calendar month navigation.
   */
  const goToPreviousMonth = () => {
    setCurrentDate(
      (date) =>
        new Date(
          date.getFullYear(),
          date.getMonth() - 1,
          1
        )
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      (date) =>
        new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          1
        )
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  /*
   * Build all cells for the current month.
   */
  const calendarDays = useMemo(() => {
    const year =
      currentDate.getFullYear();

    const month =
      currentDate.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    );

    const lastDay = new Date(
      year,
      month + 1,
      0
    );

    const firstWeekday =
      firstDay.getDay();

    const daysInMonth =
      lastDay.getDate();

    const days = [];

    /*
     * Previous month's trailing days.
     */
    for (
      let i = firstWeekday - 1;
      i >= 0;
      i--
    ) {
      const date = new Date(
        year,
        month,
        -i
      );

      days.push({
        date,
        isCurrentMonth: false,
      });
    }

    /*
     * Current month's days.
     */
    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push({
        date: new Date(
          year,
          month,
          day
        ),
        isCurrentMonth: true,
      });
    }

    /*
     * Next month's leading days.
     */
    let nextDay = 1;

    while (days.length % 7 !== 0) {
      days.push({
        date: new Date(
          year,
          month + 1,
          nextDay
        ),
        isCurrentMonth: false,
      });

      nextDay++;
    }

    return days;
  }, [currentDate]);

  /*
   * Convert Date to YYYY-MM-DD.
   */
  const formatDateKey = (date) => {
    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /*
   * Check whether a date belongs
   * to the currently displayed month.
   */
  const isCurrentMonthDate = (date) => {
    return (
      date.getMonth() ===
        currentDate.getMonth() &&
      date.getFullYear() ===
        currentDate.getFullYear()
    );
  };

  /*
   * Group tasks by due date.
   */
  const tasksByDate = useMemo(() => {
    const grouped = {};

    visibleTasks.forEach((task) => {
      if (!task.dueDate) {
        return;
      }

      if (!grouped[task.dueDate]) {
        grouped[task.dueDate] = [];
      }

      grouped[task.dueDate].push(task);
    });

    return grouped;
  }, [visibleTasks]);

  /*
   * Calendar title.
   */
  const monthTitle =
    currentDate.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );

  /*
   * Today's date.
   */
  const todayKey =
    formatDateKey(new Date());

  /*
   * Open existing task.
   */
  const handleTaskClick = (taskId) => {
    navigate(
      `/tasks/${projectId}/${taskId}/edit`
    );
  };

  /*
   * Create a new task from a calendar date.
   *
   * The selected date is passed to
   * CreateTask through React Router state.
   */
  const handleDateClick = (date) => {
    if (!isCurrentMonthDate(date)) {
      return;
    }

    const dateKey = formatDateKey(date);

    navigate(
      `/tasks/create/${projectId}`,
      {
        state: {
          dueDate: dateKey,
          sprintId:
            sprintId !== "all"
              ? sprintId
              : "",
        },
      }
    );
  };

  /*
   * Format task date for deadline lists.
   */
  const formatTaskDate = (dateString) => {
    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    );
  };

  /*
   * Get sprint name for a task.
   */
  const getTaskSprintName = (task) => {
    if (!task.sprintId) {
      return "No Sprint";
    }

    const sprint = sprints.find(
      (item) =>
        item.id === task.sprintId
    );

    return sprint?.name || "Sprint";
  };

  /*
   * Upcoming deadlines.
   *
   * Completed tasks are excluded.
   */
  const upcomingTasks = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return visibleTasks
      .filter(
        (task) =>
          task.dueDate &&
          task.statusId !== DONE_STATUS_ID
      )
      .filter((task) => {
        const dueDate = new Date(
          `${task.dueDate}T00:00:00`
        );

        return dueDate >= today;
      })
      .sort((a, b) =>
        a.dueDate.localeCompare(
          b.dueDate
        )
      )
      .slice(0, 5);
  }, [visibleTasks]);

  /*
   * Overdue tasks.
   *
   * Completed tasks are excluded.
   */
  const overdueTasks = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return visibleTasks
      .filter(
        (task) =>
          task.dueDate &&
          task.statusId !== DONE_STATUS_ID
      )
      .filter((task) => {
        const dueDate = new Date(
          `${task.dueDate}T00:00:00`
        );

        return dueDate < today;
      })
      .sort((a, b) =>
        b.dueDate.localeCompare(
          a.dueDate
        )
      );
  }, [visibleTasks]);

  if (isLoading) {
    return (
      <div className="calendar-page">
        <p>Loading calendar...</p>
      </div>
    );
  }

  if (
    error &&
    projects.length === 0
  ) {
    return (
      <div className="calendar-page">
        <p className="calendar-error">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      {/* =========================
          HEADER
         ========================= */}

      <div className="calendar-header">
        <div>
          <h1>Calendar</h1>

          <p>
            View project tasks and
            deadlines.
          </p>

          {/* Project selector */}
          <div className="calendar-project-selector">
            <label htmlFor="calendar-project">
              Project
            </label>

            <select
              id="calendar-project"
              value={projectId}
              onChange={
                handleProjectChange
              }
            >
              {projects.map(
                (project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name ||
                      "Unnamed Project"}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Sprint selector */}
          <div className="calendar-project-selector">
            <label htmlFor="calendar-sprint">
              Sprint
            </label>

            <select
              id="calendar-sprint"
              value={sprintId}
              onChange={
                handleSprintChange
              }
              disabled={
                isLoadingSprints
              }
            >
              <option value="all">
                All Sprints
              </option>

              {sprints.map(
                (sprint) => (
                  <option
                    key={sprint.id}
                    value={sprint.id}
                  >
                    {sprint.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="calendar-today-button"
          onClick={goToToday}
        >
          Today
        </button>
      </div>

      {/* =========================
          SPRINT INFORMATION
         ========================= */}

      {selectedSprint && (
        <div className="calendar-sprint-info">
          <strong>
            {selectedSprint.name}
          </strong>

          {selectedSprint.goal && (
            <span>
              {selectedSprint.goal}
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="calendar-error">
          {error}
        </p>
      )}

      {/* =========================
          CALENDAR
         ========================= */}

      <div className="calendar-card">
        <div className="calendar-toolbar">
          <button
            type="button"
            onClick={
              goToPreviousMonth
            }
            aria-label="Previous month"
          >
            ‹
          </button>

          <h2>{monthTitle}</h2>

          <button
            type="button"
            onClick={
              goToNextMonth
            }
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {isLoadingTasks ||
        isLoadingSprints ? (
          <div className="calendar-loading">
            Loading calendar...
          </div>
        ) : (
          <div className="calendar-grid">
            {calendarDays.map(
              ({
                date,
                isCurrentMonth,
              }) => {
                const dateKey =
                  formatDateKey(date);

                const dayTasks =
                  tasksByDate[
                    dateKey
                  ] || [];

                const isToday =
                  dateKey ===
                  todayKey;

                return (
                  <div
                    key={dateKey}
                    className={`calendar-day ${
                      isCurrentMonth
                        ? ""
                        : "calendar-day-outside"
                    } ${
                      isToday
                        ? "calendar-day-today"
                        : ""
                    }`}
                    onDoubleClick={() =>
                      handleDateClick(
                        date
                      )
                    }
                    title={
                      isCurrentMonth
                        ? "Double-click to create a task"
                        : ""
                    }
                  >
                    <div className="calendar-day-number">
                      {date.getDate()}
                    </div>

                    <div className="calendar-day-tasks">
                      {dayTasks.map(
                        (task) => (
                          <button
                            type="button"
                            key={
                              task.id
                            }
                            className="calendar-task"
                            onClick={() =>
                              handleTaskClick(
                                task.id
                              )
                            }
                            title={`${task.title} - ${
                              STATUS_NAMES[
                                task
                                  .statusId
                              ] ||
                              "Unknown"
                            }`}
                          >
                            <span className="calendar-task-title">
                              {
                                task.title
                              }
                            </span>

                            <span className="calendar-task-meta">
                              {PRIORITY_NAMES[
                                task
                                  .priorityId
                              ] ||
                                "UNKNOWN"}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* =========================
          UPCOMING DEADLINES
         ========================= */}

      <div className="calendar-section">
        <div className="calendar-section-header">
          <div>
            <h2>Upcoming Deadlines</h2>

            <p>
              Tasks that are due soon.
            </p>
          </div>

          <span className="calendar-section-count">
            {upcomingTasks.length}
          </span>
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="calendar-section-empty">
            No upcoming deadlines.
          </div>
        ) : (
          <div className="calendar-deadline-list">
            {upcomingTasks.map(
              (task) => (
                <button
                  type="button"
                  key={task.id}
                  className="calendar-deadline-card"
                  onClick={() =>
                    handleTaskClick(
                      task.id
                    )
                  }
                >
                  <div className="calendar-deadline-date">
                    {formatTaskDate(
                      task.dueDate
                    )}
                  </div>

                  <div className="calendar-deadline-content">
                    <strong>
                      {task.title}
                    </strong>

                    <span>
                      {PRIORITY_NAMES[
                        task.priorityId
                      ] || "UNKNOWN"}{" "}
                      ·{" "}
                      {STATUS_NAMES[
                        task.statusId
                      ] || "UNKNOWN"}{" "}
                      ·{" "}
                      {getTaskSprintName(
                        task
                      )}
                    </span>
                  </div>
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* =========================
          OVERDUE TASKS
         ========================= */}

      <div className="calendar-section calendar-overdue-section">
        <div className="calendar-section-header">
          <div>
            <h2>Overdue Tasks</h2>

            <p>
              Tasks that are past their
              due date and not completed.
            </p>
          </div>

          <span className="calendar-section-count calendar-overdue-count">
            {overdueTasks.length}
          </span>
        </div>

        {overdueTasks.length === 0 ? (
          <div className="calendar-section-empty">
            No overdue tasks. Great job!
          </div>
        ) : (
          <div className="calendar-deadline-list">
            {overdueTasks.map(
              (task) => (
                <button
                  type="button"
                  key={task.id}
                  className="calendar-deadline-card calendar-overdue-card"
                  onClick={() =>
                    handleTaskClick(
                      task.id
                    )
                  }
                >
                  <div className="calendar-deadline-date">
                    {formatTaskDate(
                      task.dueDate
                    )}
                  </div>

                  <div className="calendar-deadline-content">
                    <strong>
                      {task.title}
                    </strong>

                    <span>
                      {PRIORITY_NAMES[
                        task.priorityId
                      ] || "UNKNOWN"}{" "}
                      ·{" "}
                      {STATUS_NAMES[
                        task.statusId
                      ] || "UNKNOWN"}{" "}
                      ·{" "}
                      {getTaskSprintName(
                        task
                      )}
                    </span>
                  </div>
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* =========================
          SUMMARY
         ========================= */}

      <div className="calendar-summary">
        <strong>
          Tasks with due dates:
        </strong>{" "}
        {
          visibleTasks.filter(
            (task) =>
              Boolean(task.dueDate)
          ).length
        }
      </div>
    </div>
  );
}

export default Calendar;