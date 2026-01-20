const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || "mounir@soukboudouaou.com";
  const username = process.env.SUPER_ADMIN_USERNAME || "mounir";
  const fullName = process.env.SUPER_ADMIN_FULL_NAME || "Souk Super Admin";
  const password = process.env.SUPER_ADMIN_PASSWORD || "admin2025$";

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

  console.log("Super admin seeded:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
