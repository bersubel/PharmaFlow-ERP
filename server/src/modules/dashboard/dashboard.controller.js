const dashboardService = require("./dashboard.service");

const getDashboardStats = async (req, res) => {
  try {
    const period = req.query.period || "weekly";
    const stats = await dashboardService.getDashboardStats(req.user, period);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve dashboard metrics",
    });
  }
};

module.exports = {
  getDashboardStats,
};