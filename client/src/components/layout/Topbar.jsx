import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Command,
  X,
  Check,
  User,
  LogOut,
  AlertTriangle,
  Lock,
  Phone,
  Mail,
  CheckCircle,
  KeyRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Topbar.css";

/* =========================================================
   HELPERS
========================================================= */

const formatDateShort = (dateString) => {
  if (!dateString) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
};

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [searchValue, setSearchValue] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Live Notifications State
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Profile Modal & Sliding Tab State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security'
  const [profileFormData, setProfileFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // =====================================================
  // USER METADATA
  // =====================================================

  const roleName =
    typeof user?.role === "string"
      ? user.role
      : typeof user?.role?.name === "string"
      ? user.role.name
      : "Staff";

  const firstName =
    typeof user?.firstName === "string" ? user.firstName.trim() : "";
  const lastName =
    typeof user?.lastName === "string" ? user.lastName.trim() : "";
  const fullName = `${firstName} ${lastName}`.trim() || user?.email || "User";

  const initial =
    firstName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  // =====================================================
  // NETWORK STATUS LISTENER
  // =====================================================

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // =====================================================
  // FETCH LIVE NOTIFICATIONS
  // =====================================================

  const fetchLiveNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const res = await api.get("/dashboard");
      if (res?.data?.success) {
        const stats = res.data.data;
        const generatedAlerts = [];

        // Low stock alerts
        if (stats?.inventory?.lowStockProducts?.length > 0) {
          stats.inventory.lowStockProducts.slice(0, 5).forEach((item) => {
            generatedAlerts.push({
              id: `low-${item._id}`,
              type: "low_stock",
              title: "Low stock alert",
              message: `${item.name} has only ${item.quantity} units left (Reorder: ${item.reorderLevel}).`,
              time: "Action required",
              unread: true,
              link: "/inventory",
            });
          });
        }

        // Expiring products
        if (stats?.inventory?.expiredProducts?.length > 0) {
          stats.inventory.expiredProducts.slice(0, 5).forEach((item) => {
            const isAlreadyExpired =
              item.isExpired !== undefined
                ? item.isExpired
                : new Date(item.expiryDate) < new Date();

            generatedAlerts.push({
              id: `exp-${item._id}`,
              type: "expiry",
              title: isAlreadyExpired ? "Expired Stock" : "Expiring Medicine",
              message: isAlreadyExpired
                ? `${item.name} expired on ${formatDateShort(item.expiryDate)}.`
                : `${item.name} will expire in ${item.daysLeft} days (${formatDateShort(item.expiryDate)}).`,
              time: isAlreadyExpired ? "Immediate disposal" : "30-day window",
              unread: true,
              link: "/inventory",
            });
          });
        }

        setNotifications(generatedAlerts);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveNotifications();
  }, [fetchLiveNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // =====================================================
  // CLICK OUTSIDE & KEYBOARD SHORTCUTS
  // =====================================================

  useEffect(() => {
    const handleKeyboard = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowProfile(false);
        setIsSettingsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =====================================================
  // NOTIFICATION ACTIONS
  // =====================================================

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowProfile(false);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markNotificationRead = (notificationId, link) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, unread: false } : n
      )
    );
    if (link) {
      setShowNotifications(false);
      navigate(link);
    }
  };

  // =====================================================
  // PROFILE & SETTINGS MODAL CONTROLS
  // =====================================================

  const toggleProfile = () => {
    setShowProfile((prev) => !prev);
    setShowNotifications(false);
  };

  const handleOpenProfileModal = (tab = "profile") => {
    setShowProfile(false);
    setActiveTab(tab);
    setProfileFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      password: "",
      confirmPassword: "",
    });
    setSettingsError("");
    setSettingsSuccess("");
    setIsSettingsModalOpen(true);
  };

  const handleLogout = () => {
    setShowProfile(false);
    logout();
    navigate("/login");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError("");
    setSettingsSuccess("");

    try {
      if (activeTab === "profile") {
        if (!profileFormData.firstName.trim() || !profileFormData.lastName.trim()) {
          throw new Error("First and last name are required");
        }
      }

      if (activeTab === "security") {
        if (!profileFormData.password) {
          throw new Error("Please enter a new password");
        }
        if (profileFormData.password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
        if (profileFormData.password !== profileFormData.confirmPassword) {
          throw new Error("New passwords do not match");
        }
      }

      const payload = {
        firstName: profileFormData.firstName.trim(),
        lastName: profileFormData.lastName.trim(),
        phone: profileFormData.phone.trim(),
      };

      if (profileFormData.password) {
        payload.password = profileFormData.password;
      }

      const res = await api.put(`/users/${user?._id}`, payload);
      if (res?.data?.success) {
        setSettingsSuccess(
          activeTab === "security"
            ? "Password changed successfully!"
            : "Profile updated successfully!"
        );
        setTimeout(() => {
          setIsSettingsModalOpen(false);
        }, 1200);
      }
    } catch (err) {
      setSettingsError(
        err.response?.data?.message || err.message || "Failed to update profile."
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  // =====================================================
  // SEARCH HANDLER
  // =====================================================

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    if (!query) return;

    if (query.toLowerCase().includes("sale") || query.toLowerCase().includes("pos")) {
      navigate("/sales");
    } else if (query.toLowerCase().includes("inventory") || query.toLowerCase().includes("stock")) {
      navigate("/inventory");
    } else if (query.toLowerCase().includes("purchase")) {
      navigate("/purchases");
    } else {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
    setSearchValue("");
  };

  return (
    <>
      <header className="topbar">
        {/* =================================================
            SEARCH
        ================================================= */}
        <form className="topbar-search" onSubmit={handleSearchSubmit}>
          <Search size={18} strokeWidth={1.8} />

          <input
            ref={searchRef}
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search products, orders, customers (Ctrl+K)..."
            aria-label="Search"
          />

          {searchValue && (
            <button
              type="button"
              className="topbar-search-clear"
              onClick={() => setSearchValue("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}

          {!searchValue && (
            <div className="topbar-search-shortcut">
              <Command size={10} />
              <span>K</span>
            </div>
          )}
        </form>

        {/* =================================================
            RIGHT CONTROLS
        ================================================= */}
        <div className="topbar-right">
          {/* Live Online/Offline Status Indicator */}
          <div className={`topbar-status ${isOnline ? "online" : "offline"}`}>
            <span className="topbar-status-dot" />
            <span>{isOnline ? "System online" : "Offline mode"}</span>
          </div>

          {/* =================================================
              NOTIFICATIONS DROPDOWN
          ================================================= */}
          <div className="topbar-dropdown-wrapper" ref={notificationRef}>
            <button
              type="button"
              className="topbar-notification"
              aria-label="Notifications"
              aria-expanded={showNotifications}
              onClick={toggleNotifications}
            >
              <Bell size={20} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="topbar-notification-dot">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="topbar-dropdown notification-dropdown">
                <div className="notification-dropdown-header">
                  <div>
                    <strong>Notifications</strong>
                    <span>{unreadCount} alerts requiring action</span>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      title="Mark all as read"
                    >
                      <Check size={13} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notification-list">
                  {loadingNotifications ? (
                    <div className="notification-empty">Checking alerts...</div>
                  ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                      All inventory and sales alerts are cleared.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notification-item ${n.unread ? "unread" : ""}`}
                        onClick={() => markNotificationRead(n.id, n.link)}
                      >
                        <span
                          className={`notification-icon ${
                            n.type === "expiry" ? "danger" : "warning"
                          }`}
                        >
                          <AlertTriangle size={15} />
                        </span>

                        <span className="notification-content">
                          <strong>{n.title}</strong>
                          <span>{n.message}</span>
                          <small>{n.time}</small>
                        </span>

                        {n.unread && <span className="notification-unread-dot" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              USER PROFILE DROPDOWN
          ================================================= */}
          <div className="topbar-dropdown-wrapper" ref={profileRef}>
            <button
              type="button"
              className="topbar-user-button"
              aria-expanded={showProfile}
              onClick={toggleProfile}
            >
              <div className="topbar-avatar">{initial}</div>

              <div className="topbar-user-info">
                <strong>{fullName}</strong>
                <span>{roleName}</span>
              </div>

              <ChevronDown
                size={17}
                className={`topbar-user-chevron ${showProfile ? "open" : ""}`}
              />
            </button>

            {showProfile && (
              <div className="topbar-dropdown profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">{initial}</div>

                  <div className="profile-header-details">
                    <strong>{fullName}</strong>
                    <span className="profile-header-email">{user?.email || "No email"}</span>
                    <span className="profile-role-tag">{roleName}</span>
                  </div>
                </div>

                <div className="profile-dropdown-divider" />

                {/* Profile Settings */}
                <button
                  type="button"
                  onClick={() => handleOpenProfileModal("profile")}
                >
                  <User size={16} />
                  <span>Profile Settings</span>
                </button>

                <div className="profile-dropdown-divider" />

                {/* Logout */}
                <button
                  type="button"
                  className="profile-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =================================================
          PROFILE & SECURITY SLIDING TAB MODAL
      ================================================= */}
      {isSettingsModalOpen && (
        <div
          className="topbar-modal-backdrop"
          onClick={() => setIsSettingsModalOpen(false)}
        >
          <div
            className="topbar-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="topbar-modal-header">
              <div>
                <h3>Account & Security</h3>
                <p>Manage your personal profile and login credentials</p>
              </div>
              <button
                type="button"
                className="topbar-modal-close"
                onClick={() => setIsSettingsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sliding Side-by-Side Segmented Navigation */}
            <div className="topbar-sliding-nav">
              <button
                type="button"
                className={`sliding-tab-btn ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("profile");
                  setSettingsError("");
                  setSettingsSuccess("");
                }}
              >
                <User size={15} />
                <span>Profile Information</span>
              </button>

              <button
                type="button"
                className={`sliding-tab-btn ${activeTab === "security" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("security");
                  setSettingsError("");
                  setSettingsSuccess("");
                }}
              >
                <KeyRound size={15} />
                <span>Password & Security</span>
              </button>

              {/* Animated Sliding Background Pill */}
              <div
                className={`sliding-pill-indicator ${
                  activeTab === "security" ? "slide-right" : "slide-left"
                }`}
              />
            </div>

            {settingsSuccess && (
              <div className="modal-banner success">
                <CheckCircle size={16} />
                <span>{settingsSuccess}</span>
              </div>
            )}

            {settingsError && (
              <div className="modal-banner error">
                <AlertTriangle size={16} />
                <span>{settingsError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="topbar-modal-body">
                {activeTab === "profile" ? (
                  /* =========================================
                     TAB 1: PROFILE INFORMATION
                  ========================================= */
                  <div className="tab-pane-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <div className="input-with-icon">
                          <User size={15} />
                          <input
                            type="text"
                            required
                            placeholder="First Name"
                            value={profileFormData.firstName}
                            onChange={(e) =>
                              setProfileFormData({
                                ...profileFormData,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Last Name *</label>
                        <div className="input-with-icon">
                          <User size={15} />
                          <input
                            type="text"
                            required
                            placeholder="Last Name"
                            value={profileFormData.lastName}
                            onChange={(e) =>
                              setProfileFormData({
                                ...profileFormData,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <div className="input-with-icon">
                        <Mail size={15} />
                        <input
                          type="email"
                          disabled
                          value={profileFormData.email}
                          className="input-disabled"
                        />
                      </div>
                      <small className="assigned-role-text">
                        Assigned Role: <strong>{roleName}</strong>
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <div className="input-with-icon">
                        <Phone size={15} />
                        <input
                          type="tel"
                          placeholder="e.g. +251 91 234 5678"
                          value={profileFormData.phone}
                          onChange={(e) =>
                            setProfileFormData({
                              ...profileFormData,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* =========================================
                     TAB 2: PASSWORD & SECURITY
                  ========================================= */
                  <div className="tab-pane-content">
                    <div className="form-group">
                      <label>New Password (Min. 6 characters) *</label>
                      <div className="input-with-icon">
                        <Lock size={15} />
                        <input
                          type="password"
                          required
                          placeholder="Enter your new password"
                          value={profileFormData.password}
                          onChange={(e) =>
                            setProfileFormData({
                              ...profileFormData,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password *</label>
                      <div className="input-with-icon">
                        <Lock size={15} />
                        <input
                          type="password"
                          required
                          placeholder="Repeat new password"
                          value={profileFormData.confirmPassword}
                          onChange={(e) =>
                            setProfileFormData({
                              ...profileFormData,
                              confirmPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="topbar-modal-footer">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setIsSettingsModalOpen(false)}
                  disabled={settingsLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={settingsLoading}
                >
                  {settingsLoading
                    ? "Saving Changes..."
                    : activeTab === "security"
                    ? "Change Password"
                    : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;