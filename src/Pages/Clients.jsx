import { useState } from "react";
import { supabase } from "../supabaseClient";
import RepairDetails from "./RepairDetails";

function Clients({
  clients = [],
  setClients,
  repairs = [],
}) {
  const [selectedClient, setSelectedClient] =
    useState(null);

  const [selectedRepair, setSelectedRepair] =
    useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] =
    useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
  });

  // =========================
  // OPEN ADD FORM
  // =========================

  const openAddForm = () => {
    setEditingClient(null);

    setFormData({
      name: "",
      company: "",
      phone: "",
      email: "",
    });

    setShowForm(true);
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const openEditForm = (client) => {
    setEditingClient(client);

    setFormData({
      name: client.name || "",
      company: client.company || "",
      phone: client.phone || "",
      email: client.email || "",
    });

    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================

  const closeForm = () => {
    setShowForm(false);
    setEditingClient(null);

    setFormData({
      name: "",
      company: "",
      phone: "",
      email: "",
    });
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // SAVE CLIENT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter the client name.");
      return;
    }

    setSaving(true);

    const clientData = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
    };

    // =========================
    // UPDATE CLIENT
    // =========================

    if (editingClient) {
      const { data, error } = await supabase
        .from("clients")
        .update(clientData)
        .eq("id", editingClient.id)
        .select()
        .single();

      if (error) {
        console.error(
          "Could not update client:",
          error
        );

        alert(
          `Could not update client: ${error.message}`
        );

        setSaving(false);
        return;
      }

      setClients((previous) =>
        previous.map((client) =>
          client.id === editingClient.id
            ? data
            : client
        )
      );

      // Keep selected client updated
      if (
        selectedClient?.id === editingClient.id
      ) {
        setSelectedClient(data);
      }

      closeForm();
      setSaving(false);
      return;
    }

    // =========================
    // ADD CLIENT
    // =========================

    const { data, error } = await supabase
      .from("clients")
      .insert([clientData])
      .select()
      .single();

    if (error) {
      console.error(
        "Could not save client:",
        error
      );

      alert(
        `Could not save client: ${error.message}`
      );

      setSaving(false);
      return;
    }

    setClients((previous) => [
      data,
      ...previous,
    ]);

    closeForm();
    setSaving(false);
  };

  // =========================
  // DELETE CLIENT
  // =========================

  const handleDelete = async (client) => {
    const clientRepairs =
      getClientRepairs(client);

    if (clientRepairs.length > 0) {
      alert(
        "This client has repair records and cannot be deleted. Remove or reassign the repair records first."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${client.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(client.id);

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", client.id);

    if (error) {
      console.error(
        "Could not delete client:",
        error
      );

      alert(
        `Could not delete client: ${error.message}`
      );

      setDeletingId(null);
      return;
    }

    setClients((previous) =>
      previous.filter(
        (item) => item.id !== client.id
      )
    );

    if (
      selectedClient?.id === client.id
    ) {
      setSelectedClient(null);
    }

    setDeletingId(null);
  };

  // =========================
  // CLIENT REPAIRS
  // =========================

  const getClientRepairs = (client) => {
    return repairs.filter(
      (repair) =>
        (repair.client || "")
          .trim()
          .toLowerCase() ===
        (client.name || "")
          .trim()
          .toLowerCase()
    );
  };

  // =========================
  // OPEN CLIENT
  // =========================

  const handleClientClick = (client) => {
    setSelectedClient(client);
  };

  // =========================
  // CLOSE CLIENT DETAILS
  // =========================

  const closeClientDetails = () => {
    setSelectedClient(null);
  };

  return (
    <div className="page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-header">
        <div>
          <h2>Clients</h2>

          <p>
            Manage ESHL clients and their
            service history.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Client
        </button>
      </div>

      {/* =========================
          CLIENT DETAILS
      ========================= */}

      {selectedClient && (
        <div className="dashboard-card client-details-card">

          <div className="card-header">

            <div>
              <h3>
                {selectedClient.name}
              </h3>

              <p>
                {selectedClient.company ||
                  "Client service history"}
              </p>
            </div>

            <button
              className="modal-close"
              onClick={closeClientDetails}
            >
              ×
            </button>

          </div>

          <div className="client-information">

            <div>
              <span>Company</span>

              <strong>
                {selectedClient.company ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>Phone</span>

              <strong>
                {selectedClient.phone ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>Email</span>

              <strong>
                {selectedClient.email ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>Total Repairs</span>

              <strong>
                {
                  getClientRepairs(
                    selectedClient
                  ).length
                }
              </strong>
            </div>

          </div>

          {/* CLIENT ACTIONS */}

          <div className="client-detail-actions">

            <button
              className="secondary-button"
              onClick={() =>
                openEditForm(selectedClient)
              }
            >
              Edit Client
            </button>

            <button
              className="client-delete-button"
              onClick={() =>
                handleDelete(selectedClient)
              }
              disabled={
                deletingId ===
                selectedClient.id
              }
            >
              {deletingId ===
              selectedClient.id
                ? "Deleting..."
                : "Delete Client"}
            </button>

          </div>

          {/* REPAIR HISTORY */}

          <div className="client-repair-section">

            <div className="client-repair-header">
              <div>
                <h3>Repair History</h3>

                <p>
                  All repairs recorded for this
                  client.
                </p>
              </div>
            </div>

            {getClientRepairs(
              selectedClient
            ).length === 0 ? (

              <div className="client-no-repairs">

                <div className="client-empty-icon">
                  🔧
                </div>

                <h3>
                  No repairs yet
                </h3>

                <p>
                  There are no repair records
                  associated with this client.
                </p>

              </div>

            ) : (

              <div className="client-repair-list">

                {getClientRepairs(
                  selectedClient
                ).map((repair) => (

                  <div
                    className="client-repair-item"
                    key={repair.id}
                    onClick={() =>
                      setSelectedRepair(repair)
                    }
                  >

                    <div className="client-repair-main">

                      <strong>
                        {repair.id}
                      </strong>

                      <span>
                        {repair.equipment ||
                          repair.equipmentName ||
                          "Equipment"}
                      </span>

                    </div>

                    <div className="client-repair-info">

                      <span>
                        {repair.issue ||
                          "No issue recorded"}
                      </span>

                      <small>
                        Received:{" "}
                        {repair.dateReceived ||
                          "—"}
                      </small>

                    </div>

                    <span
                      className={`status-badge status-${(
                        repair.status ||
                        "unknown"
                      )
                        .toLowerCase()
                        .replace(
                          /\s+/g,
                          "-"
                        )}`}
                    >
                      {repair.status ||
                        "Unknown"}
                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>
      )}

      {/* =========================
          ADD / EDIT CLIENT FORM
      ========================= */}

      {showForm && (
        <div className="dashboard-card client-form-card">

          <div className="card-header">

            <div>
              <h3>
                {editingClient
                  ? "Edit Client"
                  : "Add Client"}
              </h3>

              <p>
                {editingClient
                  ? "Update the client's contact information."
                  : "Enter the client's contact information."}
              </p>
            </div>

            <button
              className="modal-close"
              onClick={closeForm}
            >
              ×
            </button>

          </div>

          <form
            className="client-form"
            onSubmit={handleSubmit}
          >

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Client Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter client name"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Company
                </label>

                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company name"
                />

              </div>

              <div className="form-group">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />

              </div>

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                />

              </div>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingClient
                  ? "Save Changes"
                  : "Add Client"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =========================
          ALL CLIENTS
      ========================= */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>
            <h3>All Clients</h3>

            <p>
              {clients.length}{" "}
              {clients.length === 1
                ? "client"
                : "clients"}
            </p>
          </div>

        </div>

        {clients.length === 0 ? (

          <div className="client-empty">

            <div className="client-empty-icon">
              👥
            </div>

            <h3>
              No clients yet
            </h3>

            <p>
              Add your first client to start
              building the client database.
            </p>

            <button
              className="primary-button"
              onClick={openAddForm}
            >
              + Add Client
            </button>

          </div>

        ) : (

          <div className="client-table">

            <div className="client-table-header">
              <span>Client</span>
              <span>Company</span>
              <span>Phone</span>
              <span>Email</span>
              <span>Repairs</span>
            </div>

            {clients.map((client) => {

              const repairCount =
                getClientRepairs(client).length;

              return (
                <div
                  className="client-table-row client-clickable-row"
                  key={client.id}
                  onClick={() =>
                    handleClientClick(client)
                  }
                >

                  <div>
                    <strong>
                      {client.name}
                    </strong>
                  </div>

                  <span>
                    {client.company ||
                      "—"}
                  </span>

                  <span>
                    {client.phone ||
                      "—"}
                  </span>

                  <span>
                    {client.email ||
                      "—"}
                  </span>

                  <span className="client-repair-count">
                    {repairCount}
                  </span>

                </div>
              );
            })}

          </div>

        )}

      </div>

      {/* =========================
          REPAIR DETAILS
      ========================= */}

      {selectedRepair && (
        <RepairDetails
          repair={selectedRepair}
          onClose={() =>
            setSelectedRepair(null)
          }
        />
      )}

    </div>
  );
}

export default Clients;