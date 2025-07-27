require("dotenv").config();

import { PrismaClient, UserRole } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error("❌ ADMIN_EMAIL environment variable is not set");
    console.log("Please set ADMIN_EMAIL in your environment variables");
    return;
  }

  console.log(`🔧 Looking for existing user: ${adminEmail}`);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingUser) {
      console.error(`❌ User with email ${adminEmail} not found in database`);
      console.log("Please ensure the user exists before running this command");
      console.log(
        "The user must sign in at least once to be created in the database"
      );
      return;
    }

    const adminUser = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: UserRole.ADMIN,
      },
    });

    console.log(`✅ Admin user updated: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
  } catch (error) {
    console.error("❌ Failed to update admin user:", error);
    throw error;
  }
}

async function main() {
  console.log("🌱 Starting admin setup...");
  await seedAdmin();
  console.log("🎉 Admin setup completed!");
}

main()
  .catch((e) => {
    console.error("❌ Admin setup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
