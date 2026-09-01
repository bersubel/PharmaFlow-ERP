import {
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import MainLayout from "../components/layout/MainLayout";

import DashboardPage from "../modules/dashboard/pages/DashboardPage";
import LoginPage from "../modules/auth/pages/LoginPage";
import ProductsPage from "../modules/products/pages/ProductsPage";
import InventoryPage from "../modules/inventory/pages/InventoryPage";
import SalesPage from "../modules/sales/pages/SalesPage";
import PurchasesPage from "../modules/Purchases/pages/PurchasesPage";
import CustomersPage from "../modules/customers/pages/CustomersPage";
import SuppliersPage from "../modules/suppliers/pages/SuppliersPage";
import ReportsPage from "../modules/reports/pages/ReportsPage";
import UsersPage from "../modules/users/pages/UsersPage";

const PlaceholderPage = ({ title }) => {
    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>{title}</h1>
                    <p>This module is ready for implementation.</p>
                </div>
            </div>
            <div
                className="card"
                style={{
                    padding: "40px",
                    textAlign: "center",
                }}
            >
                <p
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "13px",
                    }}
                >
                    {title} module
                </p>
            </div>
        </div>
    );
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* =========================================
                PUBLIC ROUTES
            ========================================= */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* =========================================
                AUTHENTICATED & PROTECTED ROUTES
            ========================================= */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    {/* Dashboard (All authenticated staff) */}
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* Products (Admin, Manager, Pharmacist, Cashier, Inventory Staff) */}
                    <Route
                        element={<ProtectedRoute requiredPermission="products.view" />}
                    >
                        <Route path="/products" element={<ProductsPage />} />
                    </Route>

                    {/* Inventory (Admin, Manager, Pharmacist, Inventory Staff) */}
                    <Route
                        element={<ProtectedRoute requiredPermission="inventory.view" />}
                    >
                        <Route path="/inventory" element={<InventoryPage />} />
                    </Route>

                    {/* Sales / POS (Admin, Manager, Pharmacist, Cashier) */}
                    <Route
                        element={<ProtectedRoute requiredPermission="sales.create" />}
                    >
                        <Route path="/sales" element={<SalesPage />} />
                    </Route>

                    {/* Purchases (Admin, Manager, Inventory Staff) */}
                    <Route
                        element={<ProtectedRoute requiredPermission="inventory.manage" />}
                    >
                        <Route path="/purchases" element={<PurchasesPage />} />
                    </Route>

                    {/* Customers (Admin, Manager, Pharmacist, Cashier) */}
                    <Route
                        element={<ProtectedRoute requiredPermission="sales.create" />}
                    >
                        <Route path="/customers" element={<CustomersPage />} />
                    </Route>

                    {/* Suppliers (Admin, Manager, Inventory Staff) */}
                    <Route
                        element={<ProtectedRoute requiredPermission="inventory.manage" />}
                    >
                        <Route path="/suppliers" element={<SuppliersPage />} />
                    </Route>

                    {/* Reports (Admin & Manager) */}
                    <Route
                        element={<ProtectedRoute requiredPermission="reports.view" />}
                    >
                        <Route path="/reports" element={<ReportsPage />} />
                    </Route>

                    {/* User Management (Admin Only) */}
                    <Route
                        element={<ProtectedRoute requiredPermission="users.manage" />}
                    >
                        <Route path="/users" element={<UsersPage />} />
                    </Route>

                    {/* Notifications & Settings Placeholders */}
                    <Route
                        path="/notifications"
                        element={<PlaceholderPage title="Notifications" />}
                    />
                    <Route
                        path="/settings"
                        element={<PlaceholderPage title="Settings" />}
                    />
                </Route>
            </Route>

            {/* =========================================
                DEFAULT & CATCH-ALL REDIRECTS
            ========================================= */}
            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />
            <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
            />
        </Routes>
    );
};

export default AppRoutes;