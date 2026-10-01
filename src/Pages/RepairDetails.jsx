import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function RepairDetails({
  repair,
  onClose,
  onStatusChange,
  onRepairUpdate,
}) {
  const [imageUrls, setImageUrls] = useState([]);
  const [loadingImages, setLoadingImages] =
    useState(false);

  // =========================
  // EDITING
  // =========================

  const [isEditing, setIsEditing] =
    useState(false);

  const [editRepair, setEditRepair] =
    useState({
      client: repair.client || "",
      broughtBy: repair.broughtBy || "",
      equipment: repair.equipment || "",
      serial: repair.serial || "",
      issue: repair.issue || "",
      diagnosis: repair.diagnosis || "",
      engineer: repair.engineer || "",
      dueDate: repair.dueDate || "",
      priority: repair.priority || "Normal",
      partsNeeded: repair.partsNeeded || "",
    });

  // =========================
  // FULL IMAGE VIEWER
  // =========================

  const [selectedImage, setSelectedImage] =
    useState(null);

  // =========================
  // EDIT INPUT
  // =========================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditRepair((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // LOAD REPAIR IMAGES
  // =========================

  useEffect(() => {
    const loadImages = async () => {
      if (
        !repair ||
        !repair.images ||
        repair.images.length === 0
      ) {
        setImageUrls([]);
        return;
      }

      setLoadingImages(true);

      const urls = [];

      for (const image of repair.images) {
        const imagePath =
          typeof image === "string"
            ? image
            : image.path;

        if (!imagePath) {
          continue;
        }

        const { data, error } =
          await supabase.storage
            .from("repair-images")
            .createSignedUrl(
              imagePath,
              3600
            );

        if (error) {
          console.error(
            "Could not load repair image:",
            error
          );

          continue;
        }

        if (data?.signedUrl) {
          urls.push({
            url: data.signedUrl,
            name:
              typeof image === "string"
                ? "Repair image"
                : image.name || "Repair image",
          });
        }
      }

      setImageUrls(urls);
      setLoadingImages(false);
    };

    loadImages();
  }, [repair]);

  // =========================
  // CLOSE FULL IMAGE
  // =========================

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  // =========================
  // ESCAPE KEY
  // =========================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // =========================
  // NO REPAIR
  // =========================

  if (!repair) {
    return null;
  }

  return (
    <>
      {/* =====================================================
          REPAIR DETAILS MODAL
      ===================================================== */}

      <div className="modal-overlay">

        <div className="repair-details-modal">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="repair-details-header">

            <div>
              <h2>{repair.id}</h2>

              <p>
                {repair.client || "No client"}{" "}
                —{" "}
                {repair.equipment ||
                  "Equipment"}
              </p>
            </div>

            <div className="repair-details-header-actions">

              <button
                className="edit-repair-button"
                onClick={() =>
                  setIsEditing(true)
                }
              >
                ✎ Edit
              </button>

              <button
                className="modal-close"
                onClick={onClose}
              >
                ×
              </button>

            </div>

          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="repair-details-content">

            {/* =================================================
                BASIC DETAILS
            ================================================= */}

            <div className="repair-detail-grid">

              {/* CLIENT */}

              <div className="repair-detail-item">
                <span>Client</span>

                {isEditing ? (
                  <input
                    type="text"
                    name="client"
                    value={editRepair.client}
                    onChange={
                      handleEditChange
                    }
                  />
                ) : (
                  <strong>
                    {repair.client || "—"}
                  </strong>
                )}
              </div>

              {/* RECEIVED FROM */}

              <div className="repair-detail-item">
                <span>Received From</span>

                {isEditing ? (
                  <input
                    type="text"
                    name="broughtBy"
                    value={
                      editRepair.broughtBy
                    }
                    onChange={
                      handleEditChange
                    }
                  />
                ) : (
                  <strong>
                    {repair.broughtBy || "—"}
                  </strong>
                )}
              </div>

              {/* EQUIPMENT */}

              <div className="repair-detail-item">
                <span>Equipment</span>

                {isEditing ? (
                  <input
                    type="text"
                    name="equipment"
                    value={
                      editRepair.equipment
                    }
                    onChange={
                      handleEditChange
                    }
                  />
                ) : (
                  <strong>
                    {repair.equipment || "—"}
                  </strong>
                )}
              </div>

              {/* SERIAL NUMBER */}

              <div className="repair-detail-item">
                <span>Serial Number</span>

                {isEditing ? (
                  <input
                    type="text"
                    name="serial"
                    value={editRepair.serial}
                    onChange={
                      handleEditChange
                    }
                  />
                ) : (
                  <strong>
                    {repair.serial || "—"}
                  </strong>
                )}
              </div>

              {/* ENGINEER */}

              <div className="repair-detail-item">
                <span>Engineer</span>

                {isEditing ? (
                  <input
                    type="text"
                    name="engineer"
                    value={
                      editRepair.engineer
                    }
                    onChange={
                      handleEditChange
                    }
                  />
                ) : (
                  <strong>
                    {repair.engineer || "—"}
                  </strong>
                )}
              </div>

              {/* DATE RECEIVED */}

              <div className="repair-detail-item">
                <span>Date Received</span>

                <strong>
                  {repair.dateReceived || "—"}
                </strong>
              </div>

              {/* DUE DATE */}

              <div className="repair-detail-item">
                <span>Due Date</span>

                {isEditing ? (
                  <input
                    type="date"
                    name="dueDate"
                    value={
                      editRepair.dueDate
                    }
                    onChange={
                      handleEditChange
                    }
                  />
                ) : (
                  <strong>
                    {repair.dueDate || "—"}
                  </strong>
                )}
              </div>

              {/* PRIORITY */}

              <div className="repair-detail-item">
                <span>Priority</span>

                {isEditing ? (
                  <select
                    name="priority"
                    value={
                      editRepair.priority
                    }
                    onChange={
                      handleEditChange
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
                ) : (
                  <strong>
                    {repair.priority ||
                      "Normal"}
                  </strong>
                )}
              </div>

            </div>

            {/* =================================================
                REPORTED ISSUE
            ================================================= */}

            <div className="repair-detail-section">

              <h3>Reported Issue</h3>

              {isEditing ? (
                <textarea
                  name="issue"
                  value={editRepair.issue}
                  onChange={
                    handleEditChange
                  }
                  rows="3"
                />
              ) : (
                <p>
                  {repair.issue ||
                    "No issue description provided."}
                </p>
              )}

            </div>

            {/* =================================================
                DIAGNOSIS
            ================================================= */}

            <div className="repair-detail-section">

              <h3>Diagnosis</h3>

              {isEditing ? (
                <textarea
                  name="diagnosis"
                  value={
                    editRepair.diagnosis
                  }
                  onChange={
                    handleEditChange
                  }
                  rows="3"
                />
              ) : (
                <p>
                  {repair.diagnosis ||
                    "No diagnosis recorded yet."}
                </p>
              )}

            </div>

            {/* =================================================
                PARTS NEEDED
            ================================================= */}

            <div className="repair-detail-section">

              <h3>Parts Needed</h3>

              {isEditing ? (
                <textarea
                  name="partsNeeded"
                  value={
                    editRepair.partsNeeded
                  }
                  onChange={
                    handleEditChange
                  }
                  rows="3"
                />
              ) : (
                <p>
                  {repair.partsNeeded ||
                    "No parts recorded."}
                </p>
              )}

            </div>

            {/* =================================================
                REPAIR IMAGES
            ================================================= */}

            <div className="repair-detail-section">

              <h3>Equipment Images</h3>

              {loadingImages ? (
                <p className="image-status">
                  Loading images...
                </p>
              ) : imageUrls.length === 0 ? (
                <p className="image-status">
                  No images uploaded for this
                  repair.
                </p>
              ) : (
                <div className="repair-image-gallery">

                  {imageUrls.map(
                    (image, index) => (
                      <div
                        className="repair-image-card"
                        key={`${image.url}-${index}`}
                        onClick={() =>
                          setSelectedImage(
                            image
                          )
                        }
                      >
                        <img
                          src={image.url}
                          alt={
                            image.name ||
                            "Repair equipment"
                          }
                        />

                        <span>
                          {image.name}
                        </span>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="repair-detail-section">

              <h3>Repair Status</h3>

              <select
                value={
                  repair.status ||
                  "Received"
                }
                onChange={(e) =>
                  onStatusChange(
                    e.target.value
                  )
                }
                className="repair-status-select"
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

            {/* =================================================
                HISTORY
            ================================================= */}

            <div className="repair-detail-section">

              <h3>Repair History</h3>

              {repair.history &&
              repair.history.length > 0 ? (
                <div className="repair-history">

                  {repair.history.map(
                    (entry, index) => (
                      <div
                        className="history-item"
                        key={index}
                      >
                        <div>
                          <strong>
                            {entry.status}
                          </strong>

                          <p>
                            {entry.note ||
                              "Status updated"}
                          </p>
                        </div>

                        <span>
                          {entry.date}
                        </span>
                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="image-status">
                  No repair history available.
                </p>
              )}

            </div>

            {/* =================================================
                EDIT ACTIONS
            ================================================= */}

            {isEditing && (
              <div className="repair-edit-actions">

                <button
                  className="cancel-button"
                  onClick={() => {
                    setEditRepair({
                      client:
                        repair.client || "",
                      broughtBy:
                        repair.broughtBy ||
                        "",
                      equipment:
                        repair.equipment ||
                        "",
                      serial:
                        repair.serial || "",
                      issue:
                        repair.issue || "",
                      diagnosis:
                        repair.diagnosis ||
                        "",
                      engineer:
                        repair.engineer ||
                        "",
                      dueDate:
                        repair.dueDate || "",
                      priority:
                        repair.priority ||
                        "Normal",
                      partsNeeded:
                        repair.partsNeeded ||
                        "",
                    });

                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  onClick={() => {
                    if (
                      onRepairUpdate
                    ) {
                      onRepairUpdate(
                        editRepair
                      );
                    }

                    setIsEditing(false);
                  }}
                >
                  Save Changes
                </button>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          FULL IMAGE VIEWER
      ===================================================== */}

      {selectedImage && (
        <div
          className="full-image-overlay"
          onClick={closeImageViewer}
        >

          <button
            className="full-image-close"
            onClick={
              closeImageViewer
            }
          >
            ×
          </button>

          <img
            src={selectedImage.url}
            alt={
              selectedImage.name ||
              "Full repair equipment"
            }
            className="full-repair-image"
            onClick={(e) =>
              e.stopPropagation()
            }
          />

          {selectedImage.name && (
            <div className="full-image-name">
              {selectedImage.name}
            </div>
          )}

        </div>
      )}
    </>
  );
}

export default RepairDetails;