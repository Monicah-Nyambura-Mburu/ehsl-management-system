import { useState } from "react";
import { supabase } from "../supabaseClient";
import RepairDetails from "./RepairDetails";

function Employees({
  employees,
  setEmployees,
  repairs,
  setRepairs,
}) {
  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [selectedPeriod, setSelectedPeriod] =
    useState("October 2026");

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const [selectedRepair, setSelectedRepair] =
    useState(null);

  const [newEmployee, setNewEmployee] =
    useState({
      name: "",
      department: "",
      role: "",
    });

  /*
   * =========================================================
   * HANDLE INPUT
   * =========================================================
   */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewEmployee((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * =========================================================
   * ADD EMPLOYEE
   * =========================================================
   */

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (
      !newEmployee.name.trim() ||
      !newEmployee.department.trim() ||
      !newEmployee.role.trim()
    ) {
      alert("Please fill in all employee details.");
      return;
    }

    const newId = `EMP${String(
      employees.length + 1
    ).padStart(3, "0")}`;

    const employeeToAdd = {
      id: newId,
      name: newEmployee.name.trim(),
      department: newEmployee.department,
      role: newEmployee.role.trim(),
    };

    const { data, error } = await supabase
      .from("employees")
      .insert([employeeToAdd])
      .select()
      .single();

    if (error) {
      console.error(
        "Error adding employee:",
        error
      );

      alert(
        `Could not add employee: ${error.message}`
      );

      return;
    }

    setEmployees((previous) => [
      ...previous,
      data,
    ]);

    setNewEmployee({
      name: "",
      department: "",
      role: "",
    });

    setShowAddForm(false);
  };

  /*
   * =========================================================
   * START EDITING EMPLOYEE
   * =========================================================
   */

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);

    setNewEmployee({
      name: employee.name || "",
      department: employee.department || "",
      role: employee.role || "",
    });

    setShowAddForm(false);
  };

  /*
   * =========================================================
   * UPDATE EMPLOYEE
   * =========================================================
   */

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();

    if (!editingEmployee) {
      return;
    }

    if (
      !newEmployee.name.trim() ||
      !newEmployee.department.trim() ||
      !newEmployee.role.trim()
    ) {
      alert("Please fill in all employee details.");
      return;
    }

    const updatedEmployee = {
      name: newEmployee.name.trim(),
      department: newEmployee.department,
      role: newEmployee.role.trim(),
    };

    const { data, error } = await supabase
      .from("employees")
      .update(updatedEmployee)
      .eq("id", editingEmployee.id)
      .select()
      .single();

    if (error) {
      console.error(
        "Error updating employee:",
        error
      );

      alert(
        `Could not update employee: ${error.message}`
      );

      return;
    }

    setEmployees((previous) =>
      previous.map((employee) =>
        employee.id === editingEmployee.id
          ? data
          : employee
      )
    );

    if (
      selectedEmployee &&
      selectedEmployee.id === editingEmployee.id
    ) {
      setSelectedEmployee(data);
    }

    setEditingEmployee(null);

    setNewEmployee({
      name: "",
      department: "",
      role: "",
    });
  };

  /*
   * =========================================================
   * CANCEL EDITING
   * =========================================================
   */

  const handleCancelEdit = () => {
    setEditingEmployee(null);

    setNewEmployee({
      name: "",
      department: "",
      role: "",
    });
  };

  /*
   * =========================================================
   * PERFORMANCE
   * =========================================================
   *
   * Maximum score = 80 points
   *
   * Jobs Completed              = 30 points
   * Jobs Completed On Time      = 25 points
   * Successful Repairs          = 25 points
   */

  const calculatePerformance = (employee) => {
    const employeeRepairs = repairs.filter((repair) => {
      if (repair.engineer !== employee.name) {
        return false;
      }

      if (!repair.dateReceived) {
        return false;
      }

      const repairDate = new Date(
        repair.dateReceived
      );

      const repairPeriod =
        repairDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

      return repairPeriod === selectedPeriod;
    });

    /*
     * =====================================================
     * COMPLETED JOBS
     * =====================================================
     */

    const completedRepairs =
      employeeRepairs.filter(
        (repair) =>
          repair.status === "Completed" ||
          repair.status === "Collected"
      );

    /*
     * =====================================================
     * PENDING JOBS
     * =====================================================
     */

    const pendingRepairs =
      employeeRepairs.filter(
        (repair) =>
          repair.status !== "Completed" &&
          repair.status !== "Collected"
      );

    /*
     * =====================================================
     * COMPLETED ON TIME
     * =====================================================
     */

    const completedOnTime =
      completedRepairs.filter((repair) => {
        if (
          !repair.completedDate ||
          !repair.dueDate
        ) {
          return false;
        }

        return (
          repair.completedDate <=
          repair.dueDate
        );
      });

    /*
     * =====================================================
     * PERFORMANCE NUMBERS
     * =====================================================
     */

    const totalJobs =
      employeeRepairs.length;

    const jobsCompleted =
      completedRepairs.length;

    const jobsOnTime =
      completedOnTime.length;

    /*
     * For now, every completed/collected repair
     * counts as a successfully completed repair.
     */

    const successfulRepairs =
      completedRepairs.length;

    /*
     * =====================================================
     * SCORE 1
     * JOBS COMPLETED = 30 POINTS
     * =====================================================
     */

    const completionScore =
      totalJobs > 0
        ? (jobsCompleted / totalJobs) * 30
        : 0;

    /*
     * =====================================================
     * SCORE 2
     * JOBS COMPLETED ON TIME = 25 POINTS
     * =====================================================
     */

    const onTimeScore =
      jobsCompleted > 0
        ? (jobsOnTime / jobsCompleted) * 25
        : 0;

    /*
     * =====================================================
     * SCORE 3
     * SUCCESSFUL REPAIRS = 25 POINTS
     * =====================================================
     */

    const successfulRepairScore =
      jobsCompleted > 0
        ? (successfulRepairs / jobsCompleted) * 25
        : 0;

    /*
     * =====================================================
     * TOTAL PERFORMANCE SCORE
     * =====================================================
     */

    const performanceScore =
      completionScore +
      onTimeScore +
      successfulRepairScore;

    return {
      allJobs: employeeRepairs,
      pendingJobs: pendingRepairs,
      completedJobs: completedRepairs,
      jobsCompleted,
      jobsOnTime,
      repairsCompleted:
        successfulRepairs,

      completionScore:
        completionScore.toFixed(2),

      onTimeScore:
        onTimeScore.toFixed(2),

      successfulRepairScore:
        successfulRepairScore.toFixed(2),

      performanceScore:
        performanceScore.toFixed(2),

      bonusTier: "X",
      bonusPercentage: "X",
      bonusAmount: "X",
    };
  };

  /*
   * =========================================================
   * STATUS UPDATE FROM EMPLOYEE PROFILE
   * =========================================================
   */

  const handleRepairStatusChange = (
    newStatus
  ) => {
    if (!selectedRepair) {
      return;
    }

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const newHistoryEntry = {
      status: newStatus,
      date: today,
      note: `Repair status changed to ${newStatus}`,
    };

    setRepairs((previous) =>
      previous.map((item) => {
        if (
          item.id !== selectedRepair.id
        ) {
          return item;
        }

        return {
          ...item,

          status: newStatus,

          completedDate:
            newStatus === "Completed"
              ? today
              : item.completedDate,

          history: [
            ...(item.history || []),
            newHistoryEntry,
          ],
        };
      })
    );

    setSelectedRepair((previous) => ({
      ...previous,

      status: newStatus,

      completedDate:
        newStatus === "Completed"
          ? today
          : previous.completedDate,

      history: [
        ...(previous.history || []),
        newHistoryEntry,
      ],
    }));
  };

  /*
   * =========================================================
   * EMPLOYEE PROFILE
   * =========================================================
   */

  if (selectedEmployee) {
    const performance =
      calculatePerformance(
        selectedEmployee
      );

    return (
      <div className="employee-page">

        {/* BACK BUTTON */}

        <button
          className="back-button"
          onClick={() => {
            setSelectedEmployee(null);

            setSelectedPeriod(
              "October 2026"
            );
          }}
        >
          ← Back to Employees
        </button>

        {/* PROFILE HEADER */}

        <div className="profile-header">

          <div className="profile-avatar">
            {selectedEmployee.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h1>
              {selectedEmployee.name}
            </h1>

            <p>
              {selectedEmployee.role} •{" "}
              {selectedEmployee.department}
            </p>

            <span>
              Employee ID:{" "}
              {selectedEmployee.id}
            </span>
          </div>

        </div>

        {/* EMPLOYEE INFORMATION */}

        <div className="profile-section">

          <h2>
            Employee Information
          </h2>

          <div className="information-grid">

            <div className="information-item">

              <span>
                Employee
              </span>

              <strong>
                {selectedEmployee.name}
              </strong>

            </div>

            <div className="information-item">

              <span>
                Employee ID
              </span>

              <strong>
                {selectedEmployee.id}
              </strong>

            </div>

            <div className="information-item">

              <span>
                Department
              </span>

              <strong>
                {selectedEmployee.department}
              </strong>

            </div>

            <div className="information-item">

              <span>
                Role
              </span>

              <strong>
                {selectedEmployee.role}
              </strong>

            </div>

          </div>

        </div>

        {/* PERFORMANCE */}

        <div className="profile-section">

          <div className="section-title">

            <div>

              <h2>
                Performance
              </h2>

              <p>
                Employee performance for
                the selected period
              </p>

            </div>

            <div className="period-selector">

              <label>
                Performance Period
              </label>

              <select
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(
                    e.target.value
                  )
                }
              >

                <option>
                  October 2026
                </option>

                <option>
                  September 2026
                </option>

                <option>
                  August 2026
                </option>

                <option>
                  July 2026
                </option>

              </select>

            </div>

          </div>

          <div className="performance-grid">

            <div className="performance-card">

              <span>
                Jobs Completed
              </span>

              <strong>
                {
                  performance.jobsCompleted
                }
              </strong>

            </div>

            <div className="performance-card">

              <span>
                Jobs Completed On Time
              </span>

              <strong>
                {
                  performance.jobsOnTime
                }
              </strong>

            </div>

            <div className="performance-card">

              <span>
                Repairs Successfully Completed
              </span>

              <strong>
                {
                  performance.repairsCompleted
                }
              </strong>

            </div>

          </div>

        </div>

        {/* =====================================================
            PERFORMANCE SCORE BREAKDOWN
        ===================================================== */}

        <div className="profile-section">

          <div className="section-title">

            <div>

              <h2>
                Performance Score
              </h2>

              <p>
                Score breakdown for the
                selected performance period
              </p>

            </div>

          </div>

          <div className="bonus-grid">

            <div className="bonus-item">

              <span>
                Jobs Completed
              </span>

              <strong>
                {
                  performance.completionScore
                }{" "}
                / 30
              </strong>

            </div>

            <div className="bonus-item">

              <span>
                Completed On Time
              </span>

              <strong>
                {
                  performance.onTimeScore
                }{" "}
                / 25
              </strong>

            </div>

            <div className="bonus-item">

              <span>
                Successful Repairs
              </span>

              <strong>
                {
                  performance.successfulRepairScore
                }{" "}
                / 25
              </strong>

            </div>

            <div className="bonus-item performance-total">

              <span>
                Total Performance Score
              </span>

              <strong>
                {performance.performanceScore} / 80

                <span className="performance-percentage">
                  (
                  {Math.round(
                    (Number(
                      performance.performanceScore
                    ) / 80) *
                      100
                  )}
                  %)
                </span>
              </strong>

              <div className="performance-progress">

                <div
                  className="performance-progress-fill"
                  style={{
                    width: `${
                      (Number(
                        performance.performanceScore
                      ) / 80) *
                      100
                    }%`,
                  }}
                ></div>

              </div>

            </div>

          </div>

        </div>

        {/* PERFORMANCE & BONUS */}

        <div className="profile-section">

          <h2>
            Performance & Bonus
          </h2>

          <div className="bonus-grid">

            <div className="bonus-item">

              <span>
                Performance Score
              </span>

              <strong>
                {
                  performance.performanceScore
                }{" "}
                / 80
              </strong>

            </div>

            <div className="bonus-item">

              <span>
                Bonus Tier
              </span>

              <strong>
                X
              </strong>

            </div>

            <div className="bonus-item">

              <span>
                Bonus %
              </span>

              <strong>
                X
              </strong>

            </div>

            <div className="bonus-item">

              <span>
                Bonus Amount
              </span>

              <strong>
                X
              </strong>

            </div>

          </div>

        </div>

        {/* =====================================================
            PENDING JOBS
        ===================================================== */}

        <div className="profile-section">

          <div className="section-title">

            <div>

              <h2>
                Pending Jobs
              </h2>

              <p>
                Repairs currently assigned
                to this employee
              </p>

            </div>

          </div>

          {performance.pendingJobs.length ===
          0 ? (

            <p className="empty-state">
              No pending jobs for this
              period.
            </p>

          ) : (

            <div className="employee-jobs-list">

              {performance.pendingJobs.map(
                (repair) => (

                  <div
                    key={repair.id}
                    className="employee-card"
                    onClick={() =>
                      setSelectedRepair(
                        repair
                      )
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >

                    <div className="employee-info">

                      <h2>
                        {repair.id}
                      </h2>

                      <p>
                        {repair.client} •{" "}
                        {repair.equipment}
                      </p>

                      <span>
                        Engineer:{" "}
                        {repair.engineer}
                      </span>

                    </div>

                    <div className="employee-stats">

                      <div>

                        <strong>
                          {repair.status}
                        </strong>

                        <span>
                          Status
                        </span>

                      </div>

                      <div>

                        <strong>
                          {repair.dueDate ||
                            "—"}
                        </strong>

                        <span>
                          Due Date
                        </span>

                      </div>

                    </div>

                    <button
                      className="view-profile-btn"
                      onClick={(e) => {
                        e.stopPropagation();

                        setSelectedRepair(
                          repair
                        );
                      }}
                    >
                      View Repair
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* =====================================================
            COMPLETED JOBS
        ===================================================== */}

        <div className="profile-section">

          <div className="section-title">

            <div>

              <h2>
                Completed Jobs
              </h2>

              <p>
                Repairs completed during
                the selected period
              </p>

            </div>

          </div>

          {performance.completedJobs
            .length === 0 ? (

            <p className="empty-state">
              No completed jobs for this
              period.
            </p>

          ) : (

            <div className="employee-jobs-list">

              {performance.completedJobs.map(
                (repair) => (

                  <div
                    key={repair.id}
                    className="employee-card"
                    onClick={() =>
                      setSelectedRepair(
                        repair
                      )
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >

                    <div className="employee-info">

                      <h2>
                        {repair.id}
                      </h2>

                      <p>
                        {repair.client} •{" "}
                        {repair.equipment}
                      </p>

                      <span>
                        {repair.completedDate
                          ? `Completed: ${repair.completedDate}`
                          : "Completed"}
                      </span>

                    </div>

                    <div className="employee-stats">

                      <div>

                        <strong>
                          {repair.status}
                        </strong>

                        <span>
                          Status
                        </span>

                      </div>

                      <div>

                        <strong>
                          {repair.dueDate ||
                            "—"}
                        </strong>

                        <span>
                          Due Date
                        </span>

                      </div>

                    </div>

                    <button
                      className="view-profile-btn"
                      onClick={(e) => {
                        e.stopPropagation();

                        setSelectedRepair(
                          repair
                        );
                      }}
                    >
                      View Repair
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* =====================================================
            REPAIR DETAILS
        ===================================================== */}

        {selectedRepair && (

          <RepairDetails
            repair={selectedRepair}
            onClose={() =>
              setSelectedRepair(null)
            }
            onStatusChange={
              handleRepairStatusChange
            }
          />

        )}

      </div>
    );
  }

  /*
   * =========================================================
   * EMPLOYEE LIST
   * =========================================================
   */

  return (
    <div className="employee-page">

      {/* HEADER */}

      <div className="employee-header">

        <div>
        </div>

        <button
          className="add-employee-btn"
          onClick={() => {
            setEditingEmployee(null);

            setNewEmployee({
              name: "",
              department: "",
              role: "",
            });

            setShowAddForm(true);
          }}
        >
          + Add Employee
        </button>

      </div>

      {/* =====================================================
          ADD / EDIT EMPLOYEE FORM
      ===================================================== */}

      {(showAddForm || editingEmployee) && (

        <div className="add-employee-form">

          <div className="form-header">

            <div>

              <h2>
                {editingEmployee
                  ? "Edit Employee"
                  : "Add Employee"}
              </h2>

              <p>
                {editingEmployee
                  ? "Update employee information"
                  : "Create a new employee profile"}
              </p>

            </div>

            <button
              type="button"
              className="close-form-btn"
              onClick={() => {
                if (editingEmployee) {
                  handleCancelEdit();
                } else {
                  setShowAddForm(false);

                  setNewEmployee({
                    name: "",
                    department: "",
                    role: "",
                  });
                }
              }}
            >
              ×
            </button>

          </div>

          <form
            onSubmit={
              editingEmployee
                ? handleUpdateEmployee
                : handleAddEmployee
            }
          >

            {/* NAME */}

            <div className="form-group">

              <label>
                Employee Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter employee name"
                value={
                  newEmployee.name
                }
                onChange={
                  handleInputChange
                }
              />

            </div>

            {/* DEPARTMENT */}

            <div className="form-group">

              <label>
                Department
              </label>

              <select
                name="department"
                value={
                  newEmployee.department
                }
                onChange={
                  handleInputChange
                }
              >

                <option value="">
                  Select department
                </option>

                <option value="Technical">
                  Technical
                </option>

                <option value="Management">
                  Management
                </option>

                <option value="Finance">
                  Finance
                </option>

                <option value="Sales">
                  Sales
                </option>

                <option value="Administration">
                  Administration
                </option>

              </select>

            </div>

            {/* ROLE */}

            <div className="form-group">

              <label>
                Role
              </label>

              <input
                type="text"
                name="role"
                placeholder="e.g. Engineer"
                value={
                  newEmployee.role
                }
                onChange={
                  handleInputChange
                }
              />

            </div>

            {/* BUTTONS */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-employee-btn"
                onClick={() => {
                  if (editingEmployee) {
                    handleCancelEdit();
                  } else {
                    setShowAddForm(false);

                    setNewEmployee({
                      name: "",
                      department: "",
                      role: "",
                    });
                  }
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-employee-btn"
              >
                {editingEmployee
                  ? "Save Changes"
                  : "Create Employee"}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* =====================================================
          EMPLOYEE LIST
      ===================================================== */}

      <div className="employee-list">

        {employees.map((employee) => {

          const performance =
            calculatePerformance(
              employee
            );

          return (
            <div
              className="employee-card"
              key={employee.id}
            >

              {/* AVATAR */}

              <div className="employee-avatar">

                {employee.name
                  .charAt(0)
                  .toUpperCase()}

              </div>

              {/* EMPLOYEE INFORMATION */}

              <div className="employee-info">

                <h2>
                  {employee.name}
                </h2>

                <p>
                  {employee.role} •{" "}
                  {employee.department}
                </p>

                <span>
                  {employee.id}
                </span>

              </div>

              {/* EMPLOYEE STATS */}

              <div className="employee-stats">

                <div>

                  <strong>
                    {
                      performance.jobsCompleted
                    }
                  </strong>

                  <span>
                    Jobs Completed
                  </span>

                </div>

                <div>

                  <strong>
                    {
                      performance.jobsOnTime
                    }
                  </strong>

                  <span>
                    On Time
                  </span>

                </div>

                <div>

                  <strong>
                    {
                      performance.repairsCompleted
                    }
                  </strong>

                  <span>
                    Successful Repairs
                  </span>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="employee-card-actions">

                <button
                  className="edit-employee-btn"
                  onClick={() =>
                    handleEditEmployee(
                      employee
                    )
                  }
                >
                  Edit
                </button>

                <button
                  className="view-profile-btn"
                  onClick={() => {
                    setSelectedEmployee(
                      employee
                    );

                    setSelectedPeriod(
                      "October 2026"
                    );
                  }}
                >
                  View Profile
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Employees;