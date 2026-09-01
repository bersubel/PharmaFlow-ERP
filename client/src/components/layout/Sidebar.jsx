import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  Users,
  UserRound,
  BarChart3,
  ShieldCheck,
  LogOut,
  Leaf,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { hasPermission, getRoleName } from "../../utils/roleUtils";
import "./Sidebar.css";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* =========================================
     USER & ROLE DATA
  ========================================= */
  const initial =
    user?.firstName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "S";

  const roleTitle = getRoleName(user?.role) || "Staff";

  /* =========================================
     LOGOUT HANDLER
  ========================================= */
  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate("/login");
  };

  /* =========================================
     NAVIGATION ITEMS (MAPPED TO DB PERMISSIONS)
  ========================================= */
  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      permission: null, // Accessible by all authenticated staff
    },
    {
      label: "Products",
      path: "/products",
      icon: Package,
      permission: "products.view", // Admin, Manager, Pharmacist, Cashier, Inventory Staff
    },
    {
      label: "Inventory",
      path: "/inventory",
      icon: Warehouse,
      permission: "inventory.view", // Admin, Manager, Pharmacist, Inventory Staff
    },
    {
      label: "Sales",
      path: "/sales",
      icon: ShoppingCart,
      permission: "sales.create", // Admin, Manager, Pharmacist, Cashier
    },
    {
      label: "Purchases",
      path: "/purchases",
      icon: Truck,
      permission: "inventory.manage", // Admin, Manager, Inventory Staff
    },
    {
      label: "Customers",
      path: "/customers",
      icon: Users,
      permission: "sales.create", // Admin, Manager, Pharmacist, Cashier
    },
    {
      label: "Suppliers",
      path: "/suppliers",
      icon: UserRound,
      permission: "inventory.manage", // Admin, Manager, Inventory Staff
    },
    {
      label: "Reports",
      path: "/reports",
      icon: BarChart3,
      permission: "reports.view", // Admin, Manager
    },
    {
      label: "Users",
      path: "/users",
      icon: ShieldCheck,
      permission: "users.manage", // Admin
    },
  ];

  // Dynamically filters links according to the user's role & permissions in MongoDB
  const visibleMenuItems = menuItems.filter(
    (item) => !item.permission || hasPermission(user, item.permission)
  );

  return (
    <aside className="sidebar">
      {/* =====================================
          BRAND LOGO
      ===================================== */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <Leaf size={34} strokeWidth={2} />
        </div>

        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">PharmaFlow</div>
          <div className="sidebar-logo-subtitle">PHARMACY ERP</div>
        </div>
      </div>

      {/* =====================================
          MAIN MENU NAVIGATION
      ===================================== */}
      <div className="sidebar-menu-wrapper">
        <div className="sidebar-section-title">MAIN MENU</div>

        <nav className="sidebar-nav">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={21} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* =====================================
          BOTTOM / PROFILE & LOGOUT
      ===================================== */}
      <div className="sidebar-bottom">
        <div className="sidebar-bottom-profile">
          <div
            className="sidebar-avatar"
            title={`${user?.firstName || "User"} (${roleTitle})`}
          >
            {initial}
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={20} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;