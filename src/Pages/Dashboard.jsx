function Dashboard({ equipment, repairs, clients = [] }) {
  const totalEquipment = equipment.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const faultyEquipment = equipment
    .filter(
      (item) => item.condition === "Faulty"
    )
    .reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  const activeRepairs = repairs.filter(
    (repair) =>
      repair.status !== "Completed" &&
      repair.status !== "Collected"
  ).length;

  const broadcastEquipment = equipment
    .filter(
      (item) =>
        item.category === "Broadcast"
    )
    .reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  const audioEquipment = equipment
    .filter(
      (item) =>
        item.category === "Audio"
    )
    .reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  const satelliteEquipment = equipment
    .filter(
      (item) =>
        item.category === "Satellite"
    )
    .reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  const itEquipment = equipment
    .filter(
      (item) =>
        item.category === "IT"
    )
    .reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  const recentRepairs = [...repairs]
    .sort(
      (a, b) =>
        new Date(b.dateReceived) -
        new Date(a.dateReceived)
    )
    .slice(0, 3);

  return (
    <div className="page">
      <div className="page-header"></div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>

          <div>
            <span>Total Equipment</span>
            <strong>{totalEquipment}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔧</div>

          <div>
            <span>Active Repairs</span>
            <strong>{activeRepairs}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏢</div>

          <div>
            <span>Clients</span>
            <strong>{clients.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>

          <div>
            <span>Faulty Equipment</span>
            <strong>{faultyEquipment}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Repairs</h3>
          </div>

          {recentRepairs.length === 0 ? (
            <div className="recent-repair">
              <div>
                <p>
                  No repair records available.
                </p>
              </div>
            </div>
          ) : (
            recentRepairs.map((repair) => (
              <div
                className="recent-repair"
                key={repair.id}
              >
                <div>
                  <strong>{repair.id}</strong>

                  <p>
                    {repair.client ||
                      "No client"}{" "}
                    —{" "}
                    {repair.equipmentName ||
                      repair.equipment ||
                      "Equipment"}
                  </p>
                </div>

                <span
                  className={`status-badge status-${(
                    repair.status || "unknown"
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {repair.status ||
                    "Unknown"}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Inventory Overview</h3>
          </div>

          <div className="inventory-overview">
            <div>
              <span>
                Broadcast Equipment
              </span>

              <strong>
                {broadcastEquipment}
              </strong>
            </div>

            <div>
              <span>
                Audio Equipment
              </span>

              <strong>
                {audioEquipment}
              </strong>
            </div>

            <div>
              <span>
                Satellite Equipment
              </span>

              <strong>
                {satelliteEquipment}
              </strong>
            </div>

            <div>
              <span>IT Equipment</span>

              <strong>
                {itEquipment}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;