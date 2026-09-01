import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiBarChart2,
  FiBox,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiFileText,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiShoppingCart,
  FiTrendingDown,
  FiTrendingUp,
  FiXCircle,
  FiAlertTriangle,
  FiArrowDown,
  FiArrowUp,
} from "react-icons/fi";

import "./ReportsPage.css";

/* =========================================================
   API
========================================================= */

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const REPORTS_API = `${API_BASE}/reports`;

/* =========================================================
   HELPERS
========================================================= */

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
};

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatExpiryText = (expiryDate, daysLeft, isExpiredProp) => {
  if (!expiryDate) return "—";

  const now = new Date();
  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) return "—";

  const diffDays =
    daysLeft !== undefined
      ? daysLeft
      : Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const isExpired =
    isExpiredProp !== undefined ? isExpiredProp : diffDays <= 0;

  const dateStr = formatDate(expiryDate);

  if (isExpired) {
    return `Expired (${dateStr})`;
  }

  return `Expired in ${diffDays}d (${dateStr})`;
};

const getInitials = (name = "") => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "—";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getSaleCustomerName = (customer) => {
  if (!customer) {
    return "Walk-in Customer";
  }

  const name = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Walk-in Customer";
};

const getCreatedByName = (user) => {
  if (!user) {
    return "—";
  }

  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
};

/* =========================================================
   REPORT TABS
========================================================= */

const REPORT_TYPES = [
  {
    id: "sales",
    label: "Sales",
    icon: FiShoppingCart,
    description: "Revenue, sales volume and completed transactions.",
  },
  {
    id: "purchases",
    label: "Purchases",
    icon: FiShoppingBag,
    description: "Supplier purchases and purchasing expenditure.",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: FiPackage,
    description: "Stock value, low stock and expired products.",
  },
  {
    id: "movements",
    label: "Stock Movements",
    icon: FiBarChart2,
    description: "Inventory stock-in and stock-out activity.",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState("sales");
  const [salesReport, setSalesReport] = useState(null);
  const [purchaseReport, setPurchaseReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [movementReport, setMovementReport] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  /* =====================================================
     REQUEST
  ===================================================== */
  const requestReport = useCallback(async (endpoint) => {
    const token = getToken();

    const response = await fetch(`${REPORTS_API}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to load report");
    }

    return result.data;
  }, []);

  /* =====================================================
     LOAD REPORT
  ===================================================== */
  const loadReport = useCallback(
    async (reportType = activeReport) => {
      setLoading(true);
      setError("");

      try {
        let data;

        if (reportType === "sales") {
          const params = new URLSearchParams();
          if (startDate) params.set("startDate", startDate);
          if (endDate) params.set("endDate", endDate);

          const query = params.toString() ? `?${params.toString()}` : "";
          data = await requestReport(`/sales${query}`);
          setSalesReport(data);
        }

        if (reportType === "purchases") {
          const params = new URLSearchParams();
          if (startDate) params.set("startDate", startDate);
          if (endDate) params.set("endDate", endDate);

          const query = params.toString() ? `?${params.toString()}` : "";
          data = await requestReport(`/purchases${query}`);
          setPurchaseReport(data);
        }

        if (reportType === "inventory") {
          data = await requestReport("/inventory");
          setInventoryReport(data);
        }

        if (reportType === "movements") {
          const params = new URLSearchParams();
          if (startDate) params.set("startDate", startDate);
          if (endDate) params.set("endDate", endDate);

          const query = params.toString() ? `?${params.toString()}` : "";
          data = await requestReport(`/inventory-movements${query}`);
          setMovementReport(data);
        }

        setLastUpdated(new Date());
      } catch (err) {
        setError(
          err.message || "Something went wrong while loading the report."
        );
      } finally {
        setLoading(false);
      }
    },
    [activeReport, endDate, requestReport, startDate]
  );

  /* =====================================================
     INITIAL LOAD / REPORT SWITCH
  ===================================================== */
  useEffect(() => {
    loadReport(activeReport);
  }, [activeReport]);

  /* =====================================================
     ACTIVE DATA
  ===================================================== */
  const activeData = useMemo(() => {
    if (activeReport === "sales") return salesReport;
    if (activeReport === "purchases") return purchaseReport;
    if (activeReport === "inventory") return inventoryReport;
    return movementReport;
  }, [
    activeReport,
    salesReport,
    purchaseReport,
    inventoryReport,
    movementReport,
  ]);

  /* =====================================================
     TAB SWITCH
  ===================================================== */
  const handleReportChange = (type) => {
    if (type === activeReport) return;
    setError("");
    setActiveReport(type);
  };

  /* =====================================================
     DATE APPLY
  ===================================================== */
  const handleApplyDateRange = () => {
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be later than end date.");
      return;
    }

    loadReport(activeReport);
  };

  /* =====================================================
     CLEAR DATES
  ===================================================== */
  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");

    setTimeout(() => {
      loadReport(activeReport);
    }, 0);
  };

  /* =====================================================
     REFRESH
  ===================================================== */
  const handleRefresh = () => {
    loadReport(activeReport);
  };

  /* =====================================================
     EXPORT CSV
  ===================================================== */
  const exportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = "report.csv";

    if (activeReport === "sales") {
      headers = [
        "Sale Number",
        "Customer",
        "Items",
        "Total",
        "Created By",
        "Date",
      ];

      rows =
        salesReport?.sales?.map((sale) => [
          sale.saleNumber || "—",
          getSaleCustomerName(sale.customer),
          sale.items?.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
          ) || 0,
          Number(sale.total || 0).toFixed(2),
          getCreatedByName(sale.createdBy),
          formatDate(sale.createdAt),
        ]) || [];

      filename = "sales-report.csv";
    }

    if (activeReport === "purchases") {
      headers = [
        "Purchase Number",
        "Supplier",
        "Items",
        "Total",
        "Status",
        "Date",
      ];

      rows =
        purchaseReport?.purchases?.map((purchase) => [
          purchase.purchaseNumber || "—",
          purchase.supplier?.companyName || "—",
          purchase.items?.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
          ) || 0,
          Number(purchase.total || 0).toFixed(2),
          purchase.status || "—",
          formatDate(purchase.createdAt),
        ]) || [];

      filename = "purchase-report.csv";
    }

    if (activeReport === "inventory") {
      headers = [
        "Product",
        "Barcode",
        "Category",
        "Quantity",
        "Purchase Price",
        "Inventory Value",
        "Reorder Level",
        "Expiry Date",
      ];

      rows =
        inventoryReport?.products?.map((product) => [
          product.name || "—",
          product.barcode || "—",
          product.category?.name || "—",
          product.quantity || 0,
          Number(product.purchasePrice || 0).toFixed(2),
          (
            Number(product.quantity || 0) * Number(product.purchasePrice || 0)
          ).toFixed(2),
          product.reorderLevel || 0,
          formatDate(product.expiryDate),
        ]) || [];

      filename = "inventory-report.csv";
    }

    if (activeReport === "movements") {
      headers = [
        "Product",
        "Barcode",
        "Type",
        "Quantity",
        "Reference",
        "Remarks",
        "Created By",
        "Date",
      ];

      rows =
        movementReport?.movements?.map((movement) => [
          movement.product?.name || "—",
          movement.product?.barcode || "—",
          movement.type || "—",
          movement.quantity || 0,
          movement.reference || "—",
          movement.remarks || "—",
          getCreatedByName(movement.createdBy),
          formatDateTime(movement.createdAt),
        ]) || [];

      filename = "inventory-movements-report.csv";
    }

    if (!headers.length) return;

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeMeta = REPORT_TYPES.find(
    (report) => report.id === activeReport
  );

  return (
    <div className="reports-page">
      {/* =================================================
          HEADER
      ================================================= */}
      <div className="reports-header">
        <div className="reports-heading">
          <div className="reports-eyebrow">
            <FiBarChart2 size={14} />
            REPORTING CENTER
          </div>

          <h1>Reports</h1>
          <p>
            Analyze sales, purchases, inventory and stock movement across
            your pharmacy.
          </p>
        </div>

        <div className="reports-header-actions">
          <button
            type="button"
            className="report-secondary-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw
              className={loading ? "report-spinning" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            className="report-primary-button"
            onClick={exportCSV}
            disabled={loading || !activeData}
          >
            <FiDownload />
            Export CSV
          </button>
        </div>
      </div>

      {/* =================================================
          REPORT NAVIGATION
      ================================================= */}
      <div className="reports-navigation">
        <div className="reports-navigation-inner">
          {REPORT_TYPES.map((report) => {
            const Icon = report.icon;
            const active = activeReport === report.id;

            return (
              <button
                key={report.id}
                type="button"
                className={`report-tab ${active ? "active" : ""}`}
                onClick={() => handleReportChange(report.id)}
              >
                <span className="report-tab-icon">
                  <Icon size={16} />
                </span>

                <span className="report-tab-text">
                  <strong>{report.label}</strong>
                  <small>{report.description}</small>
                </span>

                {active && (
                  <FiChevronRight
                    className="report-tab-arrow"
                    size={15}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================
          DATE FILTER
      ================================================= */}
      {(activeReport === "sales" ||
        activeReport === "purchases" ||
        activeReport === "movements") && (
        <div className="reports-filter-bar">
          <div className="reports-filter-title">
            <span className="reports-filter-icon">
              <FiCalendar size={16} />
            </span>

            <div>
              <strong>Reporting Period</strong>
              <small>Choose the date range for this report.</small>
            </div>
          </div>

          <div className="reports-date-fields">
            <label className="report-date-field">
              <span>From</span>
              <div className="report-date-input">
                <FiCalendar size={14} />
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                />
              </div>
            </label>

            <span className="report-date-separator">—</span>

            <label className="report-date-field">
              <span>To</span>
              <div className="report-date-input">
                <FiCalendar size={14} />
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                />
              </div>
            </label>

            <button
              type="button"
              className="report-apply-button"
              onClick={handleApplyDateRange}
              disabled={loading}
            >
              Apply
            </button>

            {(startDate || endDate) && (
              <button
                type="button"
                className="report-clear-button"
                onClick={handleClearDates}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}
      {error && (
        <div className="report-error">
          <FiAlertTriangle size={17} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {/* =================================================
          REPORT CONTENT
      ================================================= */}
      <section className="reports-content">
        <div className="reports-content-header">
          <div>
            <h2>{activeMeta?.label} Report</h2>
            <p>{activeMeta?.description}</p>
          </div>

          <div className="report-updated">
            <FiClock size={14} />
            {lastUpdated
              ? `Updated ${formatDateTime(lastUpdated)}`
              : "Waiting for data"}
          </div>
        </div>

        {loading ? (
          <div className="report-loading">
            <div className="report-loader">
              <FiRefreshCw size={22} className="report-spinning" />
            </div>
            <strong>Loading report</strong>
            <span>Fetching the latest information...</span>
          </div>
        ) : (
          <>
            {activeReport === "sales" && (
              <SalesReport report={salesReport} />
            )}

            {activeReport === "purchases" && (
              <PurchaseReport report={purchaseReport} />
            )}

            {activeReport === "inventory" && (
              <InventoryReport report={inventoryReport} />
            )}

            {activeReport === "movements" && (
              <MovementReport report={movementReport} />
            )}
          </>
        )}
      </section>
    </div>
  );
};

/* =========================================================
   SALES REPORT
========================================================= */

const SalesReport = ({ report }) => {
  const summary = report?.summary || {};
  const sales = report?.sales || [];

  const averageSale = summary.salesCount
    ? Number(summary.totalRevenue || 0) / Number(summary.salesCount)
    : 0;

  return (
    <>
      <div className="report-stat-grid">
        <ReportStat
          icon={FiShoppingCart}
          tone="green"
          label="Completed Sales"
          value={formatNumber(summary.salesCount)}
        />

        <ReportStat
          icon={FiPackage}
          tone="blue"
          label="Items Sold"
          value={formatNumber(summary.totalItems)}
        />

        <ReportStat
          icon={FiDollarSign}
          tone="purple"
          label="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          prefix="ETB "
        />

        <ReportStat
          icon={FiTrendingUp}
          tone="orange"
          label="Average Sale"
          value={formatCurrency(averageSale)}
          prefix="ETB "
        />
      </div>

      <div className="report-table-card">
        <ReportTableHeader
          title="Completed Sales"
          count={sales.length}
        />

        {sales.length === 0 ? (
          <ReportEmpty
            icon={FiShoppingCart}
            title="No sales found"
            text="There are no completed sales for the selected period."
          />
        ) : (
          <div className="report-table-scroll">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>SALE</th>
                  <th>CUSTOMER</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>CREATED BY</th>
                  <th>DATE</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => {
                  const customer = getSaleCustomerName(sale.customer);
                  const itemCount =
                    sale.items?.reduce(
                      (total, item) =>
                        total + Number(item.quantity || 0),
                      0
                    ) || 0;

                  return (
                    <tr key={sale._id}>
                      <td>
                        <div className="report-primary-cell">
                          <span className="report-row-icon green">
                            <FiShoppingCart size={14} />
                          </span>
                          <div>
                            <strong>{sale.saleNumber || "—"}</strong>
                            <small>Completed</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="report-person-cell">
                          <span className="report-avatar">
                            {getInitials(customer)}
                          </span>
                          <span>{customer}</span>
                        </div>
                      </td>

                      <td>
                        <span className="report-number">
                          {formatNumber(itemCount)}
                        </span>
                      </td>

                      <td>
                        <strong className="report-money">
                          ETB {formatCurrency(sale.total)}
                        </strong>
                      </td>

                      <td>
                        <span className="report-muted">
                          {getCreatedByName(sale.createdBy)}
                        </span>
                      </td>

                      <td>
                        <span className="report-date">
                          <FiCalendar size={13} />
                          {formatDate(sale.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

/* =========================================================
   PURCHASE REPORT
========================================================= */

const PurchaseReport = ({ report }) => {
  const summary = report?.summary || {};
  const purchases = report?.purchases || [];

  return (
    <>
      <div className="report-stat-grid">
        <ReportStat
          icon={FiShoppingBag}
          tone="green"
          label="Purchases"
          value={formatNumber(summary.purchaseCount)}
        />

        <ReportStat
          icon={FiDollarSign}
          tone="purple"
          label="Purchase Amount"
          value={formatCurrency(summary.totalPurchaseAmount)}
          prefix="ETB "
        />

        <ReportStat
          icon={FiCheckCircle}
          tone="blue"
          label="Received"
          value={formatNumber(
            purchases.filter(
              (purchase) => purchase.status === "RECEIVED"
            ).length
          )}
        />

        <ReportStat
          icon={FiClock}
          tone="orange"
          label="Draft"
          value={formatNumber(
            purchases.filter(
              (purchase) => purchase.status === "DRAFT"
            ).length
          )}
        />
      </div>

      <div className="report-table-card">
        <ReportTableHeader
          title="Purchase History"
          count={purchases.length}
        />

        {purchases.length === 0 ? (
          <ReportEmpty
            icon={FiShoppingBag}
            title="No purchases found"
            text="There are no purchases for the selected period."
          />
        ) : (
          <div className="report-table-scroll">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>PURCHASE</th>
                  <th>SUPPLIER</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                </tr>
              </thead>

              <tbody>
                {purchases.map((purchase) => {
                  const itemCount =
                    purchase.items?.reduce(
                      (total, item) =>
                        total + Number(item.quantity || 0),
                      0
                    ) || 0;

                  return (
                    <tr key={purchase._id}>
                      <td>
                        <div className="report-primary-cell">
                          <span className="report-row-icon blue">
                            <FiShoppingBag size={14} />
                          </span>
                          <div>
                            <strong>
                              {purchase.purchaseNumber || "—"}
                            </strong>
                            <small>Purchase</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="report-person-cell">
                          <span className="report-avatar">
                            {getInitials(
                              purchase.supplier?.companyName ||
                                "Supplier"
                            )}
                          </span>
                          <span>
                            {purchase.supplier?.companyName || "—"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="report-number">
                          {formatNumber(itemCount)}
                        </span>
                      </td>

                      <td>
                        <strong className="report-money">
                          ETB {formatCurrency(purchase.total)}
                        </strong>
                      </td>

                      <td>
                        <PurchaseStatus status={purchase.status} />
                      </td>

                      <td>
                        <span className="report-date">
                          <FiCalendar size={13} />
                          {formatDate(purchase.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

/* =========================================================
   INVENTORY REPORT
========================================================= */

const InventoryReport = ({ report }) => {
  const summary = report?.summary || {};
  const products = report?.products || [];
  const lowStock = report?.lowStockProducts || [];
  const expired = report?.expiredProducts || [];

  return (
    <>
      <div className="report-stat-grid">
        <ReportStat
          icon={FiPackage}
          tone="green"
          label="Active Products"
          value={formatNumber(summary.productCount)}
        />

        <ReportStat
          icon={FiBox}
          tone="blue"
          label="Total Quantity"
          value={formatNumber(summary.totalQuantity)}
        />

        <ReportStat
          icon={FiDollarSign}
          tone="purple"
          label="Inventory Value"
          value={formatCurrency(summary.inventoryValue)}
          prefix="ETB "
        />

        <ReportStat
          icon={FiAlertTriangle}
          tone="orange"
          label="Attention Needed"
          value={formatNumber(
            Number(summary.lowStockCount || 0) +
              Number(summary.expiredCount || 0)
          )}
        />
      </div>

      <div className="inventory-alert-grid">
        <InventoryAlertCard
          type="low"
          title="Low Stock Products"
          count={summary.lowStockCount}
          products={lowStock}
        />

        <InventoryAlertCard
          type="expired"
          title="Expired Products"
          count={summary.expiredCount}
          products={expired}
        />
      </div>

      <div className="report-table-card">
        <ReportTableHeader
          title="Current Inventory"
          count={products.length}
        />

        {products.length === 0 ? (
          <ReportEmpty
            icon={FiPackage}
            title="No inventory found"
            text="There are no active products in the inventory report."
          />
        ) : (
          <div className="report-table-scroll">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>STOCK</th>
                  <th>PURCHASE PRICE</th>
                  <th>INVENTORY VALUE</th>
                  <th>EXPIRY</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const value =
                    Number(product.quantity || 0) *
                    Number(product.purchasePrice || 0);

                  const isLow =
                    Number(product.quantity || 0) <=
                    Number(product.reorderLevel || 0);

                  return (
                    <tr key={product._id}>
                      <td>
                        <div className="report-primary-cell">
                          <span className="report-row-icon green">
                            <FiPackage size={14} />
                          </span>
                          <div>
                            <strong>{product.name || "—"}</strong>
                            <small>
                              {product.barcode || "No barcode"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="report-muted">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`stock-number ${
                            isLow ? "low" : ""
                          }`}
                        >
                          {formatNumber(product.quantity)}
                          <small>
                            / reorder {formatNumber(product.reorderLevel)}
                          </small>
                        </span>
                      </td>

                      <td>
                        <span className="report-muted">
                          ETB {formatCurrency(product.purchasePrice)}
                        </span>
                      </td>

                      <td>
                        <strong className="report-money">
                          ETB {formatCurrency(value)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`inventory-expiry ${
                            product.expiryDate ? "" : "none"
                          }`}
                        >
                          <FiCalendar size={13} />
                          {formatExpiryText(
                            product.expiryDate,
                            product.daysLeft,
                            product.isExpired
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

/* =========================================================
   MOVEMENT REPORT
========================================================= */

const MovementReport = ({ report }) => {
  const summary = report?.summary || {};
  const movements = report?.movements || [];

  return (
    <>
      <div className="report-stat-grid">
        <ReportStat
          icon={FiBarChart2}
          tone="green"
          label="Movements"
          value={formatNumber(summary.movementCount)}
        />

        <ReportStat
          icon={FiArrowDown}
          tone="blue"
          label="Stock In"
          value={formatNumber(summary.totalIn)}
        />

        <ReportStat
          icon={FiArrowUp}
          tone="orange"
          label="Stock Out"
          value={formatNumber(summary.totalOut)}
        />

        <ReportStat
          icon={FiPackage}
          tone="purple"
          label="Net Movement"
          value={formatNumber(
            Number(summary.totalIn || 0) - Number(summary.totalOut || 0)
          )}
        />
      </div>

      <div className="movement-summary-bar">
        <div className="movement-summary-item">
          <span className="movement-summary-icon in">
            <FiArrowDown />
          </span>
          <div>
            <small>Total Stock In</small>
            <strong>{formatNumber(summary.totalIn)}</strong>
          </div>
        </div>

        <div className="movement-summary-divider" />

        <div className="movement-summary-item">
          <span className="movement-summary-icon out">
            <FiArrowUp />
          </span>
          <div>
            <small>Total Stock Out</small>
            <strong>{formatNumber(summary.totalOut)}</strong>
          </div>
        </div>

        <div className="movement-summary-divider" />

        <div className="movement-summary-item">
          <span className="movement-summary-icon balance">
            <FiTrendingUp />
          </span>
          <div>
            <small>Net Movement</small>
            <strong>
              {formatNumber(
                Number(summary.totalIn || 0) - Number(summary.totalOut || 0)
              )}
            </strong>
          </div>
        </div>
      </div>

      <div className="report-table-card">
        <ReportTableHeader
          title="Inventory Movement History"
          count={movements.length}
        />

        {movements.length === 0 ? (
          <ReportEmpty
            icon={FiBarChart2}
            title="No movements found"
            text="There are no inventory movements for the selected period."
          />
        ) : (
          <div className="report-table-scroll">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>TYPE</th>
                  <th>QUANTITY</th>
                  <th>REFERENCE</th>
                  <th>REMARKS</th>
                  <th>CREATED BY</th>
                  <th>DATE</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => {
                  const isIn = movement.type === "IN";

                  return (
                    <tr key={movement._id}>
                      <td>
                        <div className="report-primary-cell">
                          <span
                            className={`report-row-icon ${
                              isIn ? "green" : "orange"
                            }`}
                          >
                            <FiPackage size={14} />
                          </span>
                          <div>
                            <strong>
                              {movement.product?.name || "Unknown Product"}
                            </strong>
                            <small>
                              {movement.product?.barcode || "No barcode"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`movement-badge ${
                            isIn ? "in" : "out"
                          }`}
                        >
                          {isIn ? <FiArrowDown /> : <FiArrowUp />}
                          {isIn ? "Stock In" : "Stock Out"}
                        </span>
                      </td>

                      <td>
                        <strong
                          className={`movement-quantity ${
                            isIn ? "in" : "out"
                          }`}
                        >
                          {isIn ? "+" : "-"}
                          {formatNumber(movement.quantity)}
                        </strong>
                      </td>

                      <td>
                        <span className="report-reference">
                          {movement.reference || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="report-muted">
                          {movement.remarks || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="report-muted">
                          {getCreatedByName(movement.createdBy)}
                        </span>
                      </td>

                      <td>
                        <span className="report-date">
                          <FiCalendar size={13} />
                          {formatDateTime(movement.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const ReportStat = ({ icon: Icon, tone, label, value, prefix = "" }) => {
  return (
    <div className="report-stat-card">
      <div className={`report-stat-icon ${tone}`}>
        <Icon size={18} />
      </div>

      <div className="report-stat-content">
        <span>{label}</span>
        <strong>
          {prefix}
          {value}
        </strong>
      </div>
    </div>
  );
};

/* =========================================================
   TABLE HEADER
========================================================= */

const ReportTableHeader = ({ title, count }) => {
  return (
    <div className="report-table-header">
      <div>
        <h3>{title}</h3>
        <p>Latest records returned by the reporting service.</p>
      </div>

      <div className="report-record-count">
        <FiFileText size={14} />
        {formatNumber(count)}
      </div>
    </div>
  );
};

/* =========================================================
   PURCHASE STATUS
========================================================= */

const PurchaseStatus = ({ status }) => {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "RECEIVED") {
    return (
      <span className="purchase-status received">
        <span />
        Received
      </span>
    );
  }

  if (normalized === "CANCELLED") {
    return (
      <span className="purchase-status cancelled">
        <span />
        Cancelled
      </span>
    );
  }

  return (
    <span className="purchase-status draft">
      <span />
      Draft
    </span>
  );
};

/* =========================================================
   INVENTORY ALERT
========================================================= */

const InventoryAlertCard = ({ type, title, count, products }) => {
  const isLow = type === "low";

  return (
    <div className={`inventory-alert-card ${isLow ? "low" : "expired"}`}>
      <div className="inventory-alert-header">
        <div>
          <span className="inventory-alert-icon">
            {isLow ? <FiTrendingDown /> : <FiXCircle />}
          </span>
        </div>

        <div className="inventory-alert-heading">
          <strong>{title}</strong>
          <span>
            {formatNumber(count)} product{Number(count) === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="inventory-alert-empty">
          <FiCheckCircle />
          <span>No products require attention.</span>
        </div>
      ) : (
        <div className="inventory-alert-list">
          {products.slice(0, 5).map((product) => (
            <div className="inventory-alert-row" key={product._id}>
              <span className="inventory-alert-product">
                {getInitials(product.name)}
              </span>

              <div>
                <strong>{product.name}</strong>
                <small>
                  {isLow
                    ? `Stock ${formatNumber(
                        product.quantity
                      )} / reorder ${formatNumber(product.reorderLevel)}`
                    : formatExpiryText(
                        product.expiryDate,
                        product.daysLeft,
                        product.isExpired
                      )}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}

      {products.length > 5 && (
        <div className="inventory-alert-more">
          + {formatNumber(products.length - 5)} more products
        </div>
      )}
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const ReportEmpty = ({ icon: Icon, title, text }) => {
  return (
    <div className="report-empty">
      <div className="report-empty-icon">
        <Icon size={22} />
      </div>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
};

export default ReportsPage;