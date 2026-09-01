const Product = require("../products/product.model");
const Customer = require("../customers/customer.model");
const Supplier = require("../suppliers/supplier.model");
const User = require("../users/user.model");
const Sale = require("../sales/sale.model");
const Purchase = require("../purchases/purchase.model");

const getDashboardStats = async (currentUser, period = "weekly") => {
  const now = new Date();

  // Today boundaries for top stats
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  // Expiry threshold: 30 days ahead
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  // Extract normalized role name
  const roleName = (
    typeof currentUser?.role === "object"
      ? currentUser?.role?.name
      : currentUser?.role || ""
  ).toLowerCase();

  const isCashier = roleName === "cashier";
  const isInventoryStaff = roleName === "inventory staff";
  const isPharmacist = roleName === "pharmacist";

  // Cashier only sees their own transactions
  const salesMatchFilter = isCashier
    ? { status: "COMPLETED", createdBy: currentUser._id }
    : { status: "COMPLETED" };

  // Determine Chart Range & Grouping Format
  let chartStartDate = new Date(now);
  let groupFormat = "%Y-%m-%d";

  if (period === "daily") {
    chartStartDate.setHours(0, 0, 0, 0);
    groupFormat = "%Y-%m-%d %H:00";
  } else if (period === "monthly") {
    chartStartDate.setDate(chartStartDate.getDate() - 29);
    chartStartDate.setHours(0, 0, 0, 0);
    groupFormat = "%Y-%m-%d";
  } else if (period === "annually") {
    chartStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    chartStartDate.setHours(0, 0, 0, 0);
    groupFormat = "%Y-%m";
  } else {
    // Default: 'weekly' (Trailing 7 days)
    chartStartDate.setDate(chartStartDate.getDate() - 6);
    chartStartDate.setHours(0, 0, 0, 0);
    groupFormat = "%Y-%m-%d";
  }

  const [
    totalProducts,
    totalCustomers,
    totalSuppliers,
    totalUsers,
    totalSales,
    totalPurchases,
    inventoryResult,
    lowStockProducts,
    expiredProductsRaw,
    todaySales,
    todayPurchases,
    recentSales,
    chartSalesRaw,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Customer.countDocuments({ isActive: true }),
    Supplier.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    Sale.countDocuments(salesMatchFilter),
    Purchase.countDocuments(),

    Product.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]),

    Product.find({
      isActive: true,
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
    })
      .select("name quantity reorderLevel barcode")
      .sort({ quantity: 1 }),

    // Expiry query: already expired OR expiring within the next 30 days
    Product.find({
      expiryDate: { $lte: thirtyDaysFromNow },
      quantity: { $gt: 0 },
      isActive: true,
    })
      .select("name quantity expiryDate barcode")
      .sort({ expiryDate: 1 }),

    Sale.find({
      ...salesMatchFilter,
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    }),

    Purchase.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    }),

    Sale.find(salesMatchFilter)
      .populate("customer", "firstName lastName")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(10),

    Sale.aggregate([
      {
        $match: {
          ...salesMatchFilter,
          createdAt: { $gte: chartStartDate, $lte: endOfToday },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: "$createdAt" },
          },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const todayPurchaseAmount = todayPurchases.reduce((sum, p) => sum + p.total, 0);

  // Map expired items with day countdown calculation
  const expiredProducts = expiredProductsRaw.map((prod) => {
    const diffTime = new Date(prod.expiryDate) - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      _id: prod._id,
      name: prod.name,
      quantity: prod.quantity,
      expiryDate: prod.expiryDate,
      barcode: prod.barcode,
      daysLeft: diffDays,
      isExpired: diffDays <= 0,
    };
  });

  // Dynamic Chart Construction
  const salesMap = new Map(chartSalesRaw.map((item) => [item._id, item.revenue]));
  const chartData = [];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (period === "daily") {
    for (let h = 0; h < 24; h += 4) {
      const hourStr = h.toString().padStart(2, "0");
      const label = `${hourStr}:00`;
      
      let bucketRevenue = 0;
      for (let sub = 0; sub < 4; sub++) {
        const subHourStr = (h + sub).toString().padStart(2, "0");
        const dateKey = `${startOfToday.toISOString().split("T")[0]} ${subHourStr}:00`;
        bucketRevenue += salesMap.get(dateKey) || 0;
      }

      chartData.push({
        label,
        revenue: bucketRevenue,
      });
    }
  } else if (period === "monthly") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const label = `${d.getDate()} ${months[d.getMonth()]}`;

      chartData.push({
        date: dateKey,
        label: i % 5 === 0 || i === 0 ? label : "",
        tooltipLabel: `${d.getDate()} ${months[d.getMonth()]}`,
        revenue: salesMap.get(dateKey) || 0,
      });
    }
  } else if (period === "annually") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearStr = d.getFullYear();
      const monthStr = (d.getMonth() + 1).toString().padStart(2, "0");
      const dateKey = `${yearStr}-${monthStr}`;
      const label = months[d.getMonth()];

      chartData.push({
        date: dateKey,
        label,
        tooltipLabel: `${months[d.getMonth()]} ${yearStr}`,
        revenue: salesMap.get(dateKey) || 0,
      });
    }
  } else {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const dayName = daysOfWeek[d.getDay()];

      chartData.push({
        date: dateKey,
        label: dayName,
        tooltipLabel: `${dayName} (${d.getDate()} ${months[d.getMonth()]})`,
        revenue: salesMap.get(dateKey) || 0,
      });
    }
  }

  return {
    roleContext: {
      role: roleName,
      isCashier,
      isInventoryStaff,
      isPharmacist,
    },
    counts: {
      products: totalProducts,
      customers: totalCustomers,
      suppliers: totalSuppliers,
      users: totalUsers,
      sales: totalSales,
      purchases: totalPurchases,
    },
    inventory: {
      totalQuantity: inventoryResult[0] ? inventoryResult[0].totalQuantity : 0,
      lowStockCount: lowStockProducts.length,
      expiredCount: expiredProducts.filter((p) => p.isExpired).length,
      expiringSoonCount: expiredProducts.filter((p) => !p.isExpired).length,
      lowStockProducts,
      expiredProducts,
    },
    today: {
      salesCount: todaySales.length,
      revenue: todayRevenue,
      purchasesCount: todayPurchases.length,
      purchaseAmount: todayPurchaseAmount,
    },
    salesChart: chartData,
    recentSales,
  };
};

module.exports = {
  getDashboardStats,
};