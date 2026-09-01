import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiUsers,
  FiUserPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiClock,
  FiAlertTriangle,
  FiX,
  FiLock,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";

import useAuth from "../../../hooks/useAuth";
import {
  fetchUsers,
  fetchRoles,
  createNewUser,
  updateUserDetails,
  toggleUserStatus,
  removeUser,
} from "../services/userService";
import "./UsersPage.css";

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (firstName = "", lastName = "") => {
  const f = firstName.trim().charAt(0).toUpperCase();
  const l = lastName.trim().charAt(0).toUpperCase();
  return `${f}${l}` || "U";
};

const formatDate = (dateString) => {
  if (!dateString) return "Never";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRoleBadgeTone = (roleName = "") => {
  const normalized = roleName.toLowerCase();
  if (normalized.includes("admin")) return "role-admin";
  if (normalized.includes("manager")) return "role-manager";
  if (normalized.includes("pharmacist")) return "role-pharmacist";
  if (normalized.includes("cashier")) return "role-cashier";
  if (normalized.includes("inventory")) return "role-inventory";
  return "role-default";
};

/* =========================================================
   COMPONENT
========================================================= */

const UsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // Custom Dropdown Open/Close States
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    isActive: true,
  });

  // Delete Confirmation State
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  /* =====================================================
     LOAD DATA
  ===================================================== */
  const loadData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError("");

      const [usersRes, rolesRes] = await Promise.all([
        fetchUsers(),
        fetchRoles(),
      ]);

      if (usersRes?.success) {
        setUsers(usersRes.data || []);
      }
      if (rolesRes?.success) {
        setRoles(rolesRes.data || []);
      }
    } catch (err) {
      console.error("Load users error:", err);
      setError(
        err.response?.data?.message || "Failed to load users and roles."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  /* =====================================================
     MODAL CONTROLS
  ===================================================== */
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      role: roles[0]?._id || "",
      isActive: true,
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (targetUser) => {
    setIsEditing(true);
    setEditingUserId(targetUser._id);
    setFormData({
      firstName: targetUser.firstName || "",
      lastName: targetUser.lastName || "",
      email: targetUser.email || "",
      password: "",
      phone: targetUser.phone || "",
      role: typeof targetUser.role === "object" ? targetUser.role._id : targetUser.role,
      isActive: targetUser.isActive !== false,
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingUserId(null);
    setError("");
  };

  /* =====================================================
     FORM SUBMISSION
  ===================================================== */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    try {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error("First and last name are required");
      }
      if (!formData.email.trim()) {
        throw new Error("Email address is required");
      }
      if (!formData.role) {
        throw new Error("Please select an assigned role");
      }
      if (!isEditing && (!formData.password || formData.password.length < 6)) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (isEditing) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        const res = await updateUserDetails(editingUserId, payload);
        if (res?.success) {
          showSuccess("User details updated successfully.");
          handleCloseModal();
          loadData(true);
        }
      } else {
        const res = await createNewUser(formData);
        if (res?.success) {
          showSuccess("New user created successfully.");
          handleCloseModal();
          loadData(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save user.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     STATUS TOGGLE & DELETE
  ===================================================== */
  const handleToggleStatus = async (targetUser) => {
    if (targetUser._id === currentUser?._id) {
      setError("You cannot deactivate your own logged-in account.");
      return;
    }

    try {
      const nextStatus = !targetUser.isActive;
      const res = await toggleUserStatus(targetUser._id, nextStatus);
      if (res?.success) {
        showSuccess(
          `${targetUser.firstName} is now ${nextStatus ? "Active" : "Inactive"}`
        );
        setUsers((prev) =>
          prev.map((u) =>
            u._id === targetUser._id ? { ...u, isActive: nextStatus } : u
          )
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update account status."
      );
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteCandidate) return;

    if (deleteCandidate._id === currentUser?._id) {
      setError("You cannot delete your own logged-in account.");
      setDeleteCandidate(null);
      return;
    }

    try {
      setActionLoading(true);
      const res = await removeUser(deleteCandidate._id);
      if (res?.success) {
        showSuccess("User account permanently deleted.");
        setDeleteCandidate(null);
        setUsers((prev) => prev.filter((u) => u._id !== deleteCandidate._id));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user account.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     FILTERING & SEARCH
  ===================================================== */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = fullName.includes(search) || email.includes(search);

      const roleName =
        typeof u.role === "object" ? u.role?.name : u.role || "";
      const matchesRole =
        selectedRoleFilter === "ALL" || roleName === selectedRoleFilter;

      const matchesStatus =
        selectedStatusFilter === "ALL" ||
        (selectedStatusFilter === "ACTIVE" && u.isActive) ||
        (selectedStatusFilter === "INACTIVE" && !u.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRoleFilter, selectedStatusFilter]);

  const statusOptions = [
    { value: "ALL", label: "All Statuses" },
    { value: "ACTIVE", label: "Active Only" },
    { value: "INACTIVE", label: "Inactive Only" },
  ];

  const currentRoleLabel =
    selectedRoleFilter === "ALL"
      ? "All Roles"
      : selectedRoleFilter;

  const currentStatusLabel =
    statusOptions.find((opt) => opt.value === selectedStatusFilter)?.label ||
    "All Statuses";

  return (
    <div className="users-page">
      {/* =================================================
          PAGE HEADER
      ================================================= */}
      <header className="users-header">
        <div>
          <div className="users-eyebrow">
            <FiShield size={14} />
            <span>ACCESS CONTROL & SECURITY</span>
          </div>
          <h1>User Management</h1>
          <p>
            Create accounts, assign role permissions, and control team member
            access across PharmaFlow.
          </p>
        </div>

        <div className="users-header-actions">
          <button
            type="button"
            className="user-btn-secondary"
            onClick={() => loadData(true)}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? "spinning" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="user-btn-primary"
            onClick={handleOpenCreateModal}
          >
            <FiUserPlus size={16} />
            <span>Add New User</span>
          </button>
        </div>
      </header>

      {/* Notification Banners */}
      {successMsg && (
        <div className="user-banner success">
          <FiCheckCircle size={17} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="user-banner error">
          <FiAlertTriangle size={17} />
          <span>{error}</span>
          <button
            type="button"
            className="banner-close-btn"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          METRICS CARDS
      ================================================= */}
      <section className="users-stats-grid">
        <div className="user-stat-card">
          <div className="stat-icon-wrap green">
            <FiUsers size={20} />
          </div>
          <div>
            <span className="stat-title">Total Staff</span>
            <strong className="stat-number">{users.length}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon-wrap blue">
            <FiCheckCircle size={20} />
          </div>
          <div>
            <span className="stat-title">Active Accounts</span>
            <strong className="stat-number">
              {users.filter((u) => u.isActive).length}
            </strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon-wrap purple">
            <FiShield size={20} />
          </div>
          <div>
            <span className="stat-title">Configured Roles</span>
            <strong className="stat-number">{roles.length}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon-wrap orange">
            <FiXCircle size={20} />
          </div>
          <div>
            <span className="stat-title">Inactive / Suspended</span>
            <strong className="stat-number">
              {users.filter((u) => !u.isActive).length}
            </strong>
          </div>
        </div>
      </section>

      {/* =================================================
          TOOLBAR (SEARCH & CUSTOM STYLED DROPDOWNS)
      ================================================= */}
      <section className="users-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search staff by name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {/* Custom Styled Role Dropdown */}
          <div className="custom-filter-dropdown">
            <button
              type="button"
              className={`filter-pill-btn ${isRoleDropdownOpen ? "open" : ""}`}
              onClick={() => {
                setIsRoleDropdownOpen((prev) => !prev);
                setIsStatusDropdownOpen(false);
              }}
            >
              <span>{currentRoleLabel}</span>
              <FiChevronDown
                size={14}
                className={`dropdown-chevron ${isRoleDropdownOpen ? "rotate" : ""}`}
              />
            </button>

            {isRoleDropdownOpen && (
              <>
                <div
                  className="dropdown-backdrop"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="custom-filter-menu">
                  <button
                    type="button"
                    className={`filter-menu-item ${
                      selectedRoleFilter === "ALL" ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedRoleFilter("ALL");
                      setIsRoleDropdownOpen(false);
                    }}
                  >
                    All Roles
                  </button>
                  {roles.map((r) => (
                    <button
                      key={r._id}
                      type="button"
                      className={`filter-menu-item ${
                        selectedRoleFilter === r.name ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedRoleFilter(r.name);
                        setIsRoleDropdownOpen(false);
                      }}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Custom Styled Status Dropdown */}
          <div className="custom-filter-dropdown">
            <button
              type="button"
              className={`filter-pill-btn ${isStatusDropdownOpen ? "open" : ""}`}
              onClick={() => {
                setIsStatusDropdownOpen((prev) => !prev);
                setIsRoleDropdownOpen(false);
              }}
            >
              <span>{currentStatusLabel}</span>
              <FiChevronDown
                size={14}
                className={`dropdown-chevron ${isStatusDropdownOpen ? "rotate" : ""}`}
              />
            </button>

            {isStatusDropdownOpen && (
              <>
                <div
                  className="dropdown-backdrop"
                  onClick={() => setIsStatusDropdownOpen(false)}
                />
                <div className="custom-filter-menu">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`filter-menu-item ${
                        selectedStatusFilter === opt.value ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedStatusFilter(opt.value);
                        setIsStatusDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          USERS TABLE
      ================================================= */}
      <section className="users-table-card">
        {loading ? (
          <div className="users-loading-state">
            <FiRefreshCw className="spinning" size={28} />
            <p>Loading company users & permission profiles...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-empty-state">
            <FiUsers size={32} />
            <h3>No users found</h3>
            <p>Try adjusting your search criteria or create a new user profile.</p>
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>TEAM MEMBER</th>
                  <th>ROLE & PERMISSIONS</th>
                  <th>CONTACT INFO</th>
                  <th>ACCOUNT STATUS</th>
                  <th>LAST LOGIN</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => {
                  const roleName =
                    typeof item.role === "object"
                      ? item.role?.name
                      : item.role || "Staff";
                  const badgeTone = getRoleBadgeTone(roleName);
                  const isSelf = item._id === currentUser?._id;

                  return (
                    <tr key={item._id} className={!item.isActive ? "row-inactive" : ""}>
                      {/* Name & Initials */}
                      <td>
                        <div className="user-profile-cell">
                          <div className={`user-avatar ${badgeTone}`}>
                            {getInitials(item.firstName, item.lastName)}
                          </div>
                          <div className="user-names">
                            <strong>
                              {item.firstName} {item.lastName}{" "}
                              {isSelf && <span className="self-tag">(You)</span>}
                            </strong>
                            <span>{item.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td>
                        <div className="role-cell">
                          <span className={`role-badge ${badgeTone}`}>
                            <FiShield size={12} />
                            {roleName}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div className="contact-cell">
                          <span>
                            <FiMail size={13} /> {item.email}
                          </span>
                          {item.phone && (
                            <span className="text-muted">
                              <FiPhone size={13} /> {item.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active Status Toggle */}
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${
                            item.isActive ? "active" : "inactive"
                          }`}
                          onClick={() => handleToggleStatus(item)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "You cannot deactivate yourself"
                              : "Click to toggle account access"
                          }
                        >
                          <span className="toggle-dot" />
                          <span>{item.isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td>
                        <span className="last-login-cell">
                          <FiClock size={13} />
                          {formatDate(item.lastLogin || item.updatedAt)}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td>
                        <div className="actions-cell">
                          <button
                            type="button"
                            className="action-icon-btn edit"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit user details and role"
                          >
                            <FiEdit2 size={15} />
                          </button>

                          <button
                            type="button"
                            className="action-icon-btn delete"
                            onClick={() => setDeleteCandidate(item)}
                            disabled={isSelf}
                            title={
                              isSelf
                                ? "You cannot delete your own account"
                                : "Delete user permanently"
                            }
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div>
                <h3>{isEditing ? "Edit User Profile" : "Add New Team Member"}</h3>
                <p>
                  {isEditing
                    ? "Update credentials, contact information, and assigned permissions."
                    : "Fill out member credentials to grant PharmaFlow ERP access."}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <div className="input-with-icon">
                      <FiUser size={15} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Abebe"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Last Name *</label>
                    <div className="input-with-icon">
                      <FiUser size={15} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kebede"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <div className="input-with-icon">
                    <FiMail size={15} />
                    <input
                      type="email"
                      required
                      placeholder="e.g. abebe@pharmaflow.et"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    {isEditing
                      ? "New Password (Leave blank to keep existing)"
                      : "Password (Min. 6 chars) *"}
                  </label>
                  <div className="input-with-icon">
                    <FiLock size={15} />
                    <input
                      type="password"
                      placeholder={isEditing ? "••••••••" : "Enter secure password"}
                      required={!isEditing}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-with-icon">
                      <FiPhone size={15} />
                      <input
                        type="tel"
                        placeholder="e.g. +251 91 234 5678"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>System Role *</label>
                    <select
                      className="modal-select"
                      required
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option value="" disabled>
                        Select a role...
                      </option>
                      {roles.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} ({r.description || "Active"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-checkbox-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                    <span className="checkmark" />
                    <strong>Active Account Status</strong>
                  </label>
                  <p className="checkbox-hint">
                    Deactivating this account will immediately block POS,
                    inventory, and login access.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="user-btn-secondary"
                  onClick={handleCloseModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="user-btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Saving..."
                    : isEditing
                    ? "Update User"
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          DELETE CONFIRMATION MODAL
      ================================================= */}
      {deleteCandidate && (
        <div className="modal-backdrop">
          <div className="modal-dialog delete-dialog">
            <div className="delete-icon-banner">
              <FiTrash2 size={24} />
            </div>
            <h3>Delete User Account?</h3>
            <p>
              Are you sure you want to permanently delete{" "}
              <strong>
                {deleteCandidate.firstName} {deleteCandidate.lastName}
              </strong>{" "}
              (<code>{deleteCandidate.email}</code>)? This action cannot be undone.
            </p>

            <div className="modal-footer delete-footer">
              <button
                type="button"
                className="user-btn-secondary"
                onClick={() => setDeleteCandidate(null)}
                disabled={actionLoading}
              >
                Keep Account
              </button>
              <button
                type="button"
                className="delete-confirm-btn"
                onClick={handleDeleteUser}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;