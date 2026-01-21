const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const username = process.env.SUPER_ADMIN_USERNAME || "admin";
  const fullName = process.env.SUPER_ADMIN_FULL_NAME || "Super Admin";

  if (!email) throw new Error("SUPER_ADMIN_EMAIL is required for seeding.");
  if (!password) throw new Error("SUPER_ADMIN_PASSWORD is required for seeding.");

  console.log("Seeding super admin...");
  
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      username,
      fullName,
      passwordHash,
      role: "super_admin",
      verified: true,
      isActive: true,
    },
    create: {
      email,
      username,
      fullName,
      passwordHash,
      role: "super_admin",
      verified: true,
      isActive: true,
    },
  });

  console.log("Super admin seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
