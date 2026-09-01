import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Truck,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Clock3,
  Plus,
  RefreshCw,
  ChevronDown,
  CalendarX,
  Warehouse,
  FileBarChart,
} from "lucide-react";

import useAuth from "../../../hooks/useAuth";
import api from "../../../services/api";
import { hasPermission, getRoleName } from "../../../utils/roleUtils";
import "./DashboardPage.css";

/* =========================================================
   HELPERS & FORMATTERS
========================================================= */

const formatCurrency = (amount = 0) => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

const getCustomerName = (customer) => {
  if (!customer) return "Walk-in customer";
  if (typeof customer === "string") return customer;
  const first = customer.firstName || "";
  const last = customer.lastName || "";
  return `${first} ${last}`.trim() || customer.name || "Walk-in customer";
};

const formatTime = (dateString) => {
  if (!dateString) return "--";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
};

const formatDateShort = (dateString) => {
  if (!dateString) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
};

const buildSmoothSvgPath = (points = []) => {
  if (!points.length) return { linePath: "", areaPath: "" };
  if (points.length === 1) {
    return {
      linePath: `M 0,${points[0].y} L 700,${points[0].y}`,
      areaPath: `M 0,${points[0].y} L 700,${points[0].y} L 700,260 L 0,260 Z`,
    };
  }

  let linePath = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;

    linePath += ` C ${controlX},${current.y} ${controlX},${next.y} ${next.x},${next.y}`;
  }

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath = `${linePath} L ${lastPoint.x},260 L ${firstPoint.x},260 Z`;

  return { linePath, areaPath };
};

const periodOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
];

/* =========================================================
   DASHBOARD COMPONENT
========================================================= */

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.firstName || "User";
  const userRole = getRoleName(user?.role) || "Staff";
  const normalizedRole = userRole.toLowerCase();

  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [hoveredPoint, setHoveredPoint] = useState(null);

  /* =====================================================
     LOAD DATA
  ===================================================== */
  const loadDashboard = useCallback(
    async (isManual = false, periodToFetch = selectedPeriod) => {
      try {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        const response = await api.get(`/dashboard?period=${periodToFetch}`);

        if (response?.data?.success) {
          setDashboardData(response.data.data);
          setDashboardError("");
        } else {
          setDashboardError(
            response?.data?.message || "Failed to load dashboard data."
          );
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);
        setDashboardError(
          error.response?.data?.message ||
            "Live figures are unavailable right now."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedPeriod]
  );

  useEffect(() => {
    loadDashboard(false, selectedPeriod);
  }, [selectedPeriod, loadDashboard]);

  /* =====================================================
     DYNAMIC CHART CALCULATIONS
  ===================================================== */
  const chartData = useMemo(() => {
    const rawList = dashboardData?.salesChart || [];

    if (!rawList.length) {
      return {
        points: [],
        linePath: "",
        areaPath: "",
        yMax: 1000,
        yLabels: [1000, 750, 500, 250, 0],
      };
    }

    const maxRevenue = Math.max(...rawList.map((d) => d.revenue), 1000);
    const yMax = Math.ceil(maxRevenue / 1000) * 1000;

    const svgWidth = 700;
    const svgHeight = 220;
    const paddingX = 25;

    const points = rawList.map((item, index) => {
      const x =
        paddingX +
        (index / (rawList.length - 1 || 1)) * (svgWidth - paddingX * 2);
      const y = svgHeight - (item.revenue / yMax) * (svgHeight - 40) + 20;
      return { x, y, ...item };
    });

    const { linePath, areaPath } = buildSmoothSvgPath(points);

    return {
      points,
      linePath,
      areaPath,
      yMax,
      yLabels: [
        yMax,
        Math.round(yMax * 0.75),
        Math.round(yMax * 0.5),
        Math.round(yMax * 0.25),
        0,
      ],
    };
  }, [dashboardData]);

  /* =====================================================
     ROLE-BASED STAT CARDS
  ===================================================== */
  const statsList = useMemo(() => {
    if (normalizedRole === "cashier") {
      return [
        {
          title: "My Sales Today",
          value: formatCurrency(dashboardData?.today?.revenue ?? 0),
          change: `${dashboardData?.today?.salesCount ?? 0} transactions completed`,
          trend: "up",
          icon: ShoppingCart,
          className: "blue",
          onClick: () => navigate("/sales"),
        },
        {
          title: "Total Registered Sales",
          value: (dashboardData?.counts?.sales ?? 0).toLocaleString(),
          change: "My total processed",
          trend: "up",
          icon: Package,
          className: "green",
          onClick: () => navigate("/sales"),
        },
        {
          title: "Available Medicines",
          value: (dashboardData?.counts?.products ?? 0).toLocaleString(),
          change: "Active catalog items",
          trend: "up",
          icon: Warehouse,
          className: "purple",
          onClick: () => navigate("/products"),
        },
        {
          title: "Customer Profiles",
          value: (dashboardData?.counts?.customers ?? 0).toLocaleString(),
          change: "Active database",
          trend: "up",
          icon: Users,
          className: "orange",
          onClick: () => navigate("/customers"),
        },
      ];
    }

    if (normalizedRole === "inventory staff") {
      return [
        {
          title: "Total Units in Stock",
          value: (dashboardData?.inventory?.totalQuantity ?? 0).toLocaleString(),
          change: `${dashboardData?.counts?.products ?? 0} products`,
          trend: "up",
          icon: Warehouse,
          className: "green",
          onClick: () => navigate("/inventory"),
        },
        {
          title: "Low Stock Alert",
          value: (dashboardData?.inventory?.lowStockCount ?? 0).toString(),
          change: "Below reorder level",
          trend: (dashboardData?.inventory?.lowStockCount ?? 0) > 0 ? "warning" : "up",
          icon: AlertTriangle,
          className: "orange",
          onClick: () => navigate("/inventory"),
        },
        {
          title: "Ex Stocks / Expiring",
          value: (dashboardData?.inventory?.expiredCount ?? 0).toString(),
          change: "Immediate attention",
          trend: (dashboardData?.inventory?.expiredCount ?? 0) > 0 ? "warning" : "up",
          icon: CalendarX,
          className: "blue",
          onClick: () => navigate("/inventory"),
        },
        {
          title: "Purchase Invoices",
          value: (dashboardData?.counts?.purchases ?? 0).toLocaleString(),
          change: `${dashboardData?.counts?.suppliers ?? 0} active suppliers`,
          trend: "up",
          icon: Truck,
          className: "purple",
          onClick: () => navigate("/purchases"),
        },
      ];
    }

    // Default: Admin, Manager, Pharmacist
    return [
      {
        title: "Total Products",
        value: (dashboardData?.counts?.products ?? 0).toLocaleString(),
        change: `${dashboardData?.inventory?.totalQuantity ?? 0} total units`,
        trend: "up",
        icon: Package,
        className: "green",
        onClick: () => navigate("/products"),
      },
      {
        title: "Today's Sales",
        value: formatCurrency(dashboardData?.today?.revenue ?? 0),
        change: `${dashboardData?.today?.salesCount ?? 0} sales today`,
        trend: "up",
        icon: ShoppingCart,
        className: "blue",
        onClick: () => navigate("/sales"),
      },
      {
        title: "Today's Purchases",
        value: formatCurrency(dashboardData?.today?.purchaseAmount ?? 0),
        change: `${dashboardData?.today?.purchasesCount ?? 0} orders today`,
        trend: "up",
        icon: Truck,
        className: "purple",
        onClick: () => navigate("/purchases"),
      },
      {
        title: "Low Stock Items",
        value: (dashboardData?.inventory?.lowStockCount ?? 0).toString(),
        change:
          (dashboardData?.inventory?.lowStockCount ?? 0) > 0
            ? "Needs attention"
            : "Healthy levels",
        trend:
          (dashboardData?.inventory?.lowStockCount ?? 0) > 0 ? "warning" : "up",
        icon: AlertTriangle,
        className: "orange",
        onClick: () => navigate("/inventory"),
      },
    ];
  }, [dashboardData, normalizedRole, navigate]);

  const lowStockItems = dashboardData?.inventory?.lowStockProducts || [];
  const expiredStockItems = dashboardData?.inventory?.expiredProducts || [];
  const recentSales = dashboardData?.recentSales || [];
  const selectedOptionLabel =
    periodOptions.find((p) => p.value === selectedPeriod)?.label || "Weekly";

  return (
    <div className="dashboard-page">
      {/* =================================================
          HEADER
      ================================================= */}
      <section className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">
            <Activity size={14} />
            <span>PHARMACY OVERVIEW • {userRole.toUpperCase()}</span>
          </div>

          <h1>Good morning, {firstName} 👋</h1>
          <p>
            {normalizedRole === "cashier"
              ? "Here is your sales terminal summary and activity today."
              : normalizedRole === "inventory staff"
              ? "Here is your stock balance, low inventory, and expiry watch."
              : "Here's a quick overview of your pharmacy today."}
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            type="button"
            className="dashboard-date"
            onClick={() => loadDashboard(true, selectedPeriod)}
            disabled={refreshing}
            title="Refresh metrics from database"
          >
            <RefreshCw size={15} className={refreshing ? "spin-icon" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          {hasPermission(user, "sales.create") && (
            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() => navigate("/sales")}
            >
              <Plus size={17} />
              <span>New Sale</span>
            </button>
          )}
        </div>
      </section>

      {/* =================================================
          TOP STAT CARDS
      ================================================= */}
      <section className="stats-grid">
        {statsList.map(
          ({ title, value, change, trend, icon: Icon, className, onClick }) => (
            <article
              className="stat-card"
              key={title}
              onClick={onClick}
              role="button"
              tabIndex={0}
            >
              <div className="stat-card-top">
                <div className={`stat-icon ${className}`}>
                  <Icon size={20} />
                </div>
                <span className="stat-menu">•••</span>
              </div>

              <div className="stat-card-content">
                <span className="stat-title">{title}</span>
                <strong className="stat-value">{loading ? "..." : value}</strong>
              </div>

              <div className="stat-change">
                {trend === "warning" ? (
                  <span className="stat-warning">
                    <AlertTriangle size={13} />
                    {change}
                  </span>
                ) : (
                  <span className="stat-positive">
                    <ArrowUpRight size={13} />
                    {change}
                  </span>
                )}
                {trend !== "warning" && <span>live</span>}
              </div>
            </article>
          )
        )}
      </section>

      {/* =================================================
          MAIN DASHBOARD GRID
      ================================================= */}
      <section className="dashboard-main-grid">
        {/* SALES CHART CARD */}
        <article className="dashboard-card sales-chart-card">
          <div className="card-header">
            <div className="card-header-info">
              <h3>
                {normalizedRole === "cashier"
                  ? "My Sales Performance"
                  : "Sales Overview"}
              </h3>
              <p>Revenue performance & trends</p>
            </div>

            <div className="card-header-actions">
              <div className="custom-dropdown-container">
                <button
                  type="button"
                  className={`dropdown-pill-btn ${isPeriodOpen ? "open" : ""}`}
                  onClick={() => setIsPeriodOpen((prev) => !prev)}
                >
                  <span>{selectedOptionLabel}</span>
                  <ChevronDown
                    size={14}
                    className={`dropdown-chevron ${
                      isPeriodOpen ? "rotate" : ""
                    }`}
                  />
                </button>

                {isPeriodOpen && (
                  <>
                    <div
                      className="dropdown-backdrop"
                      onClick={() => setIsPeriodOpen(false)}
                    />
                    <div className="custom-dropdown-menu">
                      {periodOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`dropdown-menu-item ${
                            selectedPeriod === opt.value ? "active" : ""
                          }`}
                          onClick={() => {
                            setSelectedPeriod(opt.value);
                            setIsPeriodOpen(false);
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {hasPermission(user, "reports.view") && (
                <button
                  type="button"
                  className="view-all-button"
                  onClick={() => navigate("/reports")}
                >
                  Detailed Report
                </button>
              )}
            </div>
          </div>

          <div className="chart-area">
            <div className="chart-y-axis">
              {chartData.yLabels.map((val, idx) => (
                <span key={idx}>
                  {val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                </span>
              ))}
            </div>

            <div className="chart-body">
              <div className="chart-grid-lines">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <svg
                className="sales-chart"
                viewBox="0 0 700 260"
                preserveAspectRatio="none"
                aria-label="Sales overview chart"
              >
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#0b8f69"
                      stopOpacity="0.25"
                    />
                    <stop
                      offset="100%"
                      stopColor="#0b8f69"
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                </defs>

                {chartData.areaPath && (
                  <path
                    d={chartData.areaPath}
                    fill="url(#salesGradient)"
                  />
                )}

                {chartData.linePath && (
                  <path
                    d={chartData.linePath}
                    fill="none"
                    stroke="#0b8f69"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {chartData.points.map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPoint?.label === pt.label ? 6 : 4}
                      fill="#ffffff"
                      stroke="#0b8f69"
                      strokeWidth={hoveredPoint?.label === pt.label ? 3 : 2}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                ))}
              </svg>

              {hoveredPoint && (
                <div
                  className="chart-tooltip"
                  style={{
                    left: `${(hoveredPoint.x / 700) * 100}%`,
                    top: `${(hoveredPoint.y / 260) * 100}%`,
                  }}
                >
                  <strong>{formatCurrency(hoveredPoint.revenue)}</strong>
                  <span>{hoveredPoint.tooltipLabel || hoveredPoint.label}</span>
                </div>
              )}

              <div className="chart-days">
                {chartData.points.map((pt, idx) => (
                  <span
                    key={idx}
                    className={
                      hoveredPoint?.label === pt.label ? "active-day" : ""
                    }
                  >
                    {pt.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* SPLIT INVENTORY WATCHLIST */}
        <article className="dashboard-card inventory-split-card">
          {/* TOP HALF: LOW STOCK */}
          <div className="inventory-section top-half">
            <div className="card-header mini-header">
              <div className="card-header-info">
                <h3>Low Stock</h3>
                <p>Needs replenishment</p>
              </div>

              {hasPermission(user, "inventory.view") && (
                <button
                  type="button"
                  className="view-all-button"
                  onClick={() => navigate("/inventory")}
                >
                  View all
                </button>
              )}
            </div>

            <div className="stock-list">
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 3).map((item) => (
                  <div className="stock-item" key={item._id}>
                    <div className="stock-item-icon warning">
                      <AlertTriangle size={15} />
                    </div>

                    <div className="stock-item-info">
                      <strong>{item.name}</strong>
                      <span>Barcode: {item.barcode || "N/A"}</span>
                    </div>

                    <div className="stock-amount warning">
                      <strong>{item.quantity}</strong>
                      <span> / {item.reorderLevel}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="stock-item-empty">
                  <span>Stock levels healthy</span>
                </div>
              )}
            </div>
          </div>

          <div className="inventory-section-divider" />

          {/* BOTTOM HALF: EX STOCKS */}
          <div className="inventory-section bottom-half">
            <div className="card-header mini-header">
              <div className="card-header-info">
                <h3 className="text-danger">Ex Stocks</h3>
                <p>Expired & expiring within 30 days</p>
              </div>

              {hasPermission(user, "inventory.view") && (
                <button
                  type="button"
                  className="view-all-button text-danger"
                  onClick={() => navigate("/inventory")}
                >
                  View all
                </button>
              )}
            </div>

            <div className="stock-list">
              {expiredStockItems.length > 0 ? (
                expiredStockItems.slice(0, 3).map((item) => {
                  const isAlreadyExpired =
                    item.isExpired !== undefined
                      ? item.isExpired
                      : new Date(item.expiryDate) <= new Date();

                  return (
                    <div className="stock-item" key={item._id}>
                      <div
                        className={`stock-item-icon ${
                          isAlreadyExpired ? "danger" : "warning"
                        }`}
                      >
                        <CalendarX size={15} />
                      </div>

                      <div className="stock-item-info">
                        <strong>{item.name}</strong>
                        <span
                          className={
                            isAlreadyExpired
                              ? "text-danger-meta"
                              : "text-warning-meta"
                          }
                        >
                          {isAlreadyExpired
                            ? `Expired (${formatDateShort(item.expiryDate)})`
                            : `Exp in ${item.daysLeft}d (${formatDateShort(
                                item.expiryDate
                              )})`}
                        </span>
                      </div>

                      <div
                        className={`stock-amount ${
                          isAlreadyExpired ? "danger" : "warning"
                        }`}
                      >
                        <strong>{item.quantity}</strong>
                        <span> units</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="stock-item-empty">
                  <span>No expiring or expired products</span>
                </div>
              )}
            </div>
          </div>
        </article>
      </section>

      {/* =================================================
          BOTTOM DASHBOARD GRID
      ================================================= */}
      <section className="dashboard-bottom-grid">
        {/* RECENT SALES TABLE */}
        <article className="dashboard-card recent-sales-card">
          <div className="card-header">
            <div className="card-header-info">
              <h3>
                {normalizedRole === "cashier"
                  ? "My Recent Sales"
                  : "Recent Sales"}
              </h3>
              <p>Latest transactions processed</p>
            </div>

            {hasPermission(user, "sales.create") && (
              <button
                type="button"
                className="view-all-button"
                onClick={() => navigate("/sales")}
              >
                View all
              </button>
            )}
          </div>

          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {recentSales.length > 0 ? (
                  recentSales.slice(0, 5).map((sale) => (
                    <tr key={sale._id}>
                      <td>
                        <strong>
                          {sale.saleNumber || `#${sale._id.slice(-6)}`}
                        </strong>
                      </td>
                      <td>{getCustomerName(sale.customer)}</td>
                      <td>
                        <strong>{formatCurrency(sale.total || 0)}</strong>
                      </td>
                      <td>
                        <span
                          className={
                            sale.status === "COMPLETED"
                              ? "status-badge paid"
                              : "status-badge pending"
                          }
                        >
                          {sale.status === "COMPLETED" ? "Paid" : sale.status}
                        </span>
                      </td>
                      <td>
                        <span className="sale-time">
                          <Clock3 size={12} />
                          {formatTime(sale.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="table-empty-cell">
                      No recent sales recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        {/* ROLE-AWARE QUICK ACTIONS */}
        <article className="dashboard-card quick-actions-card">
          <div className="card-header">
            <div className="card-header-info">
              <h3>Quick Actions</h3>
              <p>Frequently used operations</p>
            </div>
          </div>

          <div className="quick-actions">
            {hasPermission(user, "sales.create") && (
              <button
                type="button"
                className="quick-action"
                onClick={() => navigate("/sales")}
              >
                <div className="quick-action-icon green">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <strong>New Sale</strong>
                  <span>POS Terminal</span>
                </div>
              </button>
            )}

            {hasPermission(user, "inventory.manage") && (
              <button
                type="button"
                className="quick-action"
                onClick={() => navigate("/purchases")}
              >
                <div className="quick-action-icon blue">
                  <Truck size={18} />
                </div>
                <div>
                  <strong>New Purchase</strong>
                  <span>Receive Stock</span>
                </div>
              </button>
            )}

            {hasPermission(user, "products.view") && (
              <button
                type="button"
                className="quick-action"
                onClick={() => navigate("/products")}
              >
                <div className="quick-action-icon purple">
                  <Package size={18} />
                </div>
                <div>
                  <strong>Products</strong>
                  <span>Search Catalog</span>
                </div>
              </button>
            )}

            {hasPermission(user, "sales.create") && (
              <button
                type="button"
                className="quick-action"
                onClick={() => navigate("/customers")}
              >
                <div className="quick-action-icon orange">
                  <Users size={18} />
                </div>
                <div>
                  <strong>Customers</strong>
                  <span>Manage Profiles</span>
                </div>
              </button>
            )}

            {hasPermission(user, "inventory.view") &&
              !hasPermission(user, "inventory.manage") && (
                <button
                  type="button"
                  className="quick-action"
                  onClick={() => navigate("/inventory")}
                >
                  <div className="quick-action-icon blue">
                    <Warehouse size={18} />
                  </div>
                  <div>
                    <strong>Inventory</strong>
                    <span>Check Balance</span>
                  </div>
                </button>
              )}

            {hasPermission(user, "reports.view") && (
              <button
                type="button"
                className="quick-action"
                onClick={() => navigate("/reports")}
              >
                <div className="quick-action-icon purple">
                  <FileBarChart size={18} />
                </div>
                <div>
                  <strong>Reports</strong>
                  <span>Financial Summary</span>
                </div>
              </button>
            )}
          </div>
        </article>
      </section>

      {dashboardError && (
        <p className="dashboard-data-note">{dashboardError}</p>
      )}
    </div>
  );
};

export default DashboardPage;