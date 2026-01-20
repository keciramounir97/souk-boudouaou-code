const { PrismaClient } = require("@prisma/client");

/* ✅ SAFE PRISMA INIT - Prevents startup crashes on cPanel */
let prisma;
try {
  prisma = new PrismaClient();
  console.log("✅ Prisma Client initialized successfully");
} catch (err) {
  console.error("⚠️ Prisma init failed (startup-safe):", err.message);
  console.error("   App will start but database operations will fail.");
  console.error(
    '   Fix: Run "npm run prisma:generate" locally and upload node_modules'
  );
}

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL Connected");
  } catch (err) {
    console.error("DB Connection Error:", err);
    // In production, we might not want to exit immediately if DB is flaky
    const fatal = String(process.env.DB_CONNECT_FATAL || "").trim() === "1";
    if (fatal) throw err;
    return false;
  }
  return true;
}

module.exports = { prisma, connectDatabase };
