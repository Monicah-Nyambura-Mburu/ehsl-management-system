import { useState } from "react";
import { supabase } from "../supabaseClient";
import RepairDetails from "./RepairDetails";

function Repairs({ repairs, setRepairs, employees }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showRepairForm, setShowRepairForm] =
    useState(false);

  const [selectedRepair, setSelectedRepair] =
    useState(null);

  const [saving, setSaving] = useState(false);

  // =========================
  // REPAIR IMAGES
  // =========================

  const [repairImages, setRepairImages] =
    useState([]);

  // =========================
  // NEW REPAIR
  // =========================

  const [newRepair, setNewRepair] = useState({
    client: "",
    broughtBy: "",
    equipment: "",
    serial: "",
    issue: "",
    diagnosis: "",
    engineer: "",
    estimatedDuration: "",
    partsNeeded: "",
    dueDate: "",
    status: "Received",
    priority: "Normal",
  });

  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredRepairs = repairs.filter((repair) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (repair.id || "")
        .toLowerCase()
        .includes(search) ||
      (repair.client || "")
        .toLowerCase()
        .includes(search) ||
      (repair.equipment || "")
        .toLowerCase()
        .includes(search) ||
      (repair.serial || "")
        .toLowerCase()
        .includes(search) ||
      (repair.engineer || "")
        .toLowerCase()
        .includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      repair.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================
  // FORM INPUT
  // =========================

  const handleRepairChange = (e) => {
    const { name, value } = e.target;

    setNewRepair((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // IMAGE INPUT
  // =========================

  const handleImageChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    setRepairImages(files);
  };

  // =========================
  // UPLOAD REPAIR IMAGES
  // =========================

  const uploadRepairImages = async (repairId) => {
    if (repairImages.length === 0) {
      return [];
    }

    const uploadedImages = [];

    for (const file of repairImages) {
      const safeFileName = file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );

      const filePath = `${repairId}/${Date.now()}-${safeFileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("repair-images")
          .upload(filePath, file);

      if (uploadError) {
        console.error(
          "Image upload error:",
          uploadError
        );

        throw new Error(
          `Could not upload ${file.name}: ${uploadError.message}`
        );
      }

      uploadedImages.push({
        name: file.name,
        path: filePath,
      });
    }

    return uploadedImages;
  };

  // =========================
  // SAVE NEW REPAIR
  // =========================

  const handleSaveRepair = async () => {
    if (
      !newRepair.client ||
      !newRepair.equipment ||
      !newRepair.issue
    ) {
      alert(
        "Please fill in the client, equipment and reported issue."
      );

      return;
    }

    setSaving(true);

    try {
      const today = new Date()
        .toISOString()
        .split("T")[0];

      // =========================
      // FIND HIGHEST EXISTING REP NUMBER
      // =========================

      const existingNumbers = repairs.map(
        (repair) => {
          const match = (
            repair.id || ""
          ).match(/REP-(\d+)/);

          return match
            ? Number(match[1])
            : 0;
        }
      );

      const highestNumber =
        existingNumbers.length > 0
          ? Math.max(...existingNumbers)
          : 0;

      const newId = `REP-${String(
        highestNumber + 1
      ).padStart(4, "0")}`;

      // =========================
      // INITIAL HISTORY
      // =========================

      const initialHistory = [
        {
          status: "Received",
          date: today,
          note: `Equipment received from ${newRepair.client}`,
        },
      ];

      if (newRepair.status !== "Received") {
        initialHistory.push({
          status: newRepair.status,
          date: today,
          note: `Repair status set to ${newRepair.status}`,
        });
      }

      // =========================
      // DATABASE FORMAT
      // =========================

      const repairToInsert = {
        id: newId,
        client: newRepair.client,
        brought_by: newRepair.broughtBy,
        equipment: newRepair.equipment,
        serial: newRepair.serial,
        issue: newRepair.issue,
        diagnosis: newRepair.diagnosis,
        engineer:
          newRepair.engineer ||
          "Unassigned",
        date_received: today,
        due_date:
          newRepair.dueDate || null,
        completed_date:
          newRepair.status === "Completed"
            ? today
            : null,
        estimated_duration:
          newRepair.estimatedDuration,
        parts_needed:
          newRepair.partsNeeded,
        status: newRepair.status,
        priority: newRepair.priority,
        history: initialHistory,
        images: [],
      };

      // =========================
      // SAVE REPAIR
      // =========================

      const { data, error } =
        await supabase
          .from("repairs")
          .insert(repairToInsert)
          .select()
          .single();

      if (error) {
        console.error(
          "Save repair error:",
          error
        );

        alert(
          `Could not save repair: ${error.message}`
        );

        return;
      }

      // =========================
      // UPLOAD IMAGES
      // =========================

      let uploadedImages = [];

      if (repairImages.length > 0) {
        try {
          uploadedImages =
            await uploadRepairImages(
              newId
            );

          const {
            error: imageUpdateError,
          } = await supabase
            .from("repairs")
            .update({
              images: uploadedImages,
            })
            .eq("id", newId);

          if (imageUpdateError) {
            console.error(
              "Could not save image information:",
              imageUpdateError
            );

            alert(
              `Repair saved, but the image information could not be saved: ${imageUpdateError.message}`
            );
          }
        } catch (imageError) {
          console.error(
            "Repair image upload failed:",
            imageError
          );

          alert(
            `Repair saved, but an image could not be uploaded: ${imageError.message}`
          );
        }
      }

      // =========================
      // AUTOMATICALLY ADD CLIENT
      // =========================

      const clientName =
        newRepair.client.trim();

      const {
        data: existingClient,
        error: clientSearchError,
      } = await supabase
        .from("clients")
        .select("id, name")
        .ilike("name", clientName)
        .maybeSingle();

      if (clientSearchError) {
        console.error(
          "Client search error:",
          clientSearchError
        );
      } else if (!existingClient) {
        const {
          error: clientInsertError,
        } = await supabase
          .from("clients")
          .insert([
            {
              name: clientName,
            },
          ]);

        if (clientInsertError) {
          console.error(
            "Automatic client creation error:",
            clientInsertError
          );

          alert(
            `Repair saved, but the client could not be added automatically: ${clientInsertError.message}`
          );
        }
      }

      // =========================
      // CONVERT DATABASE DATA
      // =========================

      const savedRepair = {
        id: data.id,
        client: data.client,
        broughtBy:
          data.brought_by || "",
        equipment: data.equipment,
        serial: data.serial || "",
        issue: data.issue,
        diagnosis:
          data.diagnosis || "",
        engineer:
          data.engineer || "",
        dateReceived:
          data.date_received || "",
        dueDate:
          data.due_date || "",
        completedDate:
          data.completed_date || "",
        estimatedDuration:
          data.estimated_duration || "",
        partsNeeded:
          data.parts_needed || "",
        status: data.status,
        priority:
          data.priority || "Normal",
        history:
          data.history || [],
        images: uploadedImages,
      };

      setRepairs((prev) => [
        ...prev,
        savedRepair,
      ]);

      // =========================
      // RESET FORM
      // =========================

      setNewRepair({
        client: "",
        broughtBy: "",
        equipment: "",
        serial: "",
        issue: "",
        diagnosis: "",
        engineer: "",
        estimatedDuration: "",
        partsNeeded: "",
        dueDate: "",
        status: "Received",
        priority: "Normal",
      });

      setRepairImages([]);

      setShowRepairForm(false);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // STATUS CHANGE
  // =========================

  const handleStatusChange = async (
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

    const updatedHistory = [
      ...(selectedRepair.history || []),
      newHistoryEntry,
    ];

    const completedDate =
      newStatus === "Completed"
        ? today
        : selectedRepair.completedDate ||
          null;

    // =========================
    // UPDATE SUPABASE
    // =========================

    const { error } = await supabase
      .from("repairs")
      .update({
        status: newStatus,
        completed_date:
          completedDate,
        history: updatedHistory,
      })
      .eq("id", selectedRepair.id);

    if (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        `Could not update repair status: ${error.message}`
      );

      return;
    }

    // =========================
    // UPDATE LOCAL STATE
    // =========================

    const updatedRepair = {
      ...selectedRepair,
      status: newStatus,
      completedDate:
        completedDate || "",
      history: updatedHistory,
    };

    setRepairs((prev) =>
      prev.map((repair) =>
        repair.id === updatedRepair.id
          ? updatedRepair
          : repair
      )
    );

    setSelectedRepair(updatedRepair);
  };

  // =========================
  // UPDATE REPAIR DETAILS
  // =========================

  const handleRepairUpdate = async (
    updatedFields
  ) => {
    if (!selectedRepair) {
      return;
    }

    const { error } = await supabase
      .from("repairs")
      .update({
        client: updatedFields.client,
        brought_by:
          updatedFields.broughtBy,
        equipment:
          updatedFields.equipment,
        serial:
          updatedFields.serial,
        issue:
          updatedFields.issue,
        diagnosis:
          updatedFields.diagnosis,
        engineer:
          updatedFields.engineer,
        estimated_duration:
          updatedFields.estimatedDuration ||
          null,
        due_date:
          updatedFields.dueDate || null,
        priority:
          updatedFields.priority,
        parts_needed:
          updatedFields.partsNeeded,
      })
      .eq("id", selectedRepair.id);

    if (error) {
      console.error(
        "Repair update error:",
        error
      );

      alert(
        `Could not update repair: ${error.message}`
      );

      return;
    }

    // =========================
    // UPDATE LOCAL STATE
    // =========================

    const updatedRepair = {
      ...selectedRepair,
      client:
        updatedFields.client,
      broughtBy:
        updatedFields.broughtBy,
      equipment:
        updatedFields.equipment,
      serial:
        updatedFields.serial,
      issue:
        updatedFields.issue,
      diagnosis:
        updatedFields.diagnosis,
      engineer:
        updatedFields.engineer,
      estimatedDuration:
        updatedFields.estimatedDuration ||
        "",
      dueDate:
        updatedFields.dueDate || "",
      priority:
        updatedFields.priority,
      partsNeeded:
        updatedFields.partsNeeded,
    };

    setRepairs((prev) =>
      prev.map((repair) =>
        repair.id === updatedRepair.id
          ? updatedRepair
          : repair
      )
    );

    setSelectedRepair(
      updatedRepair
    );

    alert(
      "Repair details updated successfully."
    );
  };

  // =========================
  // PAGE
  // =========================

  return (
    <div className="page">

      {/* =========================
          PAGE HEADER
          ========================= */}

      <div className="page-header">

        <div></div>

        <button
          className="primary-button"
          onClick={() =>
            setShowRepairForm(true)
          }
        >
          + New Repair
        </button>

      </div>

      {/* =========================
          NEW REPAIR FORM
          ========================= */}

      {showRepairForm && (
        <div className="repair-form-card">

          <div className="repair-form-header">

            <div>
              <h3>New Repair Job</h3>

              <p>
                Record equipment received
                for repair or maintenance.
              </p>
            </div>

            <button
              className="close-form-button"
              onClick={() =>
                setShowRepairForm(false)
              }
            >
              ✕
            </button>

          </div>

          <div className="repair-form-grid">

            {/* CLIENT */}

            <div className="form-group">
              <label>Client</label>

              <input
                type="text"
                name="client"
                placeholder="e.g. Capital FM"
                value={
                  newRepair.client
                }
                onChange={
                  handleRepairChange
                }
              />
            </div>

            {/* RECEIVED FROM */}

            <div className="form-group">
              <label>Received From</label>

              <input
                type="text"
                name="broughtBy"
                placeholder="Person who brought the equipment"
                value={
                  newRepair.broughtBy
                }
                onChange={
                  handleRepairChange
                }
              />
            </div>

            {/* EQUIPMENT */}

            <div className="form-group">
              <label>Equipment</label>

              <input
                type="text"
                name="equipment"
                placeholder="e.g. FM Transmitter"
                value={
                  newRepair.equipment
                }
                onChange={
                  handleRepairChange
                }
              />
            </div>

            {/* SERIAL */}

            <div className="form-group">
              <label>Serial Number</label>

              <input
                type="text"
                name="serial"
                placeholder="e.g. FMT-001"
                value={
                  newRepair.serial
                }
                onChange={
                  handleRepairChange
                }
              />
            </div>

            {/* REPORTED ISSUE */}

            <div className="form-group full-width">
              <label>
                Reported Issue
              </label>

              <textarea
                name="issue"
                placeholder="Describe the problem reported by the client..."
                value={
                  newRepair.issue
                }
                onChange={
                  handleRepairChange
                }
                rows="3"
              />
            </div>

            {/* DIAGNOSIS */}

            <div className="form-group full-width">
              <label>Diagnosis</label>

              <textarea
                name="diagnosis"
                placeholder="Engineer diagnosis..."
                value={
                  newRepair.diagnosis
                }
                onChange={
                  handleRepairChange
                }
                rows="3"
              />
            </div>

            {/* ENGINEER */}

            <div className="form-group">
              <label>
                Assigned Engineer
              </label>

              <select
                name="engineer"
                value={
                  newRepair.engineer
                }
                onChange={
                  handleRepairChange
                }
              >
                <option value="">
                  Select Engineer
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={employee.id}
                      value={
                        employee.name
                      }
                    >
                      {employee.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ESTIMATED DURATION */}

            <div className="form-group">
              <label>
                Estimated Duration
              </label>

              <input
                type="text"
                name="estimatedDuration"
                placeholder="e.g. 3 days"
                value={
                  newRepair.estimatedDuration
                }
                onChange={
                  handleRepairChange
                }
              />
            </div>

            {/* DUE DATE */}

            <div className="form-group">
              <label>Due Date</label>

              <input
                type="date"
                name="dueDate"
                value={
                  newRepair.dueDate
                }
                onChange={
                  handleRepairChange
                }
              />
            </div>

            {/* PARTS */}

            <div className="form-group full-width">
              <label>
                Parts Needed
              </label>

              <textarea
                name="partsNeeded"
                placeholder="List required parts..."
                value={
                  newRepair.partsNeeded
                }
                onChange={
                  handleRepairChange
                }
                rows="3"
              />
            </div>

            {/* EQUIPMENT IMAGES */}

            <div className="form-group full-width">
              <label>
                Equipment Images
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleImageChange
                }
              />

              <small className="image-upload-help">
                Upload photos of the
                equipment, serial number,
                or reported fault.
              </small>

              {repairImages.length >
                0 && (
                <div className="selected-images">

                  {repairImages.map(
                    (file, index) => (
                      <div
                        className="selected-image"
                        key={`${file.name}-${index}`}
                      >
                        <span>
                          📷
                        </span>

                        <span>
                          {file.name}
                        </span>
                      </div>
                    )
                  )}

                </div>
              )}
            </div>

            {/* STATUS */}

            <div className="form-group">
              <label>Status</label>

              <select
                name="status"
                value={
                  newRepair.status
                }
                onChange={
                  handleRepairChange
                }
              >
                <option value="Received">
                  Received
                </option>

                <option value="Diagnosis">
                  Diagnosis
                </option>

                <option value="Awaiting Parts">
                  Awaiting Parts
                </option>

                <option value="Repairing">
                  Repairing
                </option>

                <option value="Testing">
                  Testing
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Collected">
                  Collected
                </option>
              </select>
            </div>

            {/* PRIORITY */}

            <div className="form-group">
              <label>Priority</label>

              <select
                name="priority"
                value={
                  newRepair.priority
                }
                onChange={
                  handleRepairChange
                }
              >
                <option value="Urgent">
                  Urgent
                </option>

                <option value="High">
                  High
                </option>

                <option value="Normal">
                  Normal
                </option>

                <option value="Low">
                  Low
                </option>
              </select>
            </div>

          </div>

          {/* FORM BUTTONS */}

          <div className="repair-form-actions">

            <button
              className="cancel-button"
              onClick={() =>
                setShowRepairForm(false)
              }
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={
                handleSaveRepair
              }
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Repair"}
            </button>

          </div>

        </div>
      )}

      {/* =========================
          REPAIRS CONTENT
          ========================= */}

      {repairs.length === 0 ? (
        <div className="repair-empty-state">

          <div className="repair-empty-icon">
            🔧
          </div>

          <h3>
            No repair jobs yet
          </h3>

          <p>
            There are currently no
            repair jobs recorded. Add
            a repair job to start
            tracking equipment.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              setShowRepairForm(true)
            }
          >
            + New Repair
          </button>

        </div>
      ) : (
        <>
          {/* =========================
              REPAIR CONTROLS
              ========================= */}

          <div className="repair-controls">

            <div className="repair-search">

              <input
                type="text"
                placeholder="Search repairs..."
                value={
                  searchTerm
                }
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

            </div>

            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Received">
                Received
              </option>

              <option value="Diagnosis">
                Diagnosis
              </option>

              <option value="Awaiting Parts">
                Awaiting Parts
              </option>

              <option value="Repairing">
                Repairing
              </option>

              <option value="Testing">
                Testing
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Collected">
                Collected
              </option>
            </select>

          </div>

          {/* =========================
              REPAIRS TABLE
              ========================= */}

          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Client</th>
                  <th>Equipment</th>
                  <th>Serial Number</th>
                  <th>Engineer</th>
                  <th>Date Received</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {filteredRepairs.length >
                0 ? (
                  filteredRepairs.map(
                    (repair) => (
                      <tr
                        key={
                          repair.id
                        }
                        className="clickable-row"
                        onClick={() =>
                          setSelectedRepair(
                            repair
                          )
                        }
                      >

                        <td>
                          <strong>
                            {
                              repair.id
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            repair.client
                          }
                        </td>

                        <td>
                          <strong>
                            {
                              repair.equipment
                            }
                          </strong>

                          <small className="table-subtext">
                            {
                              repair.issue
                            }
                          </small>
                        </td>

                        <td>
                          {
                            repair.serial
                          }
                        </td>

                        <td>
                          {
                            repair.engineer
                          }
                        </td>

                        <td>
                          {
                            repair.dateReceived
                          }
                        </td>

                        <td>
                          <strong
                            className={`priority-${(
                              repair.priority ||
                              "Normal"
                            ).toLowerCase()}`}
                          >
                            {
                              repair.priority ||
                              "Normal"
                            }
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`status-badge status-${(
                              repair.status ||
                              ""
                            )
                              .toLowerCase()
                              .replaceAll(
                                " ",
                                "-"
                              )}`}
                          >
                            {
                              repair.status
                            }
                          </span>
                        </td>

                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="empty-table"
                    >
                      No repairs match
                      your search.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        </>
      )}

      {/* =========================
          REPAIR DETAILS
          ========================= */}

      {selectedRepair && (
        <RepairDetails
          repair={
            selectedRepair
          }
          onClose={() =>
            setSelectedRepair(
              null
            )
          }
          onStatusChange={
            handleStatusChange
          }
          onRepairUpdate={
            handleRepairUpdate
          }
        />
      )}

    </div>
  );
}

export default Repairs;