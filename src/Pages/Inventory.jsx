import { useState } from "react";
import { supabase } from "../supabaseClient";

function Inventory({ equipment, setEquipment }) {
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const emptyForm = {
    id: "",
    name: "",
    serial: "",
    category: "Broadcast",
    quantity: 1,
    condition: "Good",
    location: "Main Store",
    status: "In Stock",
  };

  const [formData, setFormData] = useState(emptyForm);

  const filteredEquipment = equipment.filter((item) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (item.id || "").toLowerCase().includes(search) ||
      (item.name || "").toLowerCase().includes(search) ||
      (item.serial || "").toLowerCase().includes(search) ||
      (item.category || "").toLowerCase().includes(search);

    const matchesCondition =
      conditionFilter === "All" ||
      item.condition === conditionFilter;

    const matchesStatus =
      statusFilter === "All" ||
      item.status === statusFilter;

    return (
      matchesSearch &&
      matchesCondition &&
      matchesStatus
    );
  });

  const openAddForm = () => {
    setEditingEquipment(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingEquipment(item);

    setFormData({
      id: item.id || "",
      name: item.name || "",
      serial: item.serial || "",
      category: item.category || "Broadcast",
      quantity: Number(item.quantity || 1),
      condition: item.condition || "Good",
      location: item.location || "Main Store",
      status: item.status || "In Stock",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEquipment(null);
    setFormData(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "quantity"
          ? Number(value)
          : value,
    }));
  };

  const saveEquipment = async (event) => {
    event.preventDefault();

    if (!formData.id.trim()) {
      alert("Please enter an Asset ID.");
      return;
    }

    if (!formData.name.trim()) {
      alert("Please enter the equipment name.");
      return;
    }

    if (Number(formData.quantity) < 0) {
      alert("Quantity cannot be negative.");
      return;
    }

    setSaving(true);

    const equipmentData = {
      id: formData.id.trim(),
      name: formData.name.trim(),
      serial: formData.serial.trim(),
      category: formData.category,
      quantity: Number(formData.quantity),
      condition: formData.condition,
      location: formData.location,
      status: formData.status,
    };

    if (editingEquipment) {
      const { data, error } = await supabase
        .from("Inventory")
        .update(equipmentData)
        .eq("id", editingEquipment.id)
        .select()
        .single();

      if (error) {
        console.error(
          "Could not update equipment:",
          error
        );

        alert(
          `Could not update equipment: ${error.message}`
        );

        setSaving(false);
        return;
      }

      setEquipment((previous) =>
        previous.map((item) =>
          item.id === editingEquipment.id
            ? data
            : item
        )
      );
    } else {
      const { data, error } = await supabase
        .from("Inventory")
        .insert([equipmentData])
        .select()
        .single();

      if (error) {
        console.error(
          "Could not add equipment:",
          error
        );

        alert(
          `Could not add equipment: ${error.message}`
        );

        setSaving(false);
        return;
      }

      setEquipment((previous) => [
        data,
        ...previous,
      ]);
    }

    closeForm();
    setSaving(false);
  };

  const deleteEquipment = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);

    const { error } = await supabase
      .from("Inventory")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error(
        "Could not delete equipment:",
        error
      );

      alert(
        `Could not delete equipment: ${error.message}`
      );

      setDeletingId(null);
      return;
    }

    setEquipment((previous) =>
      previous.filter(
        (equipmentItem) =>
          equipmentItem.id !== item.id
      )
    );

    setDeletingId(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Inventory</h2>
          <p>
            Manage equipment, quantities and
            equipment condition.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Equipment
        </button>
      </div>

      <div className="inventory-controls">
        <input
          type="text"
          placeholder="Search equipment..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />

        <select
          value={conditionFilter}
          onChange={(event) =>
            setConditionFilter(event.target.value)
          }
        >
          <option value="All">
            All Conditions
          </option>
          <option value="Good">Good</option>
          <option value="Faulty">Faulty</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">All Statuses</option>
          <option value="In Stock">
            In Stock
          </option>
          <option value="Repair">Repair</option>
          <option value="Issued">Issued</option>
        </select>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="card-header">
            <h3>
              {editingEquipment
                ? "Edit Equipment"
                : "Add Equipment"}
            </h3>

            <button
              type="button"
              className="secondary-button"
              onClick={closeForm}
            >
              Cancel
            </button>
          </div>

          <form
            className="form-grid"
            onSubmit={saveEquipment}
          >
            <div className="form-group">
              <label>Asset ID *</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                disabled={Boolean(editingEquipment)}
                required
              />
            </div>

            <div className="form-group">
              <label>Equipment Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Serial Number</label>
              <input
                type="text"
                name="serial"
                value={formData.serial}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Broadcast">
                  Broadcast
                </option>
                <option value="Audio">
                  Audio
                </option>
                <option value="Satellite">
                  Satellite
                </option>
                <option value="IT">IT</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="Good">Good</option>
                <option value="Faulty">
                  Faulty
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="In Stock">
                  In Stock
                </option>
                <option value="Repair">Repair</option>
                <option value="Issued">Issued</option>
              </select>
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
                  : editingEquipment
                  ? "Update Equipment"
                  : "Save Equipment"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="inventory-table-container">
        {filteredEquipment.length === 0 ? (
          <div className="empty-state">
            <h3>No equipment found</h3>
            <p>
              {equipment.length === 0
                ? "Add your first equipment item to the inventory."
                : "No equipment matches your current search or filters."}
            </p>
          </div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Serial Number</th>
                <th>Equipment</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Condition</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEquipment.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>

                  <td>
                    {item.serial || "—"}
                  </td>

                  <td>
                    <strong>{item.name}</strong>
                  </td>

                  <td>
                    {item.category || "—"}
                  </td>

                  <td>{item.quantity}</td>

                  <td>
                    <span
                      className={`status-badge status-${(
                        item.condition || "unknown"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {item.condition || "Unknown"}
                    </span>
                  </td>

                  <td>
                    {item.location || "—"}
                  </td>

                  <td>
                    <span
                      className={`status-badge status-${(
                        item.status || "unknown"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {item.status || "Unknown"}
                    </span>
                  </td>

                  <td>
                    <div className="inventory-actions">
                      <button
                        type="button"
                        className="inventory-edit-button"
                        onClick={() =>
                          openEditForm(item)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="inventory-delete-button"
                        onClick={() =>
                          deleteEquipment(item)
                        }
                        disabled={
                          deletingId === item.id
                        }
                      >
                        {deletingId === item.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Inventory;