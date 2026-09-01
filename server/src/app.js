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
const {
    startNotificationJobs
} = require("./modules/notifications/notification.job");

const app = express();


// Middlewares

app.use(
    cors()
);


app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended:true
    })
);



// Routes

app.use(
    "/api/auth",
    authRoutes
);
app.use(
    "/api/users",
    userRoutes
);
app.use(
    "/api/products",
    productRoutes
);
app.use(
    "/api/categories",
    categoryRoutes
);
app.use(
    "/api/suppliers",
    supplierRoutes
);
app.use(
    "/api/manufacturers",
    manufacturerRoutes
);
app.use(
    "/api/brands",
    brandRoutes
);
app.use(
    "/api/units",
    unitRoutes
);
app.use(
    "/api/inventory",
    inventoryRoutes
);
app.use(
    "/api/purchases",
    purchaseRoutes
);
app.use(
    "/api/sales",
    saleRoutes
);
app.use(
    "/api/customers",
    customerRoutes
);
app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/reports",
    reportRoutes
);
app.use(
    "/api/notifications",
    notificationRoutes
);

// Test route

app.get("/", (req,res)=>{

    res.json({
        message:"PharmaFlow ERP API is running"
    });

});

startNotificationJobs();

module.exports = app;