const { prisma } = require("../config/database");

/**
 * Root endpoint - Basic server status
 */
exports.getRoot = (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend running",
    version: "1.0.0",
  });
};

/**
 * Health check endpoint - Check server and database status
 */
exports.getHealth = async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      ok: true,
      db: "up",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(200).json({
      ok: true,
      db: "down",
      error: String(e?.message || e),
      timestamp: new Date().toISOString(),
    });
  }
};
