const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const productRoutes = require("./modules/products/product.routes");
const categoryRoutes = require("./modules/categories/category.routes");
const supplierRoutes = require("./modules/suppliers/supplier.routes");
const manufacturerRoutes = require("./modules/manufacturers/manufacturer.routes");
const brandRoutes = require("./modules/brands/brand.routes");
const unitRoutes = require("./modules/units/unit.routes");
const inventoryRoutes = require("./modules/inventory/inventory.routes");
const purchaseRoutes = require("./modules/purchases/purchase.routes");
const saleRoutes = require("./modules/sales/sale.routes");
const customerRoutes = require("./modules/customers/customer.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const reportRoutes = require("./modules/reports/report.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");
const { startNotificationJobs } = require("./modules/notifications/notification.job");

const app = express();

// Enable CORS for all origins, headers, and methods to prevent 405 on OPTIONS preflight
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Explicit preflight handling
app.options("*", cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check / Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PharmaFlow ERP API is running",
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/manufacturers", manufacturerRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

// Start background notification jobs safely
try {
  if (typeof startNotificationJobs === "function") {
    startNotificationJobs();
  }
} catch (err) {
  console.log("Notification jobs skipped in setup:", err.message);
}

module.exports = app;