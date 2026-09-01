const Sale = require("../sales/sale.model");
const Purchase = require("../purchases/purchase.model");
const Product = require("../products/product.model");
const Inventory = require("../inventory/inventory.model");

const getDateRange = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();

  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
};

const getSalesReport = async (startDate, endDate) => {
  const { start, end } = getDateRange(startDate, endDate);

  const sales = await Sale.find({
    createdAt: {
      $gte: start,$lte: end,
    },
    status: "COMPLETED",
  })
    .populate("customer", "firstName lastName phone")
    .populate("createdBy", "firstName lastName")
    .populate("items.product", "name barcode")
    .sort({
      createdAt: -1,
    });

  const totalRevenue = sales.reduce(
    (total, sale) => total + sale.total,
    0
  );

  const totalItems = sales.reduce(
    (total, sale) =>
      total +
      sale.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  return {
    summary: {
      salesCount: sales.length,
      totalItems,
      totalRevenue,
    },
    sales,
  };
};

const getPurchaseReport = async (startDate, endDate) => {
  const { start, end } = getDateRange(startDate, endDate);

  const purchases = await Purchase.find({
    createdAt: {
      $gte: start,$lte: end,
    },
  })
    .populate("supplier", "companyName contactPerson phone")
    .populate("createdBy", "firstName lastName")
    .sort({
      createdAt: -1,
    });

  const totalPurchaseAmount = purchases.reduce(
    (total, purchase) => total + purchase.total,
    0
  );

  return {
    summary: {
      purchaseCount: purchases.length,
      totalPurchaseAmount,
    },
    purchases,
  };
};

const getInventoryReport = async () => {
  const now = new Date();

  // 30 days ahead threshold
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const products = await Product.find({
    isActive: true,
  })
    .populate("category", "name")
    .populate("supplier", "companyName")
    .sort({
      quantity: 1,
    });

  const totalQuantity = products.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total + product.quantity * product.purchasePrice,
    0
  );

  // Low stock products
  const lowStockProducts = products.filter(
    (product) => product.quantity <= product.reorderLevel
  );

  // Expired OR Expiring within 30 days
  const expiredProducts = products
    .filter(
      (product) =>
        product.expiryDate &&
        new Date(product.expiryDate) <= thirtyDaysFromNow &&
        product.quantity > 0
    )
    .map((product) => {
      const expiry = new Date(product.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isExpired = diffDays <= 0;

      return {
        ...product.toObject(),
        daysLeft: diffDays > 0 ? diffDays : 0,
        isExpired: isExpired,
      };
    })
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  const strictlyExpiredCount = expiredProducts.filter(
    (p) => p.isExpired
  ).length;

  const expiringSoonCount = expiredProducts.filter(
    (p) => !p.isExpired
  ).length;

  return {
    summary: {
      productCount: products.length,
      totalQuantity,
      inventoryValue,
      lowStockCount: lowStockProducts.length,
      expiredCount: expiredProducts.length,
      strictlyExpiredCount,
      expiringSoonCount,
    },
    lowStockProducts,
    expiredProducts,
    products,
  };
};

const getInventoryMovementReport = async (startDate, endDate) => {
  const { start, end } = getDateRange(startDate, endDate);

  const movements = await Inventory.find({
    createdAt: {
      $gte: start,$lte: end,
    },
  })
    .populate("product", "name barcode")
    .populate("createdBy", "firstName lastName")
    .sort({
      createdAt: -1,
    });

  const totalIn = movements
    .filter((movement) => movement.type === "IN")
    .reduce((total, movement) => total + movement.quantity, 0);

  const totalOut = movements
    .filter((movement) => movement.type === "OUT")
    .reduce((total, movement) => total + movement.quantity, 0);

  return {
    summary: {
      movementCount: movements.length,
      totalIn,
      totalOut,
    },
    movements,
  };
};

module.exports = {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getInventoryMovementReport,
};