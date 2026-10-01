import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Dashboard from "./Pages/Dashboard";
import Inventory from "./Pages/Inventory";
import Repairs from "./Pages/Repairs";
import Employees from "./Pages/Employees";
import Clients from "./Pages/Clients";
import Reports from "./Pages/Reports";
import Login from "./Pages/Login";
import eshlLogo from "./assets/eshl-logo.png";

function App() {
  // =========================
  // AUTHENTICATION
  // =========================

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await loadProfile(currentUser.id);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);
    // =========================
  // LOAD CLIENTS
  // =========================

  useEffect(() => {
    const loadClients = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Clients loading error:",
          error
        );
        return;
      }

      setClients(data || []);
    };

    if (user) {
      loadClients();
    }
  }, [user]);

  // =========================
  // LOAD USER PROFILE
  // =========================

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error(
        "Profile loading error:",
        error
      );
      return;
    }

    setProfile(data);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );
      return;
    }

    setUser(null);
    setProfile(null);
  };

  // =========================
  // CURRENT PAGE
  // =========================

  const [currentPage, setCurrentPage] =
    useState("dashboard");

  // =========================
  // INVENTORY
  // =========================

  const [equipment, setEquipment] = useState([]);
  const [inventoryLoading, setInventoryLoading] =
    useState(true);

  useEffect(() => {
    const loadEquipment = async () => {
      setInventoryLoading(true);

      const { data, error } =
        await supabase
          .from("inventory")
          .select("*")
          .order("created_at", {
            ascending: true,
          });

      if (error) {
        console.error(
          "Inventory loading error:",
          error
        );

        setInventoryLoading(false);
        return;
      }

      setEquipment(data || []);
      setInventoryLoading(false);
    };

    if (user) {
      loadEquipment();
    }
  }, [user]);

  // =========================
  // EMPLOYEES
  // =========================

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] =
    useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      setEmployeesLoading(true);

      const { data, error } =
        await supabase
          .from("employees")
          .select("*")
          .order("created_at", {
            ascending: true,
          });

      if (error) {
        console.error(
          "Employees loading error:",
          error
        );

        setEmployeesLoading(false);
        return;
      }

      setEmployees(data || []);
      setEmployeesLoading(false);
    };

    if (user) {
      loadEmployees();
    }
  }, [user]);

  // =========================
  // REPAIRS
  // =========================

  const [repairs, setRepairs] = useState([]);
  const [repairsLoading, setRepairsLoading] =
    useState(true);

  useEffect(() => {
    const loadRepairs = async () => {
      setRepairsLoading(true);

      const { data, error } =
        await supabase
          .from("repairs")
          .select("*")
          .order("created_at", {
            ascending: true,
          });

      if (error) {
        console.error(
          "Repairs loading error:",
          error
        );

        setRepairsLoading(false);
        return;
      }

      setRepairs(
        (data || []).map((repair) => ({
          id: repair.id,

          client:
            repair.client || "",

          broughtBy:
            repair.brought_by || "",

          equipment:
            repair.equipment || "",

          serial:
            repair.serial || "",

          issue:
            repair.issue || "",

          diagnosis:
            repair.diagnosis || "",

          engineer:
            repair.engineer || "",

          dateReceived:
            repair.date_received || "",

          dueDate:
            repair.due_date || "",

          completedDate:
            repair.completed_date || "",

          estimatedDuration:
            repair.estimated_duration || "",

          partsNeeded:
            repair.parts_needed || "",

          status:
            repair.status || "Received",

          priority:
            repair.priority || "Normal",

          history:
            repair.history || [],

          // =========================
          // REPAIR IMAGES
          // =========================

          images:
            repair.images || [],
        }))
      );

      setRepairsLoading(false);
    };

    if (user) {
      loadRepairs();
    }
  }, [user]);

  // =========================
  // SHOW LOGIN IF NOT LOGGED IN
  // =========================

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // =========================
  // USER DISPLAY
  // =========================

  const displayName =
    profile?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  const displayInitial =
    displayName
      .charAt(0)
      .toUpperCase();

  // =========================
  // MAIN APP
  // =========================

  return (
    <div className="app">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <img
            src={eshlLogo}
            alt="ESHL Logo"
            className="sidebar-logo"
          />

        </div>

        <div className="sidebar-section-label">
          MAIN MENU
        </div>

        <nav className="sidebar-nav">

          {/* Dashboard */}

          <button
            className={`nav-item ${
              currentPage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("dashboard")
            }
          >
            <span className="nav-icon">
              ⌂
            </span>

            <span>
              Dashboard
            </span>
          </button>


          {/* Inventory */}

          <button
            className={`nav-item ${
              currentPage === "inventory"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("inventory")
            }
          >
            <span className="nav-icon">
              ▣
            </span>

            <span>
              Inventory
            </span>
          </button>


          {/* Repairs */}

          <button
            className={`nav-item ${
              currentPage === "repairs"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("repairs")
            }
          >
            <span className="nav-icon">
              ⚙
            </span>

            <span>
              Repairs
            </span>
          </button>


          {/* Clients */}

          <button
            className={`nav-item ${
              currentPage === "clients"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("clients")
            }
          >
            <span className="nav-icon">
              ♙
            </span>

            <span>
              Clients
            </span>
          </button>


          {/* Employees */}

          <button
            className={`nav-item ${
              currentPage === "employees"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("employees")
            }
          >
            <span className="nav-icon">
              ♙
            </span>

            <span>
              Employees
            </span>
          </button>


          {/* Reports */}

          <button
            className={`nav-item ${
              currentPage === "reports"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("reports")
            }
          >
            <span className="nav-icon">
              ▥
            </span>

            <span>
              Reports
            </span>
          </button>

        </nav>


        {/* =========================
            SIDEBAR FOOTER
        ========================= */}

        <div className="sidebar-footer">

          <div className="system-status">

            <span className="status-indicator"></span>

            <div>

              <strong>
                System Online
              </strong>

              <small>
                ESHL Operations
              </small>

            </div>

          </div>


          <button
            className="logout"
            onClick={handleLogout}
          >

            <span className="nav-icon">
              ↪
            </span>

            <span>
              Sign Out
            </span>

          </button>

        </div>

      </aside>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main-content">

        {/* =========================
            TOP BAR
        ========================= */}

        <header className="topbar">

          <div className="topbar-heading">

            <div className="topbar-eyebrow">
              ESHL <span>/</span> OPERATIONS
            </div>

            <h1>

              {currentPage ===
                "dashboard" &&
                "Dashboard"}

              {currentPage ===
                "inventory" &&
                "Inventory"}

              {currentPage ===
                "repairs" &&
                "Repairs"}

              {currentPage ===
                "clients" &&
                "Clients"}

              {currentPage ===
                "employees" &&
                "Employees"}

              {currentPage ===
                "reports" &&
                "Reports"}

            </h1>

            <p>
              Equipment, service and
              workforce management
            </p>

          </div>


          {/* USER */}

          <div className="user">

            <div className="avatar">
              {displayInitial}
            </div>

            <div className="user-info">

              <strong>
                {displayName}
              </strong>

            </div>

            <span className="user-chevron">
              ⌄
            </span>

          </div>

        </header>


        {/* =========================
            PAGES
        ========================= */}

        {currentPage ===
          "dashboard" && (
            <Dashboard
            equipment={equipment}
            repairs={repairs}
            clients={clients}
           />
          )}


        {currentPage ===
          "inventory" && (
            <Inventory
              equipment={equipment}
              setEquipment={setEquipment}
            />
          )}


        {currentPage ===
          "repairs" && (
            <Repairs
              repairs={repairs}
              setRepairs={setRepairs}
              employees={employees}
            />
          )}


        {currentPage ===
          "clients" && (
            <Clients
  clients={clients}
  setClients={setClients}
  repairs={repairs}
/>
          )}


        {currentPage ===
          "employees" && (
            <Employees
              employees={employees}
              setEmployees={setEmployees}
              repairs={repairs}
              setRepairs={setRepairs}
            />
          )}


        {currentPage ===
          "reports" && (
            <Reports
              equipment={equipment}
              repairs={repairs}
              employees={employees}
            />
          )}

      </main>

    </div>
  );
}

export default App;