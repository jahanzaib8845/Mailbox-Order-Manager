import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", passwordHash: adminPassword, role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: { email: "customer@example.com", passwordHash: customerPassword, role: "CUSTOMER" },
  });

  console.log("Seeded users");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
