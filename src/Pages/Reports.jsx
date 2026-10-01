import { useState } from "react";

function Reports({
  equipment,
  repairs = [],
  employees = [],
}) {
  // =========================
  // INVENTORY CALCULATIONS
  // =========================

  const totalEquipment = equipment.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const goodCondition = equipment
    .filter((item) => item.condition === "Good")
    .reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  const faultyEquipment = equipment
    .filter((item) => item.condition === "Faulty")
    .reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  const underRepair = equipment
    .filter((item) => item.status === "Repair")
    .reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  const categoryTotals = {};

  equipment.forEach((item) => {
    const category = item.category || "Other";

    categoryTotals[category] =
      (categoryTotals[category] || 0) +
      Number(item.quantity || 0);
  });


  // =========================
  // REPAIR CALCULATIONS
  // =========================

  const totalRepairs = repairs.length;

  const completedRepairs = repairs.filter(
    (repair) =>
      repair.status === "Completed" ||
      repair.status === "Collected"
  ).length;

  const activeRepairs = repairs.filter(
    (repair) =>
      repair.status !== "Completed" &&
      repair.status !== "Collected"
  ).length;

  const pendingRepairs = repairs.filter(
    (repair) =>
      repair.status === "Awaiting Parts" ||
      repair.status === "Diagnosis"
  ).length;

  const repairsInProgress = repairs.filter(
    (repair) =>
      repair.status === "Repairing"
  ).length;


  // =========================
  // STATE
  // =========================

  const [activeReport, setActiveReport] =
    useState("overview");


  return (
    <div className="page">

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>

          <h2>Reports</h2>

          <p>
            View and analyze ESHL inventory,
            repair, and employee performance data.
          </p>

        </div>

      </div>


      {/* REPORT CATEGORY CARDS */}

      <div className="report-category-grid">

        {/* INVENTORY REPORT */}

        <div className="report-category-card">

          <div className="report-category-icon">
            📦
          </div>

          <h3>Inventory Reports</h3>

          <p>
            Analyze equipment quantities,
            conditions, categories, locations,
            and stock status.
          </p>

          <button
            onClick={() =>
              setActiveReport("inventory")
            }
          >
            View Inventory Reports
          </button>

        </div>


        {/* REPAIR REPORT */}

        <div className="report-category-card">

          <div className="report-category-icon">
            🔧
          </div>

          <h3>Repair Reports</h3>

          <p>
            Track repair jobs, current statuses,
            completion, engineers, clients,
            and repair activity.
          </p>

          <button
            onClick={() =>
              setActiveReport("repairs")
            }
          >
            View Repair Reports
          </button>

        </div>


        {/* EMPLOYEE REPORT */}

        <div className="report-category-card">

          <div className="report-category-icon">
            👥
          </div>

          <h3>Employee Performance</h3>

          <p>
            Review employee productivity,
            completed jobs, performance scores,
            and bonuses.
          </p>

          <button
            onClick={() =>
              setActiveReport("employees")
            }
          >
            View Employee Reports
          </button>

        </div>

      </div>


      {/* REPORT TABS */}

      <div className="report-tabs">

        <button
          className={
            activeReport === "overview"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("overview")
          }
        >
          Overview
        </button>


        <button
          className={
            activeReport === "inventory"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("inventory")
          }
        >
          Inventory
        </button>


        <button
          className={
            activeReport === "repairs"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("repairs")
          }
        >
          Repairs
        </button>


        <button
          className={
            activeReport === "employees"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("employees")
          }
        >
          Employee Performance
        </button>

      </div>


      {/* =========================
          OVERVIEW
      ========================= */}

      {activeReport === "overview" && (

        <div className="reports-summary">

          <h3>Report Summary</h3>

          <div className="summary-grid">

            <div className="summary-card">

              <span>Total Equipment</span>

              <strong>
                {totalEquipment}
              </strong>

            </div>


            <div className="summary-card">

              <span>Active Repairs</span>

              <strong>
                {activeRepairs}
              </strong>

            </div>


            <div className="summary-card">

              <span>Completed Repairs</span>

              <strong>
                {completedRepairs}
              </strong>

            </div>


            <div className="summary-card">

              <span>Faulty Equipment</span>

              <strong>
                {faultyEquipment}
              </strong>

            </div>

          </div>

        </div>

      )}


      {/* =========================
          INVENTORY REPORT
      ========================= */}

      {activeReport === "inventory" && (

        <div className="report-section">

          <div className="report-section-header">

            <div>

              <h3>Inventory Reports</h3>

              <p>
                Overview of equipment stored and
                its current condition.
              </p>

            </div>

          </div>


          <div className="summary-grid">

            <div className="summary-card">

              <span>Total Equipment</span>

              <strong>
                {totalEquipment}
              </strong>

            </div>


            <div className="summary-card">

              <span>Good Condition</span>

              <strong>
                {goodCondition}
              </strong>

            </div>


            <div className="summary-card">

              <span>Faulty</span>

              <strong>
                {faultyEquipment}
              </strong>

            </div>


            <div className="summary-card">

              <span>Under Repair</span>

              <strong>
                {underRepair}
              </strong>

            </div>

          </div>


          {/* CATEGORY */}

          <div className="report-panel">

            <h3>Equipment by Category</h3>

            <div className="report-list">

              <div className="report-list-item">

                <span>
                  Broadcast Equipment
                </span>

                <strong>
                  {categoryTotals.Broadcast || 0}
                </strong>

              </div>


              <div className="report-list-item">

                <span>
                  Audio Equipment
                </span>

                <strong>
                  {categoryTotals.Audio || 0}
                </strong>

              </div>


              <div className="report-list-item">

                <span>
                  Satellite Equipment
                </span>

                <strong>
                  {categoryTotals.Satellite || 0}
                </strong>

              </div>


              <div className="report-list-item">

                <span>
                  IT Equipment
                </span>

                <strong>
                  {categoryTotals.IT || 0}
                </strong>

              </div>


              <div className="report-list-item">

                <span>
                  CCTV Equipment
                </span>

                <strong>
                  {categoryTotals.CCTV || 0}
                </strong>

              </div>

            </div>

          </div>


          {/* LOCATION */}

          <div className="report-panel">

            <h3>Equipment by Location</h3>

            <div className="report-list">

              <div className="report-list-item">

                <span>Main Store</span>

                <strong>

                  {equipment

                    .filter(
                      (item) =>
                        item.location ===
                        "Main Store"
                    )

                    .reduce(
                      (total, item) =>
                        total +
                        Number(
                          item.quantity || 0
                        ),
                      0
                    )}

                </strong>

              </div>


              <div className="report-list-item">

                <span>Repair Room</span>

                <strong>

                  {equipment

                    .filter(
                      (item) =>
                        item.location ===
                        "Repair Room"
                    )

                    .reduce(
                      (total, item) =>
                        total +
                        Number(
                          item.quantity || 0
                        ),
                      0
                    )}

                </strong>

              </div>

            </div>

          </div>


          {/* ATTENTION */}

          <div className="report-panel">

            <h3>
              Equipment Requiring Attention
            </h3>

            <div className="report-list">

              <div className="report-list-item">

                <div>

                  <strong>
                    Exciter
                  </strong>

                  <small>
                    EXC-003
                  </small>

                </div>

                <span className="report-danger">
                  Faulty
                </span>

              </div>


              <div className="report-list-item">

                <div>

                  <strong>
                    Equipment Under Repair
                  </strong>

                  <small>
                    Repair Room
                  </small>

                </div>

                <span className="report-warning">
                  Repair
                </span>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =========================
          REPAIR REPORT
      ========================= */}

      {activeReport === "repairs" && (

        <div className="report-section">

          <div className="report-section-header">

            <div>

              <h3>Repair Reports</h3>

              <p>
                Overview of current and completed
                repair jobs.
              </p>

            </div>

          </div>


          {/* REPAIR SUMMARY */}

          <div className="summary-grid">

            <div className="summary-card">

              <span>Total Repairs</span>

              <strong>
                {totalRepairs}
              </strong>

            </div>


            <div className="summary-card">

              <span>Active Repairs</span>

              <strong>
                {activeRepairs}
              </strong>

            </div>


            <div className="summary-card">

              <span>Completed</span>

              <strong>
                {completedRepairs}
              </strong>

            </div>


            <div className="summary-card">

              <span>Awaiting / Diagnosis</span>

              <strong>
                {pendingRepairs}
              </strong>

            </div>

          </div>


          {/* REPAIR STATUS */}

          <div className="report-panel">

            <h3>Repair Status</h3>

            <div className="report-list">

              <div className="report-list-item">

                <span>
                  Diagnosis
                </span>

                <strong>
                  {
                    repairs.filter(
                      (repair) =>
                        repair.status ===
                        "Diagnosis"
                    ).length
                  }
                </strong>

              </div>


              <div className="report-list-item">

                <span>
                  Awaiting Parts
                </span>

                <strong>
                  {
                    repairs.filter(
                      (repair) =>
                        repair.status ===
                        "Awaiting Parts"
                    ).length
                  }
                </strong>

              </div>


              <div className="report-list-item">

                <span>
                  Repairing
                </span>

                <strong>
                  {repairsInProgress}
                </strong>

              </div>


              <div className="report-list-item">

                <span>
                  Completed
                </span>

                <strong>
                  {
                    repairs.filter(
                      (repair) =>
                        repair.status ===
                        "Completed"
                    ).length
                  }
                </strong>

              </div>


              <div className="report-list-item">

                <span>
                  Collected
                </span>

                <strong>
                  {
                    repairs.filter(
                      (repair) =>
                        repair.status ===
                        "Collected"
                    ).length
                  }
                </strong>

              </div>

            </div>

          </div>


          {/* ENGINEER ACTIVITY */}

          <div className="report-panel">

            <h3>Engineer Activity</h3>

            <div className="report-list">

              {repairs.length === 0 ? (

                <div className="report-list-item">

                  <span>
                    No repair records available
                  </span>

                </div>

              ) : (

                repairs.map((repair) => (

                  <div
                    className="report-list-item"
                    key={repair.id}
                  >

                    <div>

                      <strong>
                        {repair.engineer ||
                          "Unassigned"}
                      </strong>

                      <small>

                        {repair.client ||
                          "No client"}

                        {" • "}

                        {repair.equipmentName ||
                          "Equipment"}

                      </small>

                    </div>

                    <span
                      className={
                        repair.status ===
                          "Completed" ||
                        repair.status ===
                          "Collected"
                          ? "report-success"
                          : "report-warning"
                      }
                    >
                      {repair.status ||
                        "Unknown"}
                    </span>

                  </div>

                ))

              )}

            </div>

          </div>

        </div>

      )}


      {/* =========================
          EMPLOYEE REPORT
      ========================= */}

      {activeReport === "employees" && (

        <div className="report-section">

          <div className="report-section-header">

            <div>

              <h3>Employee Performance</h3>

              <p>
                Review employee productivity
                and performance scores.
              </p>

            </div>

          </div>


          {/* PERFORMANCE SUMMARY */}

          <div className="report-panel">

            <h3>Performance Summary</h3>

            <div className="employee-report-table">

              <div className="employee-report-header">

                <span>Employee</span>

                <span>
                  Jobs Completed
                </span>

                <span>
                  On Time
                </span>

                <span>
                  Successful
                </span>

                <span>
                  Score
                </span>

              </div>


              {employees.length === 0 ? (

                <div className="employee-report-empty">

                  No employees available.

                </div>

              ) : (

                employees.map((employee) => {

                  const employeeRepairs =
                    repairs.filter(
                      (repair) =>
                        repair.engineer ===
                        employee.name
                    );


                  const completedRepairs =
                    employeeRepairs.filter(
                      (repair) =>
                        repair.status ===
                          "Completed" ||
                        repair.status ===
                          "Collected"
                    );


                  const completedOnTime =
                    completedRepairs.filter(
                      (repair) => {

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

                      }
                    );


                  const totalJobs =
                    employeeRepairs.length;

                  const jobsCompleted =
                    completedRepairs.length;

                  const jobsOnTime =
                    completedOnTime.length;

                  const successfulRepairs =
                    completedRepairs.length;


                  const completionScore =
                    totalJobs > 0
                      ? (jobsCompleted /
                          totalJobs) *
                        30
                      : 0;


                  const onTimeScore =
                    jobsCompleted > 0
                      ? (jobsOnTime /
                          jobsCompleted) *
                        25
                      : 0;


                  const successfulRepairScore =
                    jobsCompleted > 0
                      ? (successfulRepairs /
                          jobsCompleted) *
                        25
                      : 0;


                  const performanceScore =
                    completionScore +
                    onTimeScore +
                    successfulRepairScore;


                  return (

                    <div
                      className="employee-report-row"
                      key={employee.id}
                    >

                      <div>

                        <strong>
                          {employee.name}
                        </strong>

                        <small>
                          {employee.role ||
                            "Employee"}
                        </small>

                      </div>


                      <span>
                        {jobsCompleted}
                      </span>


                      <span>
                        {jobsOnTime}
                      </span>


                      <span>
                        {successfulRepairs}
                      </span>


                      <strong className="employee-score">

                        {performanceScore.toFixed(2)}
                        {" / 80"}

                      </strong>

                    </div>

                  );

                })

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Reports;

